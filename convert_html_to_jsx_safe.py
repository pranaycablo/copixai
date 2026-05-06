import os
import re
from html.parser import HTMLParser

class JSXConverter(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.output = []
        self.stack = []
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
                val = val.replace("'", "\\'")
                style_dict.append(f"'{key}': '{val}'")
        return "{" + ", ".join(style_dict) + "}"

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.output.append(f"<{tag}")
            for name, value in attrs:
                self.output.append(f' {name}="{value}"' if value else f' {name}')
            self.output.append(">")
            self.stack.append(tag)
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
        if tag not in self.void_elements:
            # Pop from stack until we find the matching tag
            # If not found, ignore it
            if tag in self.stack:
                while self.stack:
                    popped = self.stack.pop()
                    self.output.append(f'</{popped}>')
                    if popped == tag:
                        break

    def handle_data(self, data):
        # Escape curly braces for JSX
        escaped = data.replace('{', '&#123;').replace('}', '&#125;')
        # We also need to escape < and > unless inside a script
        if not self.stack or self.stack[-1] != 'script':
            escaped = escaped.replace('<', '&lt;').replace('>', '&gt;')
        self.output.append(escaped)

    def handle_comment(self, data):
        self.output.append(f"{{/* {data} */}}")
        
    def handle_entityref(self, name):
        self.output.append(f"&{name};")
        
    def handle_charref(self, name):
        self.output.append(f"&#{name};")

    def finish(self):
        # Close any remaining tags
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

os.makedirs(react_pages_dir, exist_ok=True)

for filename in os.listdir(legacy_dir):
    if not filename.endswith('.html'):
        continue
        
    with open(os.path.join(legacy_dir, filename), 'r', encoding='utf-8') as f:
        html_content = f.read()
        
    body_content = extract_body(html_content)
    
    parser = JSXConverter()
    parser.feed(body_content)
    parser.finish()
    jsx_content = "".join(parser.output)
    
    # Fix the script tags with dangerouslySetInnerHTML
    def replacer(match):
        script_attrs = match.group(1)
        script_content = match.group(2)
        # Revert escaped chars inside script
        script_content = script_content.replace('&#123;', '{').replace('&#125;', '}')
        escaped_script = script_content.replace('`', '\\`').replace('${', '\\${')
        return f'<script{script_attrs} dangerouslySetInnerHTML={{{{ __html: `{escaped_script}` }}}} />'
        
    jsx_content = re.sub(r'<script([^>]*)>(.*?)</script>', replacer, jsx_content, flags=re.IGNORECASE | re.DOTALL)
    
    base_name = os.path.splitext(filename)[0]
    component_name = to_pascal_case(base_name)
    if component_name == 'Index':
        component_name = 'Landing'
        
    react_code = f"""import React, {{ useEffect }} from 'react';

const {component_name} = () => {{
    useEffect(() => {{
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
