const fs = require('fs');

function replaceFile(path, search, replacement) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(search, replacement);
    fs.writeFileSync(path, content, 'utf8');
  }
}

// 1. market-data
replaceFile('c:/Users/MSI/Desktop/aipyramweb/src/app/api/cron/market-data/route.ts', 
  /executeMasterAgent\(\s*\{/g, 
  'executeMasterAgent("trtex", {'
);

// 2. trtex-news
replaceFile('c:/Users/MSI/Desktop/aipyramweb/src/app/api/cron/trtex-news/route.ts', 
  /executeMasterAgent\(masterState\)/g, 
  'executeMasterAgent("trtex", masterState)'
);

// 3. feed route
replaceFile('c:/Users/MSI/Desktop/aipyramweb/src/app/api/v1/master/trtex/feed/route.ts', 
  /publishers\/trtex-publisher/g, 
  'publishers/universal-publisher'
);

// 4. generate-live-news
replaceFile('c:/Users/MSI/Desktop/aipyramweb/src/core/tests/generate-live-news.ts', 
  /executeMasterAgent\(systemState/g, 
  'executeMasterAgent("trtex", systemState'
);

// 5. test-master
replaceFile('c:/Users/MSI/Desktop/aipyramweb/src/core/tests/test-master.ts', 
  /executeMasterAgent\(systemState/g, 
  'executeMasterAgent("trtex", systemState'
);

console.log('Fixed TS errors!');
