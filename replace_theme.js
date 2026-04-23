const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const adminAppFiles = walkSync('src/app/admin');
const adminCompFiles = walkSync('src/components/admin');
const allFiles = [...adminAppFiles, ...adminCompFiles];

const replacements = [
  { search: /bg-black\/40/g, replace: 'bg-white/80' },
  { search: /bg-black\/50/g, replace: 'bg-white' },
  { search: /bg-black\/60/g, replace: 'bg-slate-100/60' },
  { search: /bg-black\/80/g, replace: 'bg-white/90' },
  { search: /bg-black/g, replace: 'bg-white' },
  { search: /bg-\[\#050505\]/g, replace: 'bg-slate-50' },
  { search: /bg-\[\#0A0A0A\]/g, replace: 'bg-white' },
  { search: /bg-zinc-900\/95/g, replace: 'bg-slate-50/95' },
  { search: /bg-zinc-900/g, replace: 'bg-slate-50' },
  { search: /bg-zinc-800/g, replace: 'bg-slate-100' },
  { search: /border-zinc-800/g, replace: 'border-slate-200' },
  { search: /border-zinc-700/g, replace: 'border-slate-300' },
  { search: /border-white\/10/g, replace: 'border-slate-200' },
  { search: /border-white\/5/g, replace: 'border-slate-100' },
  { search: /border-white\/30/g, replace: 'border-slate-300' },
  { search: /text-white/g, replace: 'text-slate-900' },
  { search: /text-zinc-100/g, replace: 'text-slate-800' },
  { search: /text-zinc-200/g, replace: 'text-slate-800' },
  { search: /text-zinc-300/g, replace: 'text-slate-700' },
  { search: /text-zinc-400/g, replace: 'text-slate-600' },
  { search: /text-zinc-500/g, replace: 'text-slate-500' },
  { search: /bg-white\/5/g, replace: 'bg-slate-100' },
  { search: /bg-white\/10/g, replace: 'bg-slate-200' },
  { search: /bg-white\/\[0\.02\]/g, replace: 'bg-slate-50' },
  { search: /bg-white\/\[0\.01\]/g, replace: 'bg-slate-50' },
  { search: /text-red-400/g, replace: 'text-red-600' },
  { search: /text-blue-400/g, replace: 'text-blue-600' },
  { search: /text-emerald-400/g, replace: 'text-emerald-600' }
];

let modifiedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const rep of replacements) {
    content = content.replace(rep.search, rep.replace);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log('Modified: ' + file);
  }
}

console.log('Total files modified: ' + modifiedCount);
