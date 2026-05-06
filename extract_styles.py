import os
import re

legacy_dir = os.path.join(os.path.dirname(__file__), 'frontend')
out_css = os.path.join(os.path.dirname(__file__), 'frontend-react', 'src', 'assets', 'legacy-inline.css')

all_styles = []

for filename in os.listdir(legacy_dir):
    if not filename.endswith('.html'): continue
    
    with open(os.path.join(legacy_dir, filename), 'r', encoding='utf-8', errors='replace') as f:
        html = f.read()
        
    styles = re.findall(r'<style[^>]*>(.*?)</style>', html, re.IGNORECASE | re.DOTALL)
    for s in styles:
        all_styles.append(f"/* From {filename} */\n{s}\n")

with open(out_css, 'w', encoding='utf-8') as f:
    f.write("\n".join(all_styles))

print("Extracted all inline styles.")
