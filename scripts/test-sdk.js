const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyDtjs6KRGfwmAvib2KAI19ednV9rPvikUw');

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Merhaba");
    console.log(result.response.text());
  } catch (e) {
    console.error("SDK Error:", e);
  }
}
test();
