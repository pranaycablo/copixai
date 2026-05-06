import os
import re
from html.parser import HTMLParser

class JSXConverter(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.output = []
        self.void_elements = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

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
                # escape single quotes
                val = val.replace("'", "\\'")
                style_dict.append(f"'{key}': '{val}'")
        return "{" + ", ".join(style_dict) + "}"

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.output.append(f'<{tag}>')
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
                # escape double quotes
                escaped_val = value.replace('"', '&quot;')
                props.append(f'{name}="{escaped_val}"')

        props_str = " " + " ".join(props) if props else ""
        if tag in self.void_elements:
            self.output.append(f'<{tag}{props_str} />')
        else:
            self.output.append(f'<{tag}{props_str}>')

    def handle_endtag(self, tag):
        if tag not in self.void_elements:
            self.output.append(f'</{tag}>')

    def handle_data(self, data):
        # Escape curly braces for JSX
        escaped = data.replace('{', '&#123;').replace('}', '&#125;')
        self.output.append(escaped)

    def handle_comment(self, data):
        self.output.append(f"{{/* {data} */}}")
        
    def handle_entityref(self, name):
        self.output.append(f"&{name};")
        
    def handle_charref(self, name):
        self.output.append(f"&#{name};")

    def handle_decl(self, decl):
        pass

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

os.makedirs(react_pages_dir, exist_ok=True)

for filename in os.listdir(legacy_dir):
    if not filename.endswith('.html'):
        continue
        
    with open(os.path.join(legacy_dir, filename), 'r', encoding='utf-8') as f:
        html_content = f.read()
        
    body_content = extract_body(html_content)
    
    parser = JSXConverter()
    parser.feed(body_content)
    jsx_content = "".join(parser.output)
    
    base_name = os.path.splitext(filename)[0]
    component_name = to_pascal_case(base_name)
    if component_name == 'Index':
        component_name = 'Landing'
        
    # We must wrap it in a fragment because multiple roots might exist
    react_code = f"""import React, {{ useEffect }} from 'react';

const {component_name} = () => {{
    useEffect(() => {{
        // Add original JS logic here if needed
    }}, []);

    return (
        <React.Fragment>
            {jsx_content}
        </React.Fragment>
    );
}};

export default {component_name};
"""
    
    out_path = os.path.join(react_pages_dir, f"{component_name}.jsx")
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(react_code)
    print(f"Converted {filename} to {component_name}.jsx")
