import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/wallet/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: 'mock-mimar-user-1234', SovereignNodeId: 'icmimar' })
  });
  const text = await res.text();
  console.log('STATUS:', res.status);
  console.log('RESPONSE:', text);
}
test();
