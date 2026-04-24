const key = 'AIzaSyDtjs6KRGfwmAvib2KAI19ednV9rPvikUw';

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Merhaba' }] }]
  })
}).then(async res => {
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}).catch(err => console.error(err));
