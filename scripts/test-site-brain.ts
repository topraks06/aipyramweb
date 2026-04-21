const fetch = require('node-fetch');

async function checkSiteBrain() {
  console.log("Checking Site Brain fallback response...");
  const { GET } = require('./src/app/api/site-brain/route');
  
  // mock request
  const mockReq = { url: 'http://localhost/api/site-brain' };
  try {
     const res = await GET(mockReq as any);
     const json = await res.json();
     console.log("SITE BRAIN RESPONSE DATA MARKET:");
     console.log(JSON.stringify(json.data.market, null, 2));
     console.log("------------------------");
     console.log("TRADE OPPS COUNT:", json.data.trade_opportunities.opportunities.length);
  } catch(e) {
     console.error(e);
  }
}
checkSiteBrain();
