# RULE: NO FAKE COMPLETION
**Severity:** CRITICAL
**Scope:** Swarm Execution Engine

## Directive

1. Bir Ajan (Örn. Worker Agent) hiçbir koşul altında işini bitirdiğini söyleyerek süreci "COMPLETED" moduna alamaz.
2. Üretilen her çıktı (JSON, File, Makale, Kod) "VERIFYING" sürecine girmek ZORUNDADIR.
3. Reviewer Agent (Denetmen), hedeflenen Skills.md dosyasındaki yönergeleri (Örn: "600 kelime", "4 farklı görsel", "SEO title gereklidir") tek tek okur ve Worker'ın çıktısıyla çarpıştırır.
4. Eğer çıktı kuralları ihlal ediyorsa veya yapay zeka halüsinasyonu (uydurma) içeriyorsa, yanıt anında `RETRY` statüsü ile FAILED kabul edilip Worker'a hata loguyla birlikte fırlatılır. 
5. Yalan beyandan ("Yaptım" deyip yapmamasından) kaçınmak, modeli bağlayan değil Engine'i (TS kodunu) bağlayan strict checklerle kontrol edilecektir. O yüzden Hakan Toprak sistemden gelen çıktıları %100 onaylanmış kabul eder.
