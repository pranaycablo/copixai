import os
import re
from html.parser import HTMLParser

class JSXConverter(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.output = []
        self.stack = []
        self.scripts = []
        self.void_elements = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
        self.in_script = False
        self.current_script = []

    def camel_case(self, s):
        parts = s.split('-')
        return parts[0] + ''.join(p.capitalize() for p in parts[1:])

    def style_to_dict(self, style_str):
        rules = style_str.split(';')
        style_dict = []
        for rule in rules:
            if not rule.strip(): continue
            parts = rule.split(':', 1)
            if len(parts) == 2:
                key = self.camel_case(parts[0].strip())
                val = parts[1].strip()
                val = val.replace("'", "\\'")
                style_dict.append(f"'{key}': '{val}'")
        return "{" + ", ".join(style_dict) + "}"

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            # Check if it has a src
            has_src = any(name == 'src' for name, val in attrs)
            if not has_src:
                self.in_script = True
                self.current_script = []
            else:
                # keep external script tags (though React won't run them, they should be in index.html)
                pass
            return

        props = []
        for name, value in attrs:
            if name == 'class': name = 'className'
            elif name == 'for': name = 'htmlFor'
            elif name == 'tabindex': name = 'tabIndex'
            elif name == 'readonly': name = 'readOnly'
            elif name == 'maxlength': name = 'maxLength'
            elif name == 'autoplay': name = 'autoPlay'
            elif name == 'playsinline': name = 'playsInline'
            elif name.startswith('on'):
                name = 'data-' + name

            if name == 'style' and value:
                props.append(f"style={{{self.style_to_dict(value)}}}")
            elif name in ['disabled', 'required', 'readOnly', 'multiple', 'checked', 'muted', 'autoPlay']:
                if value is None or value == name or value == '':
                    if name == 'checked' and tag == 'input':
                        props.append('defaultChecked')
                    else:
                        props.append(name)
                else:
                    props.append(f"{name}='{value.replace(chr(39), chr(92)+chr(39))}'")
            elif value is None:
                props.append(name)
            else:
                if name == 'value' and tag in ['input', 'textarea', 'select']:
                    name = 'defaultValue'
                escaped_val = value.replace('"', '&quot;')
                props.append(f'{name}="{escaped_val}"')

        props_str = " " + " ".join(props) if props else ""
        if tag in self.void_elements:
            self.output.append(f'<{tag}{props_str} />')
        else:
            self.output.append(f'<{tag}{props_str}>')
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag == 'script':
            if self.in_script:
                self.in_script = False
                self.scripts.append("".join(self.current_script))
            return

        if tag not in self.void_elements:
            if tag in self.stack:
                while self.stack:
                    popped = self.stack.pop()
                    self.output.append(f'</{popped}>')
                    if popped == tag:
                        break

    def handle_data(self, data):
        if self.in_script:
            self.current_script.append(data)
            return

        escaped = data.replace('{', '&#123;').replace('}', '&#125;')
        escaped = escaped.replace('<', '&lt;').replace('>', '&gt;')
        self.output.append(escaped)

    def handle_comment(self, data):
        self.output.append(f"{{/* {data} */}}")
        
    def handle_entityref(self, name):
        if not self.in_script:
            self.output.append(f"&{name};")
        
    def handle_charref(self, name):
        if not self.in_script:
            self.output.append(f"&#{name};")

    def finish(self):
        while self.stack:
            popped = self.stack.pop()
            self.output.append(f'</{popped}>')

def to_pascal_case(s):
    words = re.split(r'[-_]', s)
    return ''.join(w.capitalize() for w in words)

def extract_body(html_content):
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.IGNORECASE | re.DOTALL)
    if body_match:
        return body_match.group(1)
    return html_content

legacy_dir = os.path.join(os.path.dirname(__file__), 'frontend')
react_pages_dir = os.path.join(os.path.dirname(__file__), 'frontend-react', 'src', 'pages')
assets_dir = os.path.join(os.path.dirname(__file__), 'frontend-react', 'src', 'assets')

