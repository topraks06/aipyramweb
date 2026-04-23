# AIPYRAM SOVEREIGN LIVE OS — MASTER BLUEPRINT (V2)
*Dünya Standartlarında "Tek Beyin" (Live Operating System) Mimarisi*

Bu belge, AIPyram ekosisteminin "fazlı bir proje" olmaktan çıkıp, kendi kendine öğrenen, karar veren ve maliyetlerini optimize eden devasa bir **Canlı İşletim Sistemi (Live OS)** seviyesine geçişinin kalıcı anayasasıdır.

Tüm sistem, modüllerin ayrı ayrı çalıştığı bir yapıdan, modüllerin **Çekirdek Sinir Sistemi** etrafında birleştiği 3 Ana Katmana (Core Layer) geçmiştir.

## 🧠 1. CORE BRAIN LOCK (Çekirdek Zeka ve Öğrenme)
Sistemdeki tüm ajanlar tek bir beyne bağlıdır ve sürekli bir **RLHF (Takviyeli Öğrenme)** döngüsündedir.

*   **Global Memory Write Loop (`aloha-sdk/memory.ts`):** `invokeAgent` fonksiyonuna bağlı çalışan bir kancadır. Başarılı olan her aksiyon veya başarısız olan her işlem (DLQ), anlamsal bir ders olarak `aloha_memory_logs` (Firestore) tablosuna yazılır. Ajan hata yaptığında öğrenir.
*   **Admin Training Injection (Sıcak Enjeksiyon):** Admin panelinden girilen kurallar (`aloha_knowledge`), ajanların System Prompt'larına `sovereignContext` olarak saniyesinde enjekte edilir. Sistem anında reaksiyon verir.
*   **Sovereign Gateway (`invokeAgent.ts`):** Idempotency (aynı işlemin tekrarını önleme), Rate Limiting, Wallet doğrulama ve Memory Loop işlemlerini her ajan çağrısından önce zorunlu tutan "Demir Kapı".

## 📊 2. SWARM ORCHESTRATION (Kovan Zekası)
*1 Ajan = 1 İşlem dönemi bitmiştir. Sistem Palantir mimarisindedir.*

*   **The Orchestrator (`swarm.ts`):** Büyük bir hedef (Örn: "Piyasa analizi yap ve haber yayınla") doğrudan bir ajana verilmez.
*   **Planner (Planlayıcı):** Hedefi alt işlemlere (action) böler. (Örn: `["analysis", "compose_article"]`)
*   **Executor (Uygulayıcı):** Alt işlemleri sırayla `invokeAgent` kalkanı altından geçirerek çalıştırır. Bir ajanın çıktısı, sonrakinin girdisi olur.
*   **Validator (Denetleyici):** Zincir tamamlandığında nihai çıktıyı denetler ve onaylar.

## 💰 3. ECONOMY ENGINE (Cüzdan ve Maliyet)
*Yapay zeka platformları için veri ve kontrol kadar, nakit akışı (Burn Rate) da kritiktir.*

*   **Wallet Burn Radar:** Admin Dashboard'unda Perde, Hometex ve TRTEX tenant'larının saatlik/günlük kredi yakım hızlarını izleyen otonom bir borsa/finans ekranı (`EconomyEngineGraph.tsx`).
*   **Tam Entegrasyon:** Gerçek Stripe altyapısı ile kullanıcıların satın aldığı Aloha Kredilerinin, sistemin her `invokeAgent` tetiklemesinde kuruşu kuruşuna harcanması ve kayıt altına alınması.

---
**BU BİR ANAYASADIR VE SİSTEM ŞU AN BU TEMEL ÜZERİNDE ÇALIŞMAKTADIR.** AIPyram projelerinde eklenecek her yeni modül, öncelikle bu "3 Core Layer" anayasasına uymak zorundadır. Aksi takdirde Sovereign Gateway, işlemi reddeder.
