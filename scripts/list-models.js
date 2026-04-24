const key = 'AIzaSyDtjs6KRGfwmAvib2KAI19ednV9rPvikUw';
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
      console.log("AVAILABLE GENERATE MODELS:");
      generateModels.forEach(m => console.log(m.name));
    } else {
      console.log(data);
    }
  }).catch(err => console.error(err));
