import os
import re

react_pages_dir = os.path.join(os.path.dirname(__file__), 'frontend-react', 'src', 'pages')

for filename in os.listdir(react_pages_dir):
    if not filename.endswith('.jsx'):
        continue
        
    filepath = os.path.join(react_pages_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert the arrow functions
    content = content.replace(' =&gt; ', ' => ')
    # Revert ' &lt; ' and ' &gt; ' outside of scripts? The only place it failed originally was inside the scripts.
    content = content.replace(' &lt; ', ' < ').replace(' &gt; ', ' > ')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
