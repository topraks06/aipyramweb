const fs = require('fs');
const path = require('path');

const replacements = {
  'tenant-config': 'sovereign-config',
  'useTenantAuth': 'useSovereignAuth',
  'tenant-perde': 'node-perde',
  'tenant-hometex': 'node-hometex',
  'tenant-vorhang': 'node-vorhang',
  'TenantId': 'SovereignNodeId',
  'TenantConfig': 'SovereignNodeConfig',
  'getTenant': 'getNode',
  'getAllTenantIds': 'getAllNodeIds',
  'tenantHasFeature': 'nodeHasFeature',
  'resolveTenantFromHost': 'resolveNodeFromHost',
  'resolveTenantFromDomain': 'resolveNodeFromDomain',
  'TenantFeatures': 'SovereignNodeFeatures',
  'TenantNavLink': 'SovereignNavLink',
  'tenantId': 'nodeId',
  '/admin/tenants': '/admin/network',
  'config/tenants': 'lib/sovereign-config',
  'TenantSelector': 'NodeSelector',
  'tenant': 'node',
  'Tenant': 'Node'
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceAll(str) {
  let res = str;
  const keys = Object.keys(replacements).sort((a,b) => b.length - a.length);
  for (const key of keys) {
      let regexStr = escapeRegExp(key);
      if (key.match(/^[a-zA-Z]+$/)) {
         regexStr = '\\b' + regexStr + '\\b';
      }
      res = res.replace(new RegExp(regexStr, 'g'), replacements[key]);
  }
  return res;
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = replaceAll(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated ' + fullPath);
      }
    }
  }
}

walk('c:/Users/MSI/Desktop/aipyramweb/src');
console.log('Done');
