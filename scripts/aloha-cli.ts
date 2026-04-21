import { config } from 'dotenv';
config({ path: '.env.local' });

async function runAloha() {
  const prompt = "Firestore trtex_news koleksiyonundaki SADECE 1 adet haberi (ilk haberi) çek. Bu haberin başlığını kullanarak, src/core/swarm/master-photographer.ts'teki 'MasterPhotographer.buildMasterPhotographerPrompt' fonksiyonu ile o haber için muazzam bir resim promptu ve negative_prompt elde et. Ardından Gemini Vertex AI (imagen-3.0-generate-001) modelini doğrudan kullanarak (veya geçici bir script yazıp koşturarak) bu resimi üret, Firebase bucket'a public olarak yükle ve trtex_news içindeki o haberin image_url'ini güncelle. KULLANACAĞIN MODEL: imagen-3.0-generate-001";

  console.log(`[ALOHA CLI] Emir Yollanıyor: "${prompt}"`);

  const res = await fetch('http://localhost:3000/api/aloha/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'founder',
      message: prompt,
      systemContext: { activeDomain: 'trtex.com', userRole: 'Founder' },
      stream: true,
      history: []
    })
  });

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const json = JSON.parse(line.replace('data: ', ''));
          if (json.type === 'tool_start') {
             console.log(`\n⚙️ ALOHA ÇALIŞTIRIYOR: ${json.tool}`);
          } else if (json.type === 'tool_result') {
             console.log(`✅ SONUÇ: ${json.result?.substring(0, 500)}...`);
          } else if (json.type === 'status') {
             console.log(`⏳ ${json.message}`);
          } else if (json.type === 'final') {
             console.log(`\n🎯 ALOHA RAPORU: ${json.text}`);
          } else if (json.type === 'error') {
             console.error(`\n❌ ALOHA HATASI: ${json.message}`);
          }
        } catch { /* skip */ }
      }
    }
  }
}

runAloha();
