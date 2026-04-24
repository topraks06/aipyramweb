const key = 'AIzaSyBs1Ks2jeH2AXxTu8NqNMFeYQdsHA41Ztg';

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
.then(async res => {
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}).catch(err => console.error(err));
