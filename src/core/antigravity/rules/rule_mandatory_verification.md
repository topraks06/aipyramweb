# RULE: MANDATORY VERIFICATION
**Severity:** OMEGA / CRITICAL
**Scope:** All Agents

## Directive

1. **Self-Verification is Forbidden:** Hiçbir ajan (Master, Worker) kendi ürettiği çıktıyı doğrulama veya onaylama yetkisine sahip değildir.
2. **Reviewer Authority:** Tüm çıktılar A'dan Z'ye `reviewer_agent.ts` tarafından kontrol edilmeden geçerli ("COMPLETED") sayılmaz.
3. **Execution Flow Lock:** İşletim motoru `execution_engine.ts`, Reviewer onayı olmadan dış platformlara (Veritabanı, UI) veri yazılmasına donanımsal olarak izin veremez.
