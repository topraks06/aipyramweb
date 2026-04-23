const fs = require('fs');
const path = require('path');

function replaceAll(str) {
  let res = str;
  // Handle specific paths first
  res = res.replace(/\/admin\/tenants/g, '/admin/network');
  res = res.replace(/config\/tenants/g, 'lib/sovereign-config');
  res = res.replace(/TenantSelector/g, 'NodeSelector');
  
  // Aggressive case-preserving replace
  // match 'tenant' -> 'node'
  res = res.replace(/tenant/g, 'node');
  // match 'Tenant' -> 'Node'
  res = res.replace(/Tenant/g, 'Node');
  // match 'TENANT' -> 'NODE'
  res = res.replace(/TENANT/g, 'NODE');
  
  return res;
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('.next') && !fullPath.includes('node_modules')) {
        walk(fullPath);
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = replaceAll(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated ' + fullPath);
      }
    }
  }
}

walk('c:/Users/MSI/Desktop/aipyramweb/packages');
console.log('Done aggressive replace');
