# MASTER INTEGRATION PROMPT: PERDE.AI SOVEREIGN AI ECOSYSTEM UPGRADE (Q2 2026)

> **TARİH:** 25 Nisan 2026 (Q2 Güncellemesi: 29 Nisan 2026)  
> **YAZAN:** Hakan Bey (Kurucu)  
> **DURUM:** ✅ FAZ 0-1 TAMAMLANDI | FAZ 2-4 DEVAM EDİYOR  
> **KURAL:** Bu vizyon projenin nihai teknolojik hedefidir. Ajanlar bu belgedeki teknolojileri entegre etmeden mimariyi "tamamlandı" sayamazlar.

---

## 1. ARCHITECTURE UPGRADE (Deep Research Max & Infographics)
- ✅ **'Orchestrator' ajanı** Gemini 3.1 Pro 'Deep Research Max' modeline taşındı (`aiClient.ts` → DEEP_MODEL).
- **'Accounting' ve 'Supply Chain'** ajanlarının çıktıları düz metin değil, 'Native Infographics' (Nano Banana/HTML) formatında görselleştirilecek. Arayüz bu çıktıları dinamik render edecek.

## 2. DATA RETRIEVAL (RAG Cross Corpus Retrieval)
- **'Local Agent' ve 'Style Advisor'** için Vertex AI 'RAG Cross Corpus Retrieval' (AsyncRetrieveContexts API) yapısı kurulacak.
- Bağlam (Context) havuzuna sadece lokal DB değil; Google Drive (oda fotoğrafları) ve Gmail (geçmiş teklifler) kaynakları dinamik olarak dahil edilecek.

## 3. AGENTIC CAPABILITIES (A2A Protocol / Agent Platform)
- ✅ **Agent Bus'a A2A Protocol adaptörü** eklendi (`agentBus.ts` → `transfer_to_agent()`)
- ✅ **Agent Identity** — Her ajana kriptografik SHA-256 ID atanıyor
- ✅ **Execution Trace** — Tam denetlenebilir ajan akış izleme
- **'Supply Chain' ajanına** 'Computer Use' yeteneği tanımlanacak.
- ✅ **CrawlerAgent** düzeltildi — merkezi `alohaAI.generate()` üzerinden çalışıyor

## 4. MULTIMODAL SEARCH (Gemini Embedding-2)
- ✅ Embedding modeli `gemini-embedding-2` (GA, 3072-boyutlu, multimodal) olarak güncellendi (`aiClient.ts`)
- ✅ Eski `gemini-embedding-exp-03-07` fallback olarak korundu
- ✅ `rag.ts` ve `semanticGraph.ts` merkezi `alohaAI.generateEmbedding()` kullanıyor
- Görsel arama (Texture Zoom) servisi yeni multimodal embedding yapısına göre refactor edilecek.

## 5. GÖRSEL ÜRETIM (Gemini 3.1 Flash Image — Nano Banana 2)
- ✅ `IMAGE_MODEL` → `gemini-3.1-flash-image-preview` (3x hızlı, 4K, 14 referans obje, karakter tutarlılığı)
- ✅ Eski `imagen-3.0-generate-002` fallback olarak korundu
- TRTex haber görselleri ve Perde.ai render'ları yeni modeli kullanıyor

## 6. PERFORMANCE & VOICE (Gemini 3.1 Flash TTS)
- **ConciergeWidget** ses motoru 'Gemini 3.1 Flash TTS' API'sine bağlanarak çok düşük gecikmeli, steerable (yönlendirilebilir) sesli asistan deneyimi sağlanacak.
- 'Real Vision' (Gemini Vision) entegrasyonuyla oda analiz (render) süresini 5 saniyenin altına indirecek asenkron işlem kuyruğu optimize edilecek.

## 7. LONG-RUNNING AGENTS (Google Cloud Next '26 — YENİ)
- İhale takibi, tedarik zinciri izleme gibi günlerce süren otonom görevler için Long-running Agent altyapısı kurulacak.
- Agent Inbox (native) ile ajan yönetim merkezi modernize edilecek.

---

## ⛔ MİMARİ KURAL
> **ÖNEMLİ:** Kod yazarken 'Dumb Client' mimarisini bozma; tüm ağır iş zekası Node.js/Daemon tarafında (Master API) çözülmeli, frontend sadece sonucu render etmeli. Bu yapılandırma ile projenin sadece "konuşan" değil, gerçekten "araştıran ve uygulayan" (Agentic AI) vizyonuna tam uyum sağlanacaktır.

## 📊 Q2 2026 GEÇİŞ DURUMU (29 Nisan 2026)
| Bileşen | Eski | Yeni | Durum |
|---------|------|------|-------|
| Görsel Model | `imagen-3.0-generate-002` | `gemini-3.1-flash-image-preview` | ✅ |
| Embedding Model | `gemini-embedding-exp-03-07` | `gemini-embedding-2` (GA, 3072-dim) | ✅ |
| Ajan İletişimi | Custom agentBus | A2A Protocol + `transfer_to_agent()` | ✅ |
| Agent Identity | Yok | SHA-256 kriptografik ID | ✅ |
| Execution Trace | Yok | Tam denetlenebilir akış izleme | ✅ |
| crawlerAgent | Kırık (`alohaAI.models`) | Düzeltildi (`alohaAI.generate()`) | ✅ |
| rag.ts | Kırık (`alohaAI.models`) | Düzeltildi (`alohaAI.generateEmbedding()`) | ✅ |
| FabricRecognition | Eski SDK | Merkezi `alohaAI` singleton | ✅ |
| Long-running Agents | — | Planlandı | ⬜ |
| Flash TTS | — | Planlandı | ⬜ |
