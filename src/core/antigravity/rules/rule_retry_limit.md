# RULE: RETRY LIMIT & ESCALATION
**Severity:** CRITICAL
**Scope:** Execution Engine

## Directive

1. **Max Retries:** Bir görevin `Reviewer Agent` tarafından reddedilip (`RETRY`) `Worker Agent`'a geri gönderilme limiti **maksimum 3'tür**.
2. **Infinite Loop Prevention:** 3. denemede de hata alınırsa işlem zorunlu olarak `FAILED` statüsüne çekilir.
3. **Escalation:** `FAILED` statüsüne düşen işlemler `master_agent` tarafından yakalanır, `logs/agent_log.json` dosyasına yazılır ve operatöre (Hakan Toprak) raporlanır. Ajanların kendi aralarında sonsuza kadar çatışması KESİNLİKLE YASAKTIR.