os.makedirs(react_pages_dir, exist_ok=True)
os.makedirs(os.path.join(react_pages_dir, 'admin'), exist_ok=True)

all_styles = []
routes = []

def process_file(filepath, out_dir, route_prefix=""):
    filename = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        html_content = f.read()
        
    styles = re.findall(r'<style[^>]*>(.*?)</style>', html_content, re.IGNORECASE | re.DOTALL)
    for s in styles:
        all_styles.append(f"/* From {filename} */\n{s}\n")
        
    body_content = extract_body(html_content)
    
    parser = JSXConverter()
    parser.feed(body_content)
    parser.finish()
    jsx_content = "".join(parser.output)
    
    # Process scripts
    combined_script = "\n".join(parser.scripts)
    
    js_wrapper = f"""
    try {{
        const _originalOnload = window.onload;
        let _onloadHandler = null;
        Object.defineProperty(window, 'onload', {{
            get: () => _onloadHandler,
            set: (fn) => {{ _onloadHandler = fn; if(fn) setTimeout(fn, 100); }},
            configurable: true
        }});
        
        const _originalAddEventListener = window.addEventListener;
        window.addEventListener = function(type, listener, options) {{
            if (type === 'load' || type === 'DOMContentLoaded') {{
                setTimeout(listener, 100);
            }} else {{
                _originalAddEventListener.call(window, type, listener, options);
            }}
        }};

        {combined_script}

        window.onload = _originalOnload;
        window.addEventListener = _originalAddEventListener;
    }} catch (e) {{ console.error("Error in legacy script:", e); }}
    """

    base_name = os.path.splitext(filename)[0]
    component_name = to_pascal_case(base_name)
    if component_name == 'Index':
        component_name = 'Landing'
        
    react_code = f"""import React, {{ useEffect }} from 'react';

const {component_name} = () => {{
    useEffect(() => {{
        {js_wrapper}
    }}, []);

    return (
        <React.Fragment>
            {jsx_content}
        </React.Fragment>
    );
}};

export default {component_name};
"""
    
    out_path = os.path.join(out_dir, f"{component_name}.jsx")
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(react_code)
    print(f"Converted {filepath} to {component_name}.jsx")
    
    # Store route info
    route_path = f"/{base_name}" if base_name != "index" else "/"
    if route_prefix:
        route_path = f"/{route_prefix}/{base_name}" if base_name != "index" else f"/{route_prefix}"
        
    import_path = f"./pages/{route_prefix}/{component_name}" if route_prefix else f"./pages/{component_name}"
    routes.append((route_path, component_name, import_path))

# Process frontend/
for filename in os.listdir(legacy_dir):
    if filename.endswith('.html'):
        process_file(os.path.join(legacy_dir, filename), react_pages_dir, "")

# Process frontend/admin/
admin_dir = os.path.join(legacy_dir, 'admin')
if os.path.exists(admin_dir):
    for filename in os.listdir(admin_dir):
        if filename.endswith('.html'):
            process_file(os.path.join(admin_dir, filename), os.path.join(react_pages_dir, 'admin'), "admin")

with open(os.path.join(assets_dir, 'legacy-inline.css'), 'w', encoding='utf-8') as f:
    f.write("\n".join(all_styles))

# Generate App.jsx
app_jsx = f"""import React from 'react';
import {{ Routes, Route }} from 'react-router-dom';

{chr(10).join([f"import {r[1]} from '{r[2]}';" for r in routes])}

function App() {{
  return (
    <Routes>
      {chr(10).join([f'<Route path="{r[0]}" element={{<{r[1]} />}} />' for r in routes])}
    </Routes>
  );
}}

export default App;
"""

with open(os.path.join(os.path.dirname(__file__), 'frontend-react', 'src', 'App.jsx'), 'w', encoding='utf-8') as f:
    f.write(app_jsx)

print("Finished conversion!")
