const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const legacyDir = path.join(__dirname, 'frontend-legacy');
const reactPagesDir = path.join(__dirname, 'frontend-react', 'src', 'pages');

if (!fs.existsSync(reactPagesDir)) {
    fs.mkdirSync(reactPagesDir, { recursive: true });
}

function camelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function styleStringToObject(styleStr) {
    const obj = {};
    const rules = styleStr.split(';');
    for (const rule of rules) {
        if (!rule.trim()) continue;
        const parts = rule.split(':');
        if (parts.length >= 2) {
            const key = camelCase(parts[0].trim());
            const val = parts.slice(1).join(':').trim();
            obj[key] = val;
        }
    }
    return obj;
}

function nodeToJsx(node) {
    if (node.nodeType === 3) { // Text node
        // Escape braces that are not inside JSX blocks (though there shouldn't be any in raw HTML)
        let text = node.textContent;
        // Basic escaping if needed, but usually fine
        return text.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
    }
    if (node.nodeType === 8) { // Comment
        return `{/* ${node.data} */}`;
    }
    if (node.nodeType === 1) { // Element
        const tag = node.tagName.toLowerCase();
        // Skip script tags
        if (tag === 'script') return '';

        let props = '';
        for (const attr of node.attributes) {
            let name = attr.name;
            let value = attr.value;

            // React specific renames
            if (name === 'class') name = 'className';
            else if (name === 'for') name = 'htmlFor';
            else if (name === 'tabindex') name = 'tabIndex';
            else if (name === 'readonly') name = 'readOnly';
            else if (name === 'maxlength') name = 'maxLength';
            else if (name.startsWith('on')) {
                // inline handlers are tricky in React, store as data attributes or ignore
                name = 'data-' + name;
            }

            // Fix invalid characters in attribute names (e.g. data attributes are fine)
            if (name === 'style') {
                const styleObj = styleStringToObject(value);
                props += ` style={${JSON.stringify(styleObj)}}`;
            } else if (name === 'value' && (tag === 'input' || tag === 'textarea' || tag === 'select')) {
                // React requires defaultValue for uncontrolled components
                props += ` defaultValue={${JSON.stringify(value)}}`;
            } else if (name === 'checked' && tag === 'input') {
                props += ` defaultChecked`;
            } else if (name === 'disabled' || name === 'required' || name === 'readOnly' || name === 'multiple') {
                 if(value === '' || value === name) props += ` ${name}`;
                 else props += ` ${name}="${value}"`;
            } else if (name === 'autoplay') {
                 props += ` autoPlay`;
            } else if (name === 'muted') {
                 props += ` muted`;
            } else if (name === 'playsinline') {
                 props += ` playsInline`;
            } else {
                // Escape quotes in values
                const escapedValue = value.replace(/"/g, '&quot;');
                props += ` ${name}="${escapedValue}"`;
            }
        }

        const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        
        if (voidElements.includes(tag)) {
            return `<${tag}${props} />`;
        } else {
            let childrenJsx = '';
            for (const child of node.childNodes) {
                childrenJsx += nodeToJsx(child);
            }
            // Some specific tag handling can go here
            if (tag === 'textarea') {
                // In React, textarea value is managed via value/defaultValue, not children
                // But if it has children, we convert it to defaultValue
                const text = childrenJsx.trim();
                if (text && !props.includes('defaultValue')) {
                     props += ` defaultValue="${text.replace(/"/g, '&quot;')}"`;
                }
                return `<textarea${props} />`;
            }
            return `<${tag}${props}>${childrenJsx}</${tag}>`;
        }
    }
    return '';
}

function toPascalCase(str) {
    return str.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

const files = fs.readdirSync(legacyDir).filter(f => f.endsWith('.html'));

for (const file of files) {
    const filePath = path.join(legacyDir, file);
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    
    const dom = new JSDOM(htmlContent);
    const body = dom.window.document.body;
    
    // Extract everything inside body, but for index.html maybe ignore the loader/nav?
    // The user wants EXACT SAME TO SAME.
    
    let jsxContent = '';
    for (const child of body.childNodes) {
        jsxContent += nodeToJsx(child);
    }
    
    // Convert base name
    const baseName = path.basename(file, '.html');
    let componentName = toPascalCase(baseName);
    if (componentName === 'Index') componentName = 'Landing';

    const reactFileContent = `import React, { useEffect } from 'react';

const ${componentName} = () => {
    useEffect(() => {
        // Any original inline scripts or logic can be ported here
    }, []);

    return (
        <React.Fragment>
            ${jsxContent}
        </React.Fragment>
    );
};

export default ${componentName};
`;

    const outPath = path.join(reactPagesDir, `${componentName}.jsx`);
    fs.writeFileSync(outPath, reactFileContent, 'utf-8');
    console.log(`Converted ${file} to ${componentName}.jsx`);
}
