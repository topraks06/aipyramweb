const key = 'AIzaSyBs1Ks2jeH2AXxTu8NqNMFeYQdsHA41Ztg';

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${key}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Merhaba' }] }]
  })
}).then(async res => {
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}).catch(err => console.error(err));
