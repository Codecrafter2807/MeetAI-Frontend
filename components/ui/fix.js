const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => (f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.js')) && f !== 'fix.js');

function fixImports(code) {
  // 1. Remove full "import type { ... } from '...'" lines
  code = code.replace(/^import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm, '');

  // 2. Remove "import type Something from '...'" lines
  code = code.replace(/^import\s+type\s+\w.*?from\s+['"][^'"]+['"];?\s*$/gm, '');

  // 3. Remove inline `type Foo` entries inside import braces
  // e.g. import { cva, type VariantProps } -> import { cva }
  // e.g. import { type Foo, type Bar } -> remove whole line
  code = code.replace(/^(import\s*\{)([^}]*)\}(\s*from\s*['"][^'"]+['"];?)$/gm, (match, start, names, end) => {
    // Remove entries that start with "type "
    const parts = names.split(',').map(s => s.trim()).filter(s => !s.startsWith('type ') && s !== '');
    if (parts.length === 0) return ''; // all were type imports, remove entire line
    return `${start} ${parts.join(', ')} }${end}`;
  });

  // 4. Remove TypeScript type annotations on variables: `: SomeType` before `=`
  // e.g.  const x: ChartConfig = ...
  code = code.replace(/:\s*[A-Z]\w*(<[^>]*>)?\s*(?==)/g, ' ');

  // 5. Remove function parameter type annotations: (param: Type)
  // Simple types: string, number, boolean, any, void, never, unknown, null, undefined
  code = code.replace(/(\w+)\s*\?\s*:\s*([\w<>\[\]|& ]+?)(?=[,)])/g, '$1');
  code = code.replace(/(\w+)\s*:\s*(string|number|boolean|any|void|never|unknown|null|undefined|object|React\.\w+)(\[\])?(?=[,)\s=])/g, '$1');

  // 6. Remove return type annotations: ): Type => or ): Type {
  code = code.replace(/\)\s*:\s*[\w<>\[\]|& ]+\s*(?==>|\{)/g, ') ');

  // 7. Remove as Type assertions: ) as Type or value as Type
  code = code.replace(/\s+as\s+[A-Z]\w*(<[^>]+>)?/g, '');

  // 8. Remove generic type params from forwardRef, etc.
  code = code.replace(/React\.forwardRef<[^>]+>/g, 'React.forwardRef');
  code = code.replace(/\bforwardRef<[^>]+>/g, 'forwardRef');
  code = code.replace(/React\.createContext<[^>]+>/g, 'React.createContext');
  code = code.replace(/\bcreateContext<[^>]+>/g, 'createContext');
  code = code.replace(/useRef<[^>]+>/g, 'useRef');
  code = code.replace(/useState<[^>]+>/g, 'useState');
  code = code.replace(/useCallback<[^>]+>/g, 'useCallback');
  code = code.replace(/useMemo<[^>]+>/g, 'useMemo');
  code = code.replace(/useContext<[^>]+>/g, 'useContext');
  code = code.replace(/useReducer<[^>]+>/g, 'useReducer');

  // 9. Remove interface declarations (multiline)
  code = code.replace(/(export\s+)?interface\s+\w+(\s+extends\s+[^{]+)?\s*\{[^}]*\}/gs, '');

  // 10. Remove type alias declarations
  code = code.replace(/(export\s+)?type\s+\w+\s*(<[^>]*>)?\s*=\s*[\s\S]*?;/g, '');

  // 11. Remove non-null assertion operator (trailing !)
  // only after identifiers/brackets, not in != or !==
  code = code.replace(/(\w|\]|\))\!(?!=)/g, '$1');

  // 12. Remove satisfies keyword
  code = code.replace(/\s+satisfies\s+[\w<>\[\]|& .,?{}]+/g, '');

  // 13. Clean up extra blank lines
  code = code.replace(/\n{3,}/g, '\n\n');

  return code;
}

let count = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const fixed = fixImports(content);
  fs.writeFileSync(filePath, fixed, 'utf8');
  console.log(`Fixed: ${file}`);
  count++;
}
console.log(`\nDone! Fixed ${count} files.`);
