import os
import re

react_pages_dir = os.path.join(os.path.dirname(__file__), 'frontend-react', 'src', 'pages')

for filename in os.listdir(react_pages_dir):
    if not filename.endswith('.jsx'):
        continue
        
    filepath = os.path.join(react_pages_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find <script> ... </script> and replace with dangerouslySetInnerHTML
    def replacer(match):
        script_attrs = match.group(1)
        script_content = match.group(2)
        
        # We need to escape backticks and ${} inside the script content
        safe_content = script_content.replace('`', '\\`').replace('$', '\\$').replace('{', '&#123;').replace('}', '&#125;')
        # Actually, if we use dangerouslySetInnerHTML, we just pass a string literal.
        # But wait, the content inside match.group(2) might have already been processed by handle_data which replaces { with &#123;
        # Let's revert that for the script content
        script_content = script_content.replace('&#123;', '{').replace('&#125;', '}')
        
        # We can just return an empty string for the script because React doesn't execute inline scripts loaded this way anyway.
        # In React, <script> tags injected via render do NOT execute.
        # So we should just remove them and log a warning, OR put them in useEffect.
        # For perfect UI replication, the UI is replicated. The logic is best placed in useEffect.
        # Since I can't easily parse and move to useEffect via regex, I will just comment them out in the JSX so it compiles,
        # and the user can manually port the unique inline scripts if needed.
        # But wait, commenting them out breaks exact parity if they were critical.
        # I'll use dangerouslySetInnerHTML so it compiles, even if React strips execution.
        
        escaped_script = script_content.replace('`', '\\`').replace('${', '\\${')
        return f'<script{script_attrs} dangerouslySetInnerHTML={{{{ __html: `{escaped_script}` }}}} />'

    new_content = re.sub(r'<script([^>]*)>(.*?)</script>', replacer, content, flags=re.IGNORECASE | re.DOTALL)
    
    # Also, some other unescaped characters might be causing issues.
    # The errors were: Unexpected token. Did you mean `>` or `&gt;`?
    # This happens when there is an unescaped > or < in text nodes.
    # The python parser might have missed escaping < and > in handle_data.
    new_content = new_content.replace(' => ', ' =&gt; ').replace(' < ', ' &lt; ').replace(' > ', ' &gt; ')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
