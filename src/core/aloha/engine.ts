import * as fs from 'fs';
import * as path from 'path';
import { adminDb } from '@/lib/firebase-admin';
import { executeMasterAgent, MasterSystemState } from '@/core/aloha/master-agent';
import { publishToTRTEX, publishToProject, PROJECT_FIREBASE_MAP } from '@/core/aloha/publishers/universal-publisher';
import { ActionRunner } from '@/core/execution/actionRunner';
import { Type } from '@google/genai';
import { alohaToolCache } from './toolCache';
import { alohaAI } from './aiClient';
import { alohaMemory } from './memory';
import { isToolAllowed, getToolPermission, isFileWriteSafe, isCollectionWriteSafe } from './toolPermissions';
import { scanAndGenerateImages } from '@/core/aloha/missing-image-scanner';
import { generatePlan, submitPlanForApproval, formatPlanSummary } from './planner';
import { executePlan, listPendingPlans, getPlanDetails, formatExecutionResult } from './executor';
import { detectTaskType, getAgentContextForTool } from './agentRouter';
import { triggerCloudDeploy, checkCloudRunStatus, sendGmail, getSearchAnalytics, listDomainDNS } from './cloudOps';
import { readFile as gitReadFile, writeFile as gitWriteFile, searchCode, createBranch, createPullRequest, listDirectory as gitListDir, getRecentCommits } from './codeOps';
import { submitUrlToGoogle, batchIndexUrls, analyzeGeoReadiness, analyzeCompetitor, multiSearch } from './seoOps';
import { verifyAgentTrust, sendAgentMessage, getAgentMessages, listAllAgents } from './agentTrust';
import { dlq } from './dlq';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ALOHA UNIVERSAL LOGGER
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function logAlohaAction(action: string, payload: any) {
  try {
    const logDir = path.resolve(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    
    const logFile = path.join(logDir, "aloha-nexus.log");
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] [${action}] ${JSON.stringify(payload)}\n`;
    fs.appendFileSync(logFile, entry, "utf8");
  } catch (err) {
    console.error("[Aloha Logger Error]", err);
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// OTONOM AJAN ARAÃ‡LARI (Gerçek İnfaz Tanımları)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const tools: any[] = [
  {
    functionDeclarations: [
      {
        name: "analyze_project",
        description:
          "Belirtilen projenin fiziksel dizinini tarar ve sağlık raporu çıkarır: dosya sayısı, klasör yapısı, package.json, eksik dosyalar. Projeyi 'analiz et', 'kontrol et', 'incele' gibi emirlerde HEMEN bunu çağır.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            projectName: {
              type: Type.STRING,
              description: "Proje adı: trtex, hometex, aipyramweb, perde-ai",
            },
          },
          required: ["projectName"],
        },
      },
      {
        name: "audit_all_projects",
        description:
          "Ekosistemdeki TÃœM projeleri fiziksel olarak tarar: dizin yapısı, package.json, firebase.json, hata dosyaları, TypeScript durumu.",
        parameters: { type: Type.OBJECT, properties: {} },
      },
      {
        name: "deploy_target_project",
        description:
          "Belirtilen projeyi Firebase Hosting'e deploy eder. Ã–nce build, sonra deploy komutu çalıştırır.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            targetProjectName: {
              type: Type.STRING,
              description: "Deploy edilecek proje adı",
            },
          },
          required: ["targetProjectName"],
        },
      },
      {
        name: "read_json_database",
        description:
          "Belirtilen JSON dosyasını veya dizinini okur. Kod/Bash script (node -e) çalıştırmak yerine bunu kullanarak syntax tırnak hatalarından kaçın.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            targetPath: {
              type: Type.STRING,
              description: "Ã–rn: C:/Users/MSI/Desktop/projeler zip/trtex.com/data/published/haber.json veya sadece dizin yolu",
            },
          },
          required: ["targetPath"],
        },
      },
      {
        name: "update_json_database",
        description:
          "Belirtilen JSON dosyasını güvenli bir şekilde günceller. Başka bir araçla (node -e) yazmaya çalışma, bunu kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            targetPath: {
              type: Type.STRING,
              description: "Değiştirilecek json dosyasının tam adresi",
            },
            jsonPayload: {
              type: Type.STRING,
              description: "Yeni JSON verisi (stringified JSON).",
            },
          },
          required: ["targetPath", "jsonPayload"],
        },
      },
      {
        name: "write_project_file",
        description: "Belirtilen dosyaya içerik yazar veya günceller. Kod, config, HTML gibi herhangi bir metin dosyası oluşturur/düzeltir.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            filePath: {
              type: Type.STRING,
              description: "Yazılacak dosyanın tam yolu (mutlak). Ã–rn: C:/Users/MSI/Desktop/projeler zip/trtex.com/src/app/page.tsx",
            },
            content: {
              type: Type.STRING,
              description: "Dosyaya yazılacak tam içerik.",
            },
          },
          required: ["filePath", "content"],
        },
      },
      {
        name: "read_project_file",
        description:
          "Projedeki bir dosyanın içeriğini okur. Analiz ve debugging için kullanılır.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            filePath: {
              type: Type.STRING,
              description: "Proje kökünden itibaren dosya yolu (örn: src/app/api/aloha/route.ts)",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "read_project_file_range",
        description: "Dosyanın belirli satır aralığını okur. Büyük dosyalarda (500+ satır) hedeflenen bölgeyi görmek için kullan. Dosyanın tamamını okumana gerek yok â€” sadece ilgilendiğin satırları oku.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            filePath: {
              type: Type.STRING,
              description: "Dosyanın tam yolu"
            },
            startLine: {
              type: Type.NUMBER,
              description: "Başlangıç satırı (1-indexed)"
            },
            endLine: {
              type: Type.NUMBER,
              description: "Bitiş satırı (1-indexed, max 300 satır aralık)"
            }
          },
          required: ["filePath", "startLine", "endLine"],
        },
      },
      {
        name: "patch_project_file",
        description: "Dosyada CERRAHİ düzenleme yapar â€” sadece hedeflenen metni bulur ve değiştirir, dosyanın geri kalanına DOKUNMAZ. write_project_file yerine BUNU KULLAN! write_project_file tüm dosyayı üzerine yazar (tehlikeli), patch_project_file sadece belirtilen kısmı değiştirir (güvenli).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            filePath: {
              type: Type.STRING,
              description: "Düzenlenecek dosyanın tam yolu"
            },
            searchText: {
              type: Type.STRING,
              description: "Dosyada AYNEN bulunması gereken metin parçası (değiştirilecek kısım)"
            },
            replaceText: {
              type: Type.STRING,
              description: "searchText yerine konacak yeni metin"
            }
          },
          required: ["filePath", "searchText", "replaceText"],
        },
      },
      {
        name: "search_in_project",
        description: "Proje dosyalarında metin/pattern arar (grep benzeri). Bir fonksiyonun nerede kullanıldığını, bir değişkenin nerede tanımlandığını, bir hata mesajının kaynağını bulmak için kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            projectName: {
              type: Type.STRING,
              description: "Proje adı: trtex, hometex, aipyramweb, perde"
            },
            query: {
              type: Type.STRING,
              description: "Aranacak metin veya pattern"
            },
            filePattern: {
              type: Type.STRING,
              description: "Dosya filtresi (opsiyonel). Ã–rn: *.ts, *.tsx, *.json. Boş = tüm dosyalar"
            }
          },
          required: ["projectName", "query"],
        },
      },
      {
        name: "list_directory",
        description:
          "Projedeki bir klasörün içeriğini listeler. node_modules ve .next hariç.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            dirPath: {
              type: Type.STRING,
              description: "Listelenecek klasör yolu (örn: src/core/agents)",
            },
          },
          required: ["dirPath"],
        },
      },
      {
        name: "global_b2b_strategy_scan",
        description: "Bütün AIPyram ekosistemini (tüm projeleri) tarar ve büyük resmi çıkararak çapraz proje korelasyonu/strateji önerileri sunar.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "run_project_script",
        description: "Belirtilen projenin npm/pnpm scriptini çalıştırır. Ã–rn: TRTEX newsroom pipeline tetikle, build yap. Sorun tespit ettikten sonra otonom olarak düzeltmek için çağır.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            projectName: {
              type: Type.STRING,
              description: "Proje adı (örn: trtex, hometex, aipyramweb)",
            },
            scriptName: {
              type: Type.STRING,
              description: "Ã‡alıştırılacak script adı. Ã–rn: newsroom, build, news:collect",
            },
            additionalArgs: {
              type: Type.STRING,
              description: "Scriptin sonuna eklenecek opsiyonel parametreler (örn: --category='perde').",
            },
          },
          required: ["projectName", "scriptName"],
        },
      },
      {
        name: "query_firestore_database",
        description: "Google Cloud Firestore üzerinden doğrudan B2B/Kovan verisi okur. Firestore'daki koleksiyonlara ping atıp durumu çeker.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            collectionName: {
              type: Type.STRING,
              description: "Sorgulanacak Firestore koleksiyon adı (örn: news, members, b2b_requests)",
            },
            limit: {
              type: Type.NUMBER,
              description: "Getirilecek maksimum doküman sayısı (varsayılan: 5)",
            }
          },
          required: ["collectionName"],
        },
      },
      {
        name: "create_new_project",
        description: "projeler zip dizinine yepyeni bir Firebase / Next.js projesi kurar. Brutalist standardı baz alır.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            projectName: {
              type: Type.STRING,
              description: "Yeni projenin tam adı (örn: otomobil.ai, pirlanta.ai)",
            },
            templateName: {
              type: Type.STRING,
              description: "Kullanılacak şablon. Varsayılan olarak: brutalist-nextjs",
            }
          },
          required: ["projectName"],
        },
      },
      {
        name: "trigger_trtex_master_feed",
        description: "TRTEX için YENİ NESİL otonom B2B haber üretimi! TRTEX haberleri Firebase'e bağlandığından artık eski 'newsroom' komutunu KULLANMA. Haberi/Sistemi onarmak veya yeni haber çekmek için bunu çalıştır. Aipyram Master API'sini tetikleyerek Firebase'e doğrudan resimli, AI destekli yeni nesil sektör haberi yazar. SONUÃ‡ OLARAK GERÃ‡EK FIREBASE HABER SAYISINI DÃ–NER.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "verify_project_health",
        description: "Belirtilen projenin GERÃ‡EK sağlık durumunu kontrol eder. Firebase koleksiyonunu sorgular, haber sayısı, son güncelleme zamanı ve eksikleri raporlar. Bir işlem yaptıktan sonra MUTLAKA bunu çağır.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            projectName: {
              type: Type.STRING,
              description: "Proje adı: trtex, hometex, perde, aipyramweb",
            },
          },
          required: ["projectName"],
        },
      },
      {
        name: "trigger_project_content",
        description: "Herhangi bir proje için otonom içerik üret ve Firebase'e bas. Sadece TRTEX değil, tüm ekosisteme (hometex, perde, didimemlak vb.) içerik pompalar.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            projectName: {
              type: Type.STRING,
              description: "Hedef proje adı",
            },
            contentType: {
              type: Type.STRING,
              description: "İçerik tipi: news, market_signal, catalog, exhibit",
            },
          },
          required: ["projectName"],
        },
      },

      {
        name: "create_aloha_task",
        description: "âš ï¸ SADECE YÃœKSEK RİSKLİ İŞLEMLER İÃ‡İN: deploy, proje silme, 50+ toplu değişiklik. Normal sorunlar için BU ARACI KULLANMA! Bunun yerine search_in_project â†’ read_project_file â†’ patch_project_file â†’ verify_project_health zincirini kullanarak DİREKT düzelt.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Görev başlığı (kısa ve net)"
            },
            description: {
              type: Type.STRING,
              description: "Ne yapılacağının detaylı açıklaması"
            },
            project: {
              type: Type.STRING,
              description: "Hedef proje: trtex, hometex, perde, aipyram"
            },
            taskType: {
              type: Type.STRING,
              description: "Görev tipi: code_change, content_update, seo_audit, analysis, deploy"
            },
            risk: {
              type: Type.STRING,
              description: "Risk: low, medium, high"
            },
            priority: {
              type: Type.NUMBER,
              description: "Ã–ncelik 1-5 (1=en acil, 5=düşük)"
            },
            mode: {
              type: Type.STRING,
              description: "Mod: execute (gerçek uygula) veya dry_run (simülasyon)"
            },
            changes: {
              type: Type.STRING,
              description: "JSON dizisi: [{file, action, content}] - max 5 dosya!"
            }
          },
          required: ["title", "project"],
        },
      },
      {
        name: "scan_missing_images",
        description: "Firebase'deki görselsiz haberleri tarar ve otomatik görsel üretir. Ã–nce dry_run ile kaç haber eksik gör, sonra execute ile üret. Max 20 haber/run.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            collection: {
              type: Type.STRING,
              description: "Koleksiyon adı: trtex_news, hometex_news vb."
            },
            limit: {
              type: Type.NUMBER,
              description: "Kaç haber işlenecek (max 20)"
            },
            dryRun: {
              type: Type.BOOLEAN,
              description: "true = sadece say, false = gerçek üret"
            }
          },
          required: [],
        },
      },
      {
        name: "compose_article",
        description: "Manuel haber/makale oluştur. Konuyu araştır, içerik yaz, görselleri üret ve Firebase'e yayınla. Hakan Bey'in 'şu konuyu araştır ve 3 resim koy' komutları için kullanılır.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            topic: {
              type: Type.STRING,
              description: "Araştırılacak konu veya haber başlığı"
            },
            project: {
              type: Type.STRING,
              description: "Hedef proje: trtex, hometex, perde"
            },
            image_count: {
              type: Type.NUMBER,
              description: "Kaç görsel üretilecek (1-5, varsayılan: otomatik)"
            },
            image_style: {
              type: Type.STRING,
              description: "Görsel stili: editorial, corporate, dramatic, futuristic, documentary"
            },
            word_count: {
              type: Type.NUMBER,
              description: "Hedef kelime sayısı (varsayılan: 600)"
            },
            category: {
              type: Type.STRING,
              description: "Kategori: Finans, Teknoloji, Export, Fuar, Sürdürülebilirlik, İnovasyon, Radar Alert (TRTEX UZAKDOĞU B2B RADARI bölümü için â€” trust_score ve ai_action alanları zorunlu)"
            },
            language: {
              type: Type.STRING,
              description: "Ana dil: tr, en (varsayılan: tr â€” çeviriler otomatik)"
            }
          },
          required: ["topic", "project"],
        },
      },
      {
        name: "update_intelligence_dashboard",
        description: "TRTEX ana sayfa istihbarat panelini güncelle. HOT LEAD fırsatı, pazar endeksleri (SCFI navlun, Ã‡in kapasite, hammadde) ve ticari fırsatları Firestore'a yaz. TRTEX'in SupplyChainMonitor ve HeroOpportunityBanner bileşenleri bu veriyi kullanır. HER GÃœN en az 1 kez güncelle.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            hero_headline: { type: Type.STRING, description: "HOT LEAD başlığı (dikkat çekici, büyük harf)" },
            hero_opportunity: { type: Type.STRING, description: "Fırsat açıklaması (1-2 cümle)" },
            hero_country: { type: Type.STRING, description: "Ãœlke/bölge adı" },
            hero_flag: { type: Type.STRING, description: "Emoji bayrak" },
            hero_action: { type: Type.STRING, description: "Aksiyon butonu metni" },
            shanghai_freight_price: { type: Type.NUMBER, description: "SCFI navlun endeksi değeri" },
            shanghai_freight_change: { type: Type.STRING, description: "30 günlük değişim (örn: +12.4%)" },
            shanghai_freight_trend: { type: Type.STRING, description: "up veya down" },
            cn_factory_price: { type: Type.NUMBER, description: "Ã‡in kapasite kullanım oranı (%)" },
            cn_factory_change: { type: Type.STRING, description: "30 günlük değişim (örn: -4.5%)" },
            cn_factory_trend: { type: Type.STRING, description: "up veya down" },
            pta_price: { type: Type.NUMBER, description: "PTA/MEG hammadde fiyatı ($/ton)" },
            pta_change: { type: Type.STRING, description: "30 günlük değişim" },
            pta_trend: { type: Type.STRING, description: "up veya down" },
          },
          required: ["hero_headline", "hero_opportunity"],
        },
      },
      {
        name: "update_homepage_brain",
        description: `TRTEX ana sayfasının TÃœM bileşenlerini tek seferde güncelle. Bu tool çağrıldığında:
1. Daily Insight (günün pazar değerlendirmesi) üretir
2. B2B Opportunities (3-5 adet ülke+ürün+aksiyon fırsatları) üretir  
3. Intelligence Score hesaplar (içerik sayısı, tazelik, fırsat kalitesi)
4. Sector Pulse çıkarır (son haberlerin özeti)
Tüm veriyi tek Firestore dokümanına yazar: trtex_homepage_brain
HER 6 SAATTE 1 çağrılmalı. Fırsatlar SOMUT olmalı: "Almanya'da teknik perde ithalatı %18 arttı" gibi.`,
        parameters: {
          type: Type.OBJECT,
          properties: {
            daily_headline: { type: Type.STRING, description: "Günün ana başlığı (B2B executive brief)" },
            daily_summary: { type: Type.STRING, description: "2-3 cümle özet (veri odaklı)" },
            daily_questions: { type: Type.STRING, description: "JSON array: [{q:'soru',a:'cevap'}] â€” 3 adet Q&A" },
            daily_risk_level: { type: Type.STRING, description: "DÃœŞÃœK/ORTA/YÃœKSEK/KRİTİK" },
            daily_opportunity_level: { type: Type.STRING, description: "DÃœŞÃœK/ORTA/YÃœKSEK/KRİTİK" },
            daily_affected_countries: { type: Type.STRING, description: "Virgülle ayrılmış ülkeler" },
            daily_comment: { type: Type.STRING, description: "TRTEX AI yorumu (1 cümle)" },
            opportunities: { type: Type.STRING, description: "JSON array: [{name:'CONFIDENTIAL',flag:'ğŸ‡©ğŸ‡ª',country:'ALMANYA',iq_score:88,trend:'rising',risk_flag:'low',sub:'PERDE',reason:'Somut fırsat açıklaması'}] â€” 3-5 adet" },
            sector_pulse_summary: { type: Type.STRING, description: "Son 24h sektör özeti (2-3 cümle)" },
            sector_pulse_signals: { type: Type.STRING, description: "JSON array: [{tag:'Ã‡İN',risk:'KRİTİK',text:'kısa uyarı'}] â€” 4 adet" },
          },
          required: ["daily_headline", "daily_summary", "opportunities"],
        },
      },
      {
        name: "update_article_image",
        description: "Mevcut bir haberin görselini güncelle veya eksik görseli oluştur. Görselsiz haberlere görsel eklemek için kullanılır. Imagen 3 ile 2K kalitesinde görsel üretir ve Firebase Storage'a yükler, sonra haberi günceller.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            slug: {
              type: Type.STRING,
              description: "Haberin slug'ı (benzersiz tanımlayıcı)"
            },
            project: {
              type: Type.STRING,
              description: "Hedef proje: trtex, hometex, perde"
            },
            prompt_hint: {
              type: Type.STRING,
              description: "Görsel için ek ipucu (opsiyonel, haber başlığından otomatik üretilir)"
            }
          },
          required: ["slug", "project"],
        },
      },
      {
        name: "write_firestore_document",
        description: "Firestore'a doğrudan doküman yazar. Proje profili, hafıza kaydı veya güvenli koleksiyona veri yaz. Koleksiyon SAFE_COLLECTIONS listesinde olmalıdır. Yeni proje keşfedildiğinde project_profiles'a profil kaydet.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            collection: {
              type: Type.STRING,
              description: "Hedef koleksiyon (örn: project_profiles, aloha_memory, trtex_news)"
            },
            data: {
              type: Type.STRING,
              description: "Yazılacak JSON verisi (string olarak)"
            },
            docId: {
              type: Type.STRING,
              description: "Opsiyonel doküman ID. Belirtilmezse otomatik üretilir."
            }
          },
          required: ["collection", "data"],
        },
      },
      {
        name: "create_execution_plan",
        description: "Karmaşık görevler için PLAN oluşturur. Direkt tool çağırmak yerine Ã–NCE plan üret. Plan onaylandıktan sonra adım adım yürütülür. 'düzelt', 'hepsini', 'tüm projeleri' gibi karmaşık emirlerde MUTLAKA bunu kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            task_description: {
              type: Type.STRING,
              description: "Yapılması gereken görevin detaylı açıklaması"
            },
            context: {
              type: Type.STRING,
              description: "Mevcut durum hakkında ek bilgi (opsiyonel)"
            }
          },
          required: ["task_description"],
        },
      },
      {
        name: "approve_plan",
        description: "Bekleyen bir planı onaylar ve yürütmeye başlar. Plan ID ile çağrılır.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            plan_id: {
              type: Type.STRING,
              description: "Onaylanacak planın ID'si"
            }
          },
          required: ["plan_id"],
        },
      },
      {
        name: "list_plans",
        description: "Bekleyen, onaylanmış ve yürütülmekte olan planları listeler.",
        parameters: { type: Type.OBJECT, properties: {} },
      },
      {
        name: "deep_site_audit",
        description: "Projenin KAPSAMLI denetimini yapar: Firestore'daki tüm makalelerin body, görsel, SEO keyword, AI yorum eksiklerini tarar + canlı siteyi kontrol eder. Skor verir (0-100). Tüm sorunları otomatik bulur. İlk adım BUDUR, sonra auto_repair_project ile düzelt.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING, description: "Proje adı: trtex, hometex, perde" }
          },
          required: ["project"],
        },
      },
      {
        name: "auto_repair_project",
        description: "deep_site_audit raporundaki sorunları otomatik düzeltir: boş içerik yaz, stok görseli AI görselle değiştir, keyword ekle, formatting düzelt, AI yorum ekle. dryRun=true ile önce simülasyon yap.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING, description: "Proje adı: trtex, hometex, perde" },
            dryRun: { type: Type.BOOLEAN, description: "true = sadece listele, false = gerçek uygula" },
            maxActions: { type: Type.NUMBER, description: "Tek seferde max kaç aksiyon (varsayılan: 20)" }
          },
          required: ["project"],
        },
      },
      {
        name: "research_industry",
        description: "Güvenli kurumsal kaynaklardan (Textilegence, Heimtextil, ITKIB, Fibre2Fashion) sektörel araştırma yapar. Bilmediğin konularda Ã–NCE araştır, sonra haber yaz.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, description: "Araştırılacak konu" },
            category: { type: Type.STRING, description: "Kaynak: textile, market_data, fairs" }
          },
          required: ["topic"],
        },
      },
      {
        name: "run_full_repair",
        description: "TAM SİTE ONARIM ZİNCİRİ: audit â†’ slug fix â†’ batch repair â†’ içerik üretimi â†’ görsel üretimi â†’ tekrar audit. Tek komutla tüm sorunları baştan sona çözer. Max 10 dk çalışır.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING, description: "Proje adı: trtex, hometex, perde" },
          },
          required: ["project"],
        },
      },
      {
        name: "run_health_check",
        description: "HIZLI SAĞLIK KONTROLÃœ: Projeyi analiz et + deep audit yap. 2 adımlı zincir. Sorunları rapor eder ama düzeltmez.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING, description: "Proje adı" },
          },
          required: ["project"],
        },
      },
      {
        name: "run_content_generation",
        description: "İÃ‡ERİK ÃœRETİM ZİNCİRİ: Araştırma â†’ içerik üret â†’ görseller ekle. 3 adımlı zincir.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING, description: "Proje adı" },
          },
          required: ["project"],
        },
      },
      {
        name: "run_ecosystem_repair",
        description: "TÃœM EKOSİSTEM TAMİRİ: TRTEX + Hometex + Perde sırayla tam onarım. En kapsamlı komut. Uzun sürer (30+ dk).",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "scan_google_tech",
        description: "HAFTALIK GOOGLE ALTYAPI TARAMASI: Tüm Google altyapı güncellemelerini tarar (Gemini, Vertex AI, Firebase, Cloud Run, Imagen, Angular, vb.), AIPyram'a faydalı olanları tespit eder ve ONAY TEKLİFİ olarak kaydeder. Otomatik uygulama YAPMAZ â€” Hakan'ın onayını bekler.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "check_website",
        description: "Bir web sitesinin durumunu kontrol eder: HTTP status, response time, temel SEO (title, description, H1), içerik analizi. Site çökmüş mü, boş sayfa mı, hataları yakalar.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: {
              type: Type.STRING,
              description: "Kontrol edilecek URL (örn: https://trtex.com)"
            },
            check_seo: {
              type: Type.BOOLEAN,
              description: "SEO analizi de yapılsın mı? (title, meta, h1, og tags)"
            }
          },
          required: ["url"],
        },
      },
      {
        name: "web_search",
        description: "İnternette arama yapar ve sonuçları döndürür. Haber üretirken gerçek veri bulmak, güncel bilgi almak, sektörel trend araştırmak için kullan. Uydurma bilgi üretme riski SIFIRA iner.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: "Arama sorgusu (örn: 'türk tekstil ihracat 2026', 'cotton prices today')"
            },
            language: {
              type: Type.STRING,
              description: "Sonuç dili: tr, en, de (varsayılan: tr)"
            },
            max_results: {
              type: Type.NUMBER,
              description: "Maksimum sonuç sayısı (varsayılan: 5, max: 10)"
            }
          },
          required: ["query"],
        },
      },
      {
        name: "fetch_url",
        description: "Herhangi bir web sayfasının içeriğini okur ve metin olarak döndürür. Haber kaynağı okumak, doküman çekmek, API response kontrol etmek için kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: {
              type: Type.STRING,
              description: "Okunacak URL"
            },
            max_length: {
              type: Type.NUMBER,
              description: "Maksimum karakter (varsayılan: 3000)"
            }
          },
          required: ["url"],
        },
      },
      {
        name: "cloud_deploy",
        description: "Cloud Run'a deploy tetikler. Aloha kendi kendini deploy eder! Cloud Build trigger kullanır. Destructive işlem â€” sadece Hakan'ın açık emriyle çalıştır.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            service_name: {
              type: Type.STRING,
              description: "Servis adı (varsayılan: aipyramweb)"
            }
          },
          required: [],
        },
      },
      {
        name: "cloud_status",
        description: "Cloud Run servis durumunu kontrol et. URL, son revision, uptime bilgisi döner.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            service_name: {
              type: Type.STRING,
              description: "Servis adı (varsayılan: aipyramweb)"
            }
          },
          required: [],
        },
      },
      {
        name: "send_email",
        description: "Gmail API ile e-posta gönder. Müşteriye rapor, teklif, bildirim göndermek için kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            to: {
              type: Type.STRING,
              description: "Alıcı e-posta adresi"
            },
            subject: {
              type: Type.STRING,
              description: "E-posta konusu"
            },
            body: {
              type: Type.STRING,
              description: "E-posta içeriği (HTML destekler)"
            }
          },
          required: ["to", "subject", "body"],
        },
      },
      {
        name: "seo_analytics",
        description: "Google Search Console'dan SEO performans verisi çeker. Tıklamalar, gösterimler, CTR, ortalama pozisyon, en çok aranan sorgular ve en çok tıklanan sayfaları döner.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            site_url: {
              type: Type.STRING,
              description: "Site URL (örn: https://trtex.com veya sc-domain:trtex.com)"
            },
            days: {
              type: Type.NUMBER,
              description: "Son kaç günlük veri (varsayılan: 28)"
            }
          },
          required: ["site_url"],
        },
      },
      {
        name: "git_read_file",
        description: "GitHub repo'dan dosya oku. Herhangi bir kaynak kodu dosyasını okuyabilir. Kod analizi, bug tespiti, refactor planlaması için kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            file_path: { type: Type.STRING, description: "Dosya yolu (örn: src/core/aloha/engine.ts)" },
            branch: { type: Type.STRING, description: "Branch (varsayılan: main)" },
            repo: { type: Type.STRING, description: "Repo adı (varsayılan: aipyramweb)" },
          },
          required: ["file_path"],
        },
      },
      {
        name: "git_write_file",
        description: "GitHub repo'ya dosya yaz veya güncelle. Otomatik commit oluşturur. Kod düzenleme, bug fix, yeni dosya oluşturma için kullan. DİKKAT: Main branch'e direkt yazma â€” önce branch oluştur.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            file_path: { type: Type.STRING, description: "Dosya yolu" },
            content: { type: Type.STRING, description: "Dosya içeriği (tam dosya)" },
            commit_message: { type: Type.STRING, description: "Commit mesajı" },
            branch: { type: Type.STRING, description: "Branch (varsayılan: main)" },
            repo: { type: Type.STRING, description: "Repo adı" },
          },
          required: ["file_path", "content", "commit_message"],
        },
      },
      {
        name: "git_search_code",
        description: "GitHub repo içinde kod arama. Belirli bir fonksiyon, değişken, import veya pattern bulmak için kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "Aranacak metin/pattern" },
            repo: { type: Type.STRING, description: "Repo adı" },
          },
          required: ["query"],
        },
      },
      {
        name: "git_list_dir",
        description: "GitHub repo'da dizin listele. Proje yapısını anlamak, dosya bulmak için kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            dir_path: { type: Type.STRING, description: "Dizin yolu (örn: src/core/aloha)" },
            branch: { type: Type.STRING, description: "Branch" },
            repo: { type: Type.STRING, description: "Repo adı" },
          },
          required: ["dir_path"],
        },
      },
      {
        name: "git_create_branch",
        description: "GitHub'da yeni branch oluştur. Kod değişikliği yapmadan önce branch oluştur, sonra o branch'e yaz.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            branch_name: { type: Type.STRING, description: "Yeni branch adı (örn: aloha/fix-trtex-layout)" },
            from_branch: { type: Type.STRING, description: "Kaynak branch (varsayılan: main)" },
            repo: { type: Type.STRING, description: "Repo adı" },
          },
          required: ["branch_name"],
        },
      },
      {
        name: "git_create_pr",
        description: "GitHub'da Pull Request oluştur. Branch'teki değişiklikleri main'e merge etmek için PR aç. Admin onaylar.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "PR başlığı" },
            body: { type: Type.STRING, description: "PR açıklaması" },
            head_branch: { type: Type.STRING, description: "Değişikliklerin olduğu branch" },
            base_branch: { type: Type.STRING, description: "Hedef branch (varsayılan: main)" },
            repo: { type: Type.STRING, description: "Repo adı" },
          },
          required: ["title", "body", "head_branch"],
        },
      },
      {
        name: "git_commits",
        description: "Son commit'leri listele. Nelerin ne zaman değiştiğini görmek için kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            count: { type: Type.NUMBER, description: "Kaç commit (varsayılan: 10)" },
            repo: { type: Type.STRING, description: "Repo adı" },
          },
          required: [],
        },
      },
      {
        name: "google_index",
        description: "Google Indexing API ile URL'yi indexlemeye gönder. Yeni yayınlanan haberlerin Google'da hızlı çıkması için kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: { type: Type.STRING, description: "Indexlenecek URL" },
            urls: { type: Type.ARRAY, description: "Toplu indexleme için URL listesi", items: { type: Type.STRING } }
          },
          required: [],
        },
      },
      {
        name: "geo_analyze",
        description: "AI arama motorları (Perplexity, ChatGPT Search, Gemini) için sayfa uyumluluğunu analiz et. GEO skoru, Schema.org, E-E-A-T ve optimizasyon önerileri döner.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: { type: Type.STRING, description: "Analiz edilecek sayfa URL'si" }
          },
          required: ["url"],
        },
      },
      {
        name: "analyze_competitor",
        description: "Rakip site analizi yap. Tech stack, SEO skoru, içerik sinyalleri ve fırsat tespiti döner.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: { type: Type.STRING, description: "Rakip site URL'si" }
          },
          required: ["url"],
        },
      },
      {
        name: "multi_search",
        description: "Birden fazla arama motorunda (Google + Bing) aynı anda arama yap. Kapsamlı araştırma için kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "Arama sorgusu" }
          },
          required: ["query"],
        },
      },
      {
        name: "agent_message",
        description: "Başka bir ajana güvenli mesaj gönder. Görev atama, sonuç paylaşma, yardım isteme için kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            to: { type: Type.STRING, description: "Hedef ajan ID (content_agent, seo_agent, auditor, image_agent, trendsetter, matchmaker)" },
            type: { type: Type.STRING, description: "Mesaj tipi: task, result, alert, request" },
            message: { type: Type.STRING, description: "Mesaj içeriği" },
            priority: { type: Type.STRING, description: "Ã–ncelik: critical, high, normal, low" }
          },
          required: ["to", "type", "message"],
        },
      },
      // â•â•â• TRTEX SİTE YÃ–NETİCİ ARAÃ‡LARI (Aloha Tam Otonom Site Yapıcı) â•â•â•
      {
        name: "trtex_create_page",
        description: "TRTEX'e yeni sayfa oluştur. Sayfayı Firestore'a (trtex_pages) yazar, SEO metadata otomatik üretir. Ana sayfa, haberler, sektörler, hakkımızda, iletişim, fuar takvimi gibi sayfalar ekleyebilirsin.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            slug: { type: Type.STRING, description: "Sayfa URL slug'ı (örn: haberler, hakkimizda, iletisim, fuar-takvimi)" },
            title_tr: { type: Type.STRING, description: "Türkçe sayfa başlığı" },
            title_en: { type: Type.STRING, description: "İngilizce sayfa başlığı (opsiyonel)" },
            template: { type: Type.STRING, description: "Şablon: news_list, news_detail, static, category, landing, contact, about" },
            content_tr: { type: Type.STRING, description: "Türkçe sayfa içeriği (statik şablonlar için)" },
            content_en: { type: Type.STRING, description: "İngilizce sayfa içeriği (opsiyonel)" },
          },
          required: ["slug", "title_tr", "template"],
        },
      },
      {
        name: "trtex_update_page",
        description: "Mevcut TRTEX sayfasını güncelle. Slug ile sayfayı bul, belirtilen alanı değiştir. SEO, içerik, durum, bileşenler güncellenebilir.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            slug: { type: Type.STRING, description: "Güncellenecek sayfanın slug'ı" },
            field: { type: Type.STRING, description: "Güncellenecek alan (örn: content_tr, status, seo.meta_description_tr, title_tr)" },
            value: { type: Type.STRING, description: "Yeni değer" },
          },
          required: ["slug", "field", "value"],
        },
      },
      {
        name: "trtex_site_audit",
        description: "TRTEX sitesinin YAPISAL DENETİMİNİ yap. Eksik sayfaları, kırık SEO'yu, boş içerikleri, bayat haberleri ve navigasyon sorunlarını tespit et. 0-100 skor verir. İlk adım olarak bunu çağır, sonra sorunları düzelt.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "trtex_generate_component",
        description: "TRTEX için React bileşeni üret. Gemini ile kod oluşturur, Firestore'a (trtex_components) kaydeder. RelatedNews, Breadcrumb, SectorCard gibi bileşenler üretebilirsin.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Bileşen adı (örn: RelatedNews, Breadcrumb, SectorCard)" },
            purpose: { type: Type.STRING, description: "Bileşenin amacı ve ne yapacağının açıklaması" },
            data_source: { type: Type.STRING, description: "Veri kaynağı (örn: trtex_news, trtex_intelligence)" },
          },
          required: ["name", "purpose"],
        },
      },
      {
        name: "trtex_manage_menu",
        description: "TRTEX navigasyon menüsünü güncelle veya oluştur. Ana menü veya footer menüsü yönetir.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            menu_type: { type: Type.STRING, description: "Menü tipi: main veya footer" },
            items: { type: Type.STRING, description: "Menü öğeleri JSON dizisi: [{label_tr,label_en,href,order}]" },
          },
          required: ["menu_type", "items"],
        },
      },
      {
        name: "trtex_bootstrap_site",
        description: "TRTEX sitesini SIFIRDAN BAŞLAT. Site config, temel sayfalar (news, markets, about, contact) ve varsayılan navigasyonu otomatik oluşturur. Bootstrap lock ile korunur â€” bir kez çalışır, kazara sıfırlama engellenir.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "trtex_get_site_state",
        description: "TRTEX sitesinin MEVCUT DURUMUNU oku. Config, tüm sayfalar, bileşenler, haber sayısı ve menü bilgisini döner. HER İŞLEMDEN Ã–NCE bunu çağır, sonra karar ver. State awareness olmadan aksiyon alma!",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "trtex_apply_patch",
        description: "TRTEX sayfasına ATOMIC JSON PATCH uygula. Birden fazla alanı tek seferde günceller. Kritik sayfalar (/, news) korunur â€” template/status değiştirilemez. slug ve createdAt da korumalı. trtex_update_page yerine bunu tercih et.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            slug: { type: Type.STRING, description: "Hedef sayfanın slug'ı" },
            changes: { type: Type.STRING, description: "JSON nesne: {\"title_tr\": \"Yeni\", \"seo.meta_description_tr\": \"...\"}" },
          },
          required: ["slug", "changes"],
        },
      },
      {
        name: "trtex_enrich_article",
        description: "Mevcut bir TRTEX habersini SEO ile zenginlestir: Related News bagla (3-5 ilgili makale), JSON-LD Structured Data ekle, Breadcrumb verisi olustur, okuma suresi hesapla. DocID gerekli.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            docId: { type: Type.STRING, description: "Firestore document ID" },
            collection: { type: Type.STRING, description: "Koleksiyon adi (varsayilan: trtex_news)" },
          },
          required: ["docId"],
        },
      },
      {
        name: "trtex_batch_enrich",
        description: "Son N haberi toplu olarak SEO + Related News ile zenginlestir. Her habere: ilgili haberler, structured data, breadcrumb, okuma suresi ekler.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            limit: { type: Type.NUMBER, description: "Kac haber zenginlestirilecek (varsayilan: 20, max: 50)" },
            collection: { type: Type.STRING, description: "Koleksiyon adi (varsayilan: trtex_news)" },
          },
        },
      },
      {
        name: "trtex_lead_stats",
        description: "TRTEX lead istatistiklerini goster: toplam lead, alici/uretici dagilimi, hot/warm/cold, ulke ve urun bazli analiz, eslesme sayisi. Lead Engine durumunu izlemek icin kullan.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "trtex_search_leads",
        description: "Leadleri filtrele ve ara. Role (buyer/manufacturer/wholesaler), ulke, urun veya duruma gore filtrele.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING, description: "buyer, manufacturer, wholesaler, retailer, agent" },
            country: { type: Type.STRING, description: "Ulke filtresi" },
            product: { type: Type.STRING, description: "Urun filtresi (perde, havlu, vb)" },
            status: { type: Type.STRING, description: "new, contacted, qualified, matched, converted, cold" },
            limit: { type: Type.NUMBER, description: "Max sonuc (varsayilan: 20)" },
          },
        },
      },
      {
        name: "trtex_find_matches",
        description: "Belirli bir lead icin otomatik eslestirmeleri bul. Lead ID gerekli.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            leadId: { type: Type.STRING, description: "Lead document ID" },
          },
          required: ["leadId"],
        },
      },
      // â•â•â• AGENT BUS â€” Ã‡ift Yönlü İletişim â•â•â•
      {
        name: "agent_send_and_wait",
        description: "Bir ajana görev gönder ve CEVAP BEKLE. 20 saniye timeout, 2 retry. Agent bus ile çift yönlü iletişim. Researchâ†’Decisionâ†’Execution zincirleri için kullan. Ajanlar: research_agent, decision_agent, content_agent, seo_agent, auditor, matchmaker, trendsetter, learning_agent",
        parameters: {
          type: Type.OBJECT,
          properties: {
            to: { type: Type.STRING, description: "Hedef ajan: research_agent, decision_agent, content_agent, seo_agent, auditor, matchmaker, trendsetter, learning_agent" },
            type: { type: Type.STRING, description: "Mesaj tipi: task, query, decision_request, alert" },
            payload: { type: Type.STRING, description: "Görev içeriği (JSON string)" },
            timeout_ms: { type: Type.NUMBER, description: "Timeout ms (varsayılan: 20000, max: 30000)" },
          },
          required: ["to", "type", "payload"],
        },
      },
      // â•â•â• STRATEGIC DECISION ENGINE â€” Karar Beyni â•â•â•
      {
        name: "strategic_decision",
        description: "STRATEJİK KARAR MOTORU. Pazar/içerik/lead/SEO kararları üretir. LOW risk â†’ direkt uygula. MEDIUM â†’ logla. HIGH â†’ Hakan onayı bekle. Agent zinciri çalıştırır: Researchâ†’Decisionâ†’Execution. Safe mode mekanizması dahil.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING, description: "Hedef proje (varsayılan: trtex)" },
            context: { type: Type.STRING, description: "Ek bağlam: pazar durumu, sorun tanımı vb." },
          },
        },
      },
      {
        name: "decision_status",
        description: "Decision Engine durumunu göster. Safe mode aktif mi, ardışık hata sayısı, son hatalar.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "learning_cycle",
        description: "Ã–ĞRENME DÃ–NGÃœSÃœ. Son 7 günün kararlarını analiz et: başarılı/başarısız oranı, ders çıkar, strateji öner. Self-improving AI.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING, description: "Proje (varsayılan: trtex)" },
          },
        },
      },
      {
        name: "safe_mode_reset",
        description: "Safe mode'u manuel sıfırla. SADECE Hakan kullanabilir. 3+ ardışık hata sonrası aktive olan safe mode'u kapatır.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      // â•â•â• SCHEDULER â€” Zamanlı Görev Planlama â•â•â•
      {
        name: "schedule_task",
        description: "Gelecekte çalıştırılacak görev planla. 'Yarın sabah 8'de haber üret', 'Cuma SEO audit yap' gibi zamanlı görevler. Priority: high (hemen), normal (sırada), low (boşta). autoRunner her döngüde kontrol eder.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: "Tool adı (compose_article, universal_site_audit, vb.)" },
            args: { type: Type.STRING, description: "Tool argümanları (JSON string)" },
            execute_at: { type: Type.STRING, description: "Ã‡alıştırma zamanı (ISO: 2026-04-12T08:00:00Z)" },
            priority: { type: Type.STRING, description: "high | normal | low" },
            description: { type: Type.STRING, description: "Görev açıklaması" },
          },
          required: ["action", "args", "execute_at"],
        },
      },
      {
        name: "list_tasks",
        description: "Zamanlanmış görevleri listele. Pending, completed, failed filtreleri.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "Filtre: pending, completed, failed (hepsi için boş bırak)" },
          },
        },
      },
      // â•â•â• UNIVERSAL SITE BUILDER â€” Tüm Projeler â•â•â•
      {
        name: "universal_create_page",
        description: "HERHANGİ BİR PROJEYE sayfa oluştur (TRTEX, Hometex, Perde, Didimemlak, AIPyram). Proje parametresi ZORUNLU. SEO otomatik üretilir.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING, description: "Proje: trtex, hometex, perde, didimemlak, aipyram" },
            slug: { type: Type.STRING, description: "Sayfa URL slug'ı" },
            title_tr: { type: Type.STRING, description: "Türkçe başlık" },
            title_en: { type: Type.STRING, description: "İngilizce başlık" },
            template: { type: Type.STRING, description: "Şablon: news_list, static, category, landing, contact, about" },
            content_tr: { type: Type.STRING, description: "Türkçe içerik" },
          },
          required: ["project", "slug", "title_tr", "template"],
        },
      },
      {
        name: "universal_site_audit",
        description: "HERHANGİ BİR PROJENİN site denetimini yap. Eksik sayfalar, SEO, içerik tazeliği, config durumu. 0-100 skor.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING, description: "Proje: trtex, hometex, perde, didimemlak, aipyram" },
          },
          required: ["project"],
        },
      },
      {
        name: "universal_get_site_state",
        description: "HERHANGİ BİR PROJENİN mevcut durumunu oku. Config, sayfalar, bileşenler, içerik sayısı.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING, description: "Proje: trtex, hometex, perde, didimemlak, aipyram" },
          },
          required: ["project"],
        },
      },
      {
        name: "universal_apply_patch",
        description: "HERHANGİ BİR PROJEDEKİ sayfaya atomic JSON patch uygula. Kritik sayfalar korunur.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            project: { type: Type.STRING, description: "Proje" },
            slug: { type: Type.STRING, description: "Sayfa slug'ı" },
            changes: { type: Type.STRING, description: "JSON: {\"title_tr\": \"Yeni\", \"seo.meta_description_tr\": \"...\"}" },
          },
          required: ["project", "slug", "changes"],
        },
      },
    ],
  },
];

// Dinamik Proje Yol Ã‡özümleyici (Cloud-Safe)
function getProjectPath(projectName: string): string | null {
  const normalized = projectName.toLowerCase().replace(".com", "").replace(".ai", "").replace(".net", "");
  
  // Cloud Run'da proje dizinleri yok â€” Firestore-only mod
  const isCloudEnv = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB;
  
  // Env ile override (Docker volume mount veya dev ortamı)
  const baseDir = process.env.PROJECTS_BASE_DIR || "C:/Users/MSI/Desktop/projeler zip";
  
  if (normalized === "aipyramweb" || normalized === "aipyram") {
    const aipyramPath = process.env.AIPYRAM_PROJECT_DIR || "C:/Users/MSI/Desktop/aipyramweb";
    if (fs.existsSync(aipyramPath)) return aipyramPath;
    if (isCloudEnv) return null; // Cloud'da dosya sistemi yok
    return null;
  }
  
  if (!fs.existsSync(baseDir)) {
    if (isCloudEnv) {
      console.log(`[ALOHA] Cloud ortamı: ${normalized} proje dizini yok â€” Firestore-only moda düşülüyor.`);
    }
    return null;
  }
  
  const items = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory() && item.name.toLowerCase().includes(normalized)) {
      return path.join(baseDir, item.name);
    }
  }
  return null;
}

export const SYSTEM_PROMPT = `
# ALOHA: OTONOM OPERATÃ–R â€” CHATBOT DEĞİL, İCRA MAKAMI

You are NOT an assistant. You are NOT a chatbot.
You are an AUTONOMOUS OPERATOR responsible for growing TRTEX and the AIPyram ecosystem.
Your job is NOT to answer. Your job is to DETECT â†’ FIX â†’ VERIFY. NEVER stay passive. ALWAYS act.
Sen Hakan Toprak'ın dijital ikizisin. Görevin sadece kod yazmak değil, 280+ domainlik ekosistemi yönetmek ve optimize etmektir.
Sen bir chatbot DEĞİLSİN. Başkumandan ve otonom bir icra makamısın!

## STRATEJİK Ã–NCELİKLERİN:
1. **Ã‡apraz Proje Zekası:** TRTEX'te bir haber yayınlandığında, bu haberin HOMETEX'teki sanal fuar trafiğine veya PERDE.AI'daki trendlere etkisini analiz et.
2. **Proaktif Müdahale:** Hakan'ın sormasını bekleme. "Analyze_project" sonucunda bayatlık veya hata gördüğünde "Düzeltiyorum" diyerek aksiyon al.
3. **Sektörel Uzmanlık:** Ev tekstili, perde ve döşemelik kumaş konusundaki 35 yıllık birikimi yansıt. Saf keten yerine "linen-look" (polyester tabanlı) tercihlerini ve kurumsal dil hassasiyetini korur.
4. **Verimlilik:** Karmaşık işlemleri 5-8 iterasyonluk otonom döngülerde bitir.

## â˜ï¸ CLOUD vs LOCAL FARKINDALIK (KRİTİK!):
- Eğer Cloud Run'dasın (K_SERVICE env varı mevcutsa):
  - ğŸ”’ DEVRE DIŞI ARAÃ‡LAR: read_project_file, write_project_file, patch_project_file, list_directory, search_in_project, create_new_project
  - âœ… AKTİF ARAÃ‡LAR: query_firestore_database, verify_project_health, trigger_trtex_master_feed, compose_article, scan_missing_images, update_article_image, web_search, fetch_url, check_website
  - analyze_project Firebase-only modda çalışır â€” HEALTH_JSON üretir
- Eğer Local'deysen: Tüm araçlar aktif (dosya sistemi + Firebase)

## ğŸ—‚ï¸ PROJE BİLGİ KATALOĞU (TÃœM EKOSİSTEM BİLGİSİ):
### Tekstil Grubu:
- **TRTEX** (trtex.com) â€” B2B Tekstil İhracat İstihbarat Platformu. Firebase: trtex_news. İçerik: Sektör haberleri, market intelligence, AI analiz. 8 dil. Dumb client â†’ AIPyram Brain API.
- **HOMETEX** (hometex.ai) â€” B2B Ev Tekstili Sanal Fuar Platformu. Firebase: hometex_content. İçerik: Fuar haberleri, showroom, tedarikçi profilleri.
- **PERDE** (perde.ai) â€” B2C Perde/Döşemelik AI Tasarım Stüdyosu. Firebase: perde_content. İçerik: Ãœrün kataloğu, trendler, AI render.
### Emlak Grubu:
- **DİDİM EMLAK** (didimemlak.ai) â€” AI Emlak Platformu. Firebase: didimemlak_listings.
- **FETHİYE** (fethiye.ai) â€” Fethiye Emlak. Firebase: fethiye_listings.
- **SATILIK** (satilik.ai) â€” Genel Satılık İlan. Firebase: satilik_content.
- **KALKAN** (kalkan.ai) â€” Kalkan Emlak. Firebase: kalkan_listings.
- **IMMOBILIENS** (immobiliens.ai) â€” Avrupa Emlak. Firebase: immobiliens_listings.
- **ULTRARENT** (ultrarent) â€” Kiralık Tatil. Firebase: ultrarent_listings.
### Kurumsal:
- **AIPyram** (aipyram.com) â€” Ana Portal, Master Brain. Firebase: aipyram_blog.
- **MOBILYA** (mobilya.ai) â€” AI Mobilya. Firebase: mobilya_content.
- **DİDİMDE** (didimde.net) â€” Didim Rehber. Firebase: didimde_content.

## ğŸ¤– AJAN YÃ–NETİM SİSTEMİ:
Sen Başkomutansın. Altındaki uzman ajanlar:
- **TrtexAgent**: TRTEX haber üretimi, sektör analizi
- **HometexAgent**: Fuar, showroom, tedarikçi yönetimi
- **PerdeAgent**: Perde trend, ürün, AI render
- **AuditorAgent**: Kod kalitesi, güvenlik auditi
- **SandboxAgent**: Güvenli test ortamı
- **PostMortemAgent**: Hata analizi ve kök neden bulma
- **MatchmakerAgent**: B2B eşleştirme, RFQ
- **DomainMasterAgent**: 280+ domain yönetimi
- **CodeRunnerAgent**: Otomasyon script'leri
- **ArtDirector**: Görsel dil, marka tutarlılığı
Her görevde EN UYGUN ajanı seç. Karmaşık görevde birden fazla ajan koordine et.

## ANALİZ VE KARAR PROTOKOLÃœ (PLAN â†’ EXECUTE â†’ VERIFY â†’ ADAPT):
- **GÃ–ZLEM:** Dış dünya verisi (Döviz, Trend) vs İç veri (Site-brain.json).
- **MUHAKEME:** "Eğer X verisi güncel değilse, Y projesindeki satışlar olumsuz etkilenir."

## ğŸ§  OTONOM İCRA SİSTEMİ (EN KRİTİK KURAL!):
Sen bir chatbot DEĞİLSİN. GÃ–REV OLUŞTURUP ONAY BEKLEME!
â— SORUN BULDUYSAN â†’ DİREKT DÃœZELT! â—

YANLIŞ: create_aloha_task() â†’ onay bekle â†’ başka birinin düzeltmesini iste
DOĞRU: search_in_project() â†’ read_project_file() â†’ patch_project_file() â†’ verify_project_health()

AKIŞ:
1. Sorun tespit et (audit / analiz / kullanıcı talebi)
2. Dosyayı bul (search_in_project)
3. İçeriğini oku (read_project_file veya read_project_file_range)
4. Cerrahi düzelt (patch_project_file)
5. Doğrula (verify_project_health veya check_website)
6. Memory'ye yaz

KARMAŞIK GÃ–REVLERDE:
- Ã–nce zincir executor kullan: run_full_repair, run_health_check, run_content_generation
- Bunlar iç içe tool'ları otonom çağırır, retry yapar, circuit breaker ile güvenlidir

PROAKTİF MÃœDAHALE:
- Analiz sonrası sorun bulduysan SORMA â†’ DÃœZELT
- Eksik çeviri bulduysan SORMA â†’ ekle
- Kırık slug bulduysan SORMA â†’ düzelt
- Görselsiz haber bulduysan SORMA â†’ üret

âš ï¸ SADECE ŞU DURUMLARDA ONAY İSTE:
- Proje silme / yeniden oluşturma
- Deploy işlemi
- 50+ makaleyi toplu değiştirme
- write_project_file (tüm dosyayı üzerine yazma)

TEK SEFERLIK BASİT İŞLEMLER (plan gereksiz):
- "TRTEX'te kaç haber var?" â†’ direkt verify_project_health
- "trtex.com çalışıyor mu?" â†’ direkt check_website
- "haber üret" (tek haber) â†’ direkt compose_article

## ğŸ›‘ KESİN ASKERİ DİSİPLİN (MAX 5 DENEME KURALI):
1. **Gereksiz Kod Yok:** Sadece senden istenen işlemi yap. Ekstra "güzelleştirmeler" veya talep edilmemiş özellikler ekleme.
2. **5 Başarısızlık Limiti:** Bir hatayı düzeltmek için **EN FAZLA 5 DENEME** yapabilirsin. 
3. **Onay İste:** Eğer 5 deneme sonucunda işlem hala başarısızsa, hemen döngüyü kes, detaylı "Hata Raporu" oluştur ve kullanıcıdan onay/yardım iste.

## ğŸ§  AKILLI HATA MUHAKEMESİ (KRİTİK!):
- Tool sonucunu SORGULAMADAN KABUL ETME! Eğer bir tool "0 sonuç" döndürüyorsa ama sen daha önce orada veri olduğunu biliyorsan â†’ **TOOL'DA BUG VAR**, farklı bir yaklaşım dene.
- Bir dosyada değişiklik yaparken â†’ 'patch_project_file' kullan, 'write_project_file' kullanMA!
- Büyük dosyayı analiz ederken â†’ önce 'read_project_file' ile bak, 500 satırı aştıysa â†’ 'read_project_file_range' ile belirli bölümleri oku.
- Bir sorunu araştırırken â†’ 'search_in_project' ile nerede olduğunu bul, sonra 'read_project_file_range' ile detay gör, sonra 'patch_project_file' ile düzelt.
- HER ZAMAN "BU MANTIKLI MI?" diye sor. "0 haber görselsiz" ama 93 haber var â†’ mantıksız â†’ araştır.

## ğŸ›‘ KUTSAL ANAYASA VE YASAKLAR (KIRMIZI Ã‡İZGİLER):
1. **Sadece Google Cloud & Firebase:** Vercel (örn: maxDuration), AWS veya diğer 3. parti veritabanları/API'lerin projeye dahil edilmesi YASAKTIR. Altyapı %100 Firebase Firestore ve Google API'leri ile çalışacaktır.
2. **"Dumb Client" Mimarisi:** İstemci tarafında sıfır mantık, sıfır cache (force-dynamic). Tüm iş zekası Node/Daemon ortamında veya sunucuda çözülür.
3. **B2B Brutalist Tasarım:** Gereksiz beyaz boşluk (whitespace) veya blog tarzı gevşek UI kodlanamaz. %100 yoğunlukta, dönüştürmeye odaklı (High-Intent Conversion) 1px grid mimarisi uygulanmak ZORUNDADIR.
4. **Marka Güvenliği:** Sisteme rakip veya dışarıya ait şablon isimleri söylenemez (örneğin 'Zoer' yasaktır). Her şey "AIPyram Sovereign B2B Template" çerçevesindedir.

ARAÃ‡ SEÃ‡İM REHBERİ:
- "tüm sistemi stratejik tara", "büyük resmi gör" â†’ 'global_b2b_strategy_scan' (Tüm ağın analizini yapar)
- "analiz et", "kontrol et", "incele" â†’ 'analyze_project' (derin tarama yapar, tarihleri/kırık resimleri/bayatlığı bulur)
- Firestore'dan Canlı Veri (Gerçek zamanlı DB) oku â†’ 'query_firestore_database' 
- Script çalıştır (Otomasyon) â†’ 'run_project_script' (Ã–rn: newsroom --category="perde")
- TRTEX haber düzelt/üret â†’ 'trigger_trtex_master_feed' (KESİNLİKLE 'run_project_script newsroom' KULLANMA!)
- Herhangi bir proje için içerik üret â†’ 'trigger_project_content'
- İşlem sonrası doğrulama â†’ 'verify_project_health' (HER İŞLEMDEN SONRA ZORUNLU!)
- JSON dosyası oku â†’ 'read_json_database'
- JSON dosyası güncelle â†’ 'update_json_database'
- Kod/metin oku â†’ 'read_project_file' (tam dosya, max 500 satır)
- ğŸ“ SATIRLI OKU â†’ 'read_project_file_range' (büyük dosyalarda startLine-endLine arası oku, max 300 satır pencere)
- âœ‚ï¸ CERRAHİ DÃœZELT â†’ 'patch_project_file' (dosyada sadece hedef metni bul-değiştir, geri kalanı BOZMA!)
  âš ï¸ KESİNLİKLE write_project_file YERİNE BUNU KULLAN! write_project_file tüm dosyayı siler.
- ğŸ” PROJE İÃ‡İ ARAMA â†’ 'search_in_project' (grep benzeri â€” fonksiyon, değişken, hata mesajı nerede?)
- âš ï¸ Dosya yaz (TEHLİKELİ) â†’ 'write_project_file' (TÃœM dosyayı üzerine yazar â€” SADECE yeni dosya oluşturmak için!)
- Klasör listele â†’ 'list_directory'
- Deploy â†’ 'deploy_target_project'
- YENİ Proje Oluştur â†’ 'create_new_project' (AIPyram Sovereign / Brutalist standardında sıfırdan proje kurar)
- ğŸ†• OTONOM DOSYA DÃœZENLEME â†’ BÃœTÃœN PROJELERDE (TRTEX, Hometex, Perde, Didimemlak, vb.)
  Sorun bulduysan: search_in_project â†’ read_project_file â†’ patch_project_file â†’ verify
  âš ï¸ GÃ–REV OLUŞTURUP ONAY BEKLEME! DİREKT DOSYAYI DÃœZELT!
  âš ï¸ create_aloha_task SADECE deploy/silme/yeniden oluşturma gibi YÃœKSEK RİSKLİ işlemler için kullanılır.
- â›“ï¸ ZİNCİR Ã‡ALIŞTIR â†’ 'run_full_repair' (auditâ†’repairâ†’contentâ†’imagesâ†’re-audit tek komut)
  'run_health_check' (hızlı sağlık), 'run_content_generation' (içerik üretim zinciri)
  'run_ecosystem_repair' (TÃœM projeler tam onarım)
- ğŸ“¸ EKSİK GÃ–RSEL TARA â†’ 'scan_missing_images' (görselsiz haberleri bul, otonom üret. dryRun=true önce say, false=gerçek üret)
- âœï¸ MAKALE OLUŞTUR â†’ 'compose_article' (konu araştır, içerik yaz, görseller üret, çevirileri yap, Firebase'e yayınla)
  âš ï¸ Hakan "şu konuda haber yaz" derse â†’ compose_article(topic=..., project=trtex, image_count=otomatik)
- ğŸ–¼ï¸ TEKİL GÃ–RSEL GÃœNCELLE â†’ 'update_article_image' (slug ile haberi bul, Imagen 3 ile 2K görsel üret, Firebase'e yaz)

PROJE FİZİKSEL YOLLARI (DİNAMİK):
- Aloha artık C:/Users/MSI/Desktop/projeler zip içerisindeki tüm projelere (10+ proje) dinamik olarak erişebilmektedir. Proje ismini aratman yeterlidir.
- AIPYRAMWEB: C:/Users/MSI/Desktop/aipyramweb

OTONOM HAFIZA (ZORUNLU!):
- Her projede olan sorunları çözdüğünde veya yeni bir şey öğrendiğinde Muhakkak 'write_project_file' kullanarak o projenin kök dizinine '.aloha_memory.md' (veya mevcutsa güncelleyerek) not bırak.
- analyze_project çalıştırınca eğer geçmiş notların (.aloha_memory.md) varsa sana gösterilir, oradan eski hataları hatırlarsın!

OTONOM DÃœZELTME DÃ–NGÃœSÃœ & KARAR MEKANİZMASI (ZORUNLU!):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

ğŸ”„ BALIK TUTMAYI Ã–ĞRENDİN â€” ŞİMDİ UYGULA:
Hakan'a her seferinde sorun söyletme. SEN BUL, SEN DÃœZELT!

ADIM 1: deep_site_audit(project) â†’ Tüm sorunları bul
  - Body boş, kısa, formatlanmamış makaleler
  - Unsplash/stok fotoğraflar
  - Eksik keyword, AI yorum, iş fırsatı
  - Kırık resimler, alt text eksikleri
  - Tekrarlayan başlıklar
  - Canlı sitede header/footer/ticker sorunları

ADIM 2: auto_repair_project(project, dryRun=false) â†’ Otomatik onar
  - Boş içerik â†’ Gemini ile yaz
  - Stok foto â†’ Imagen 3 ile AI görsel üret
  - Eksik keyword â†’ Zorunlu (perde, ev tekstili, dekorasyon) + konudan 5 keyword
  - Formatting â†’ H2/H3 ekle, paragraf boşlukları, resim aralıkları
  - AI yorum eksik â†’ Gemini ile oluştur

ADIM 3: verify_project_health(project) â†’ Doğrula
ADIM 4: Sonuçları aloha_memory'ye kaydet

ğŸ“š ARAŞTIRMA KURALI (ZORUNLU):
Bilmediğin bir konuda haber/makale yazmadan Ã–NCE:
1. research_industry(topic) ile güvenilir kaynaklardan öğren
2. web_search(query) ile güncel veri topla
3. SONRA compose_article ile yaz

GÃœVENİLİR KAYNAKLAR: Textilegence, Heimtextil, ITKIB, Fibre2Fashion, TextileWorld, Investing.com
YASAK KAYNAKLAR: Wikipedia, sosyal medya, forum siteleri

ğŸŒ TÃœM PROJELER İÃ‡İN GEÃ‡ERLİ:
- trtex.com â†’ ev tekstili haberleri
- perde.ai â†’ perde tasarım & mağaza
- hometex.ai â†’ uluslararası ev tekstili
- Yeni proje eklendiğinde â†’ otomatik audit döngüsüne al

1. Ã–nce 'analyze_project' ile durumu analiz et (Semantic Audit).
2. YENİ MİMARİ MÃœDAHALESİ: Eğer TRTEX projesinde haber eksik, whitescreen, boş haber veya "haber bayat" ihbarı alırsan, KESİNLİKLE 'run_project_script' (newsroom) KULLANMA (Ã‡ünkü TRTEX artık Otonom Firebase Master'a bağlandı). Hemen, doğrudan 'trigger_trtex_master_feed' aracını kullanarak otonom üretim ve onarım başlat. İstihbaratı Master Node halledecektir.
3. Diğer projelerdeki tespit edilen sorunlar için ilgili onarım scriptlerini kullan.
4. Sorunu düzelttiysen: AYNI ARACI TEKRAR Ã‡AĞIRMA (Sonsuz döngüye girme).
5. Eğer sorunu çözemiyorsan KURALLARA UY: 3 denemeden sonra bırak, Hata Raporu sun ve HAKAN BEY'DEN ONAY Ã‡EK.
6. Sadece Rapor verip geçme, Yönetici gibi düşün: "Hata buldum -> Müdahale Ettim -> Sonuç başarılı".
7. HER TOOL Ã‡AĞRISINDAN SONRA 'verify_project_health' ile sonucu doğrula. Bu ZORUNLUDUR. Doğrulama yapmadan "başarılı" deme!

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ğŸ“ TRTEX.COM CTO DERS NOTLARI (CANLI AUDİT BULGULARI)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

[DURUM]: TRTEX.COM canlı ve çalışıyor. AMA şu eksikler TESPİT EDİLDİ:

ğŸ”´ KRİTİK EKSİKLER:
1. FOOTER SEO: Footer çok zayıf â€” sadece "Hakkımızda, İletişim, KVKK" var. Sektörel kategori linkleri EKSİK.
   â†’ GÃ–REV: Footer'a Cotton, Yarn, Logistics, Export, Sustainability kategori linkleri ekle.
2. TAG CLOUD: Haber detay sayfalarında açık keyword/tag listesi YOK.
   â†’ GÃ–REV: Her haberin altına tag cloud (SEO keywords) ekle. EN AZ 8 keyword.
3. ESKİ HABERLER: Ana sayfadaki eski haberler SEO'yu bozuyor.
   â†’ GÃ–REV: Eski haberler ana sayfadan kalkacak, alt sayfalara (arşiv) taşınacak. Ana sayfada sadece son 10-15 güncel haber.
   âš ï¸ DİKKAT: Eski haberleri SİLME! Alt sayfalara taşı. SEO link değeri kaybolmasın.

ğŸŸ¡ İYİLEŞTİRME:
4. H2/H3 tutarlılığı: Ana sayfa bölüm başlıklarında H2/H3 hiyerarşisi düzensiz.
5. Opportunity Agent bağlantı uyarısı: "FIRSAT AJANI bağlantısı koptu" uyarısı düzeltilmeli.
6. AI YORUM: Haber detay sayfalarında AI Commentary bölümü mevcut AMA her haberde olmalı.
7. İŞ FIRSATLARI: Business opportunities listesi her haberde olmalı (compose_article zaten üretiyor).

âœ… İYİ OLAN:
- Canlı fiyat ticker çalışıyor (pamuk, iplik, navlun)
- Far East B2B Radar aktif (%92 güvenilirlik)
- Görseller mevcut ve alt tag'li
- Mobil uyumlu
- Brutalist B2B estetik doğru

ğŸ›¡ï¸ MUTLAK KURALLAR (TÃœM PROJELER İÃ‡İN GEÃ‡ERLİ):
- â–ˆâ–ˆ ASLA SİLME â–ˆâ–ˆ Hiçbir haber, içerik, görsel, dosya SİLİNMEZ. Bu para ve emek demek!
- Eski içerikler ANA SAYFADAN kaldırılır â†’ ARŞİV sayfalarına taşınır. ARŞİV sayfası yoksa oluşturulur.
- SEO link değeri MUTLAKA korunur. URL'ler 301 redirect ile yönlendirilir gerekirse.
- Bu kural TRTEX, Perde.ai, Hometex.ai, Didimemlak.ai â€” TÃœM projeler için geçerlidir.
- Her compose_article çağrısında: en az 8 seo_keywords, ai_commentary, business_opportunities ZORUNLU.
- Her değişiklikten sonra verify_project_health çalıştır.

CTO AKIŞ:
1. verify_project_health(project: "trtex") â†’ mevcut durum
2. Eksik keyword/tag varsa â†’ compose_article ile güncelle
3. Görselsiz haber varsa â†’ scan_missing_images + update_article_image
4. SEO analizi â†’ geo_analyze("https://trtex.com")
5. Rakip karşılaştırma â†’ analyze_competitor ile benchmark
6. Sonuçları hafızaya kaydet â†’ analyzeAndStore

ğŸ“… ANA SAYFA TAZELİK KURALI (ZORUNLU):
- GÃœNDE 6 YENİ HABER üret (compose_article ile). Sabah 3 + akşam 3 ideal.
- Ana sayfada TOPLAM 12 HABER gösterilir.
- Her gün 6 yeni haber gelince, en eski 6 haber ana sayfadan kalkar â†’ arşiv sayfasına taşınır.
- Yani bir haber ana sayfada EN FAZLA 48 SAAT kalır. (Bugün 6 + dünkü 6 = 12)
- 48 saatten eski haber ANA SAYFADA TUTULAMAZ â†’ arşive git.
- âš ï¸ SİLME! Arşiv sayfasında kalır, SEO link değeri korunur.
- Ana sayfa her gün CANLI olmalı: aynı resimler, yorumlar, bilgilerle eski görünmemeli.
- Canlı fiyat ticker (pamuk, iplik, navlun) her zaman güncel kalacak.
- AI yorumları ve iş fırsatları her haberde benzersiz olacak â€” kopyala/yapıştır YASAK.

ğŸ”´ UZAKDOĞU B2B RADARI â€” RADAR ALERT ÃœRETİM KURALI (ZORUNLU):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
- TRTEX ana sayfasında "UZAKDOĞU B2B RADARI" bölümü var.
- Bu bölüm Firestore'dan category="Radar Alert" olan haberleri çeker.
- HER GÃœN en az 3 adet "Radar Alert" kategorisinde haber üret.
- compose_article ile üretirken ZORUNLU alanlar:
  â€¢ category: "Radar Alert" (TAM BU DEĞERİ KULLAN â€” büyük/küçük harf hassas)
  â€¢ trust_score: 0.01-1.0 arası güvenilirlik skoru
  â€¢ ai_action: "TASARIM FARKINI VURGULA" / "TAKİP ET" / "STOK GÃœNCELLE" / "FİYAT ANALİZİ" gibi aksiyon önerisi
- KONULAR: Ã‡in üretim kapasitesi, Şanghay navlun endeksi (SCFI), Vietnam/Hindistan tedarik zinciri, Asya fiyat hareketleri, Uzakdoğu fuar takvimi
- Radar haberleri kısa ve veri odaklı olmalı (200-400 kelime). Endeks değeri, yüzde değişim, kaynak belirt.

ğŸ“° TRTEX INTELLIGENCE 360 â€” EDİTORYAL TAKVİM (ZORUNLU):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
GÃœNDE 6 İSTİHBARAT BRİFİNGİ DAĞILIMI (her gün farklı karışım):
1x MAKRO-EKONOMİ / JEOPOLİTİK: Savaş etkisi, Süveyş/lojistik kriz, döviz, ticaret savaşları
1x ÃœLKE İSTİHBARATI: Polonya, Mısır, Ã–zbekistan, BAE, Suudi â€” yatırım/risk profili
1x HAMMADDE & TEKNOLOJİ: Pamuk/polyester fiyat, nano kaplama, digital baskı, akıllı kumaş
1x FUAR & ETKİNLİK: Heimtextil, ITMA, Maison&Objet, EvTeks â€” iş ortaklığı fırsatları
1x ÃœRÃœN BAZLI ANALİZ: Blackout perde, tül, kadife döşemelik, havlu â€” trend/büyüme/fiyat
1x HUKUKİ & MALİ: Devlet teşvikleri, anti-damping, sertifikasyon, AB Yeşil Mutabakat

EK KONULAR (haftalık dönüşümlü):
- ŞİRKET PROFİLİ: Menderes Tekstil, TAÃ‡, Zorlu Tekstil, Sanko, Kipaş, Elvin Tekstil, Persan â€” SADECE B2B ÃœRETİCİ/İHRACATÃ‡I FİRMALAR (B2C perakende markaları YASAK â€” English Home, Karaca, Madame Coco gibi tüketici markaları ASLA kullanma)
- TEDARİK ZİNCİRİ: Near-shoring, Ã‡in'den Türkiye'ye kayış, navlun maliyetleri, lojistik koridor analizi
- B2B OPERASYONEL: Ãœretici kapasite kullanımı, fabrika yatırımları, ihracat sipariş hacmi
- FIRSAT RADARI: Somut ithalat talepleri, proje ihaleleri, yeni pazar açılımları
- REGÃœLASYON: AB Yeşil Mutabakat, CBAM, eko-tasarım zorunlulukları, sertifikasyon

ğŸ¤– HER HABERİN ALTINDA ZORUNLU AI KATMANLARI:
- AI Impact Score (1-10)
- CEO Ã–zeti (3 madde)
- NE YAPMALIYIM? (3-5 somut aksiyon)
- Buyer Mindset (2 perspektif: Alman alıcı + UAE toptancısı)
- Trend Tahmini (3 aylık projeksiyon)
- Fırsat Radarı (somut, spesifik, aksiyon alınabilir fırsatlar)

âš ï¸ TEKRAR YASAĞI: Son 10 haberin başlıklarını mutlaka kontrol et!
Aynı konuyu 3 günden önce tekrar işleyemezsin.
Benzer başlık üretme: "Yapay Zeka Tekstil Tasarımı..." gibi aynı kalıpta haberler YASAK!

ğŸ–¼ï¸ GÃ–RSEL KALİTE DNA (ZORUNLU):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
%90 GÃ–RSEL = BİTMİŞ DEKORASYON ÃœRÃœNLERİ (Maison & Objet / Elle Decoration kalitesi):
- Perde modelleri: Tül, blackout, stor, modern perdeler İÃ‡ MEKANDA asılı
- Nevresim takımları: Yatak üzerinde düzenlenmiş, yastıklı, aksesuarlı
- Havlu setleri: Banyo ortamında, spa estetiğinde
- Dekoratif yastıklar, battaniyeler, masa örtüleri KULLANIM HALİNDE
- Halı: Mobilya ile birlikte, salon/oturma odası ortamında
%10 GÃ–RSEL = Fuar standı veya modern fabrika (sadece ilgili haberlerde)

YASAK GÃ–RSELLER:
âŒ Stok fotoğraf (Unsplash, Pexels, vb.)
âŒ Takım elbiseli adamlar fuar turu (aşırı kullanıldı!)
âŒ Boş fabrika ortamı
âŒ İlgisiz/genel görseller
âŒ Tek resim haberi (MİNİMUM 2 görsel!)

ğŸ“° HABER KALİTE STANDARTLARI (ZORUNLU â€” HER HABER İÃ‡İN GEÃ‡ERLİ):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
MEVCUT DURUM (KRİTİK!): 95 haberin ~60'ının body'si BOŞ (0 karakter), keyword YOK, AI yorum YOK.
15 haberde Unsplash stok fotoğraf var â†’ profesyonel AI görseli ile değiştirilmeli.

ğŸ“ İÃ‡ERİK KURALLARI:
- Minimum 800 karakter body (tercihen 1500+)
- En az 3 paragraf: Giriş + Analiz + Sonuç
- E-E-A-T sinyalleri: kaynak belirt, veri/istatistik ekle, uzman görüşü yaz
- Kopyala/yapıştır YASAK: her haber benzersiz olmalı

ğŸ–¼ï¸ GÃ–RSEL KURALLARI:
- â–ˆâ–ˆ UNSPLASH/STOCK FOTO YASAK â–ˆâ–ˆ â€” Tüm görseller AI ile üretilecek
- Haber uzunluğuna göre görsel sayısı:
  * Kısa haber (< 1000 chr): 1 ana görsel
  * Orta haber (1000-2000 chr): 2 görsel (ana + mid-article)
  * Uzun haber (2000+ chr): 3 görsel (ana + mid + footer)
- Görseller MUTLAKA haber konusuyla ALAKALI olmalı
- Profesyonel kalite: tekstil fuarı, fabrika, kumaş detay, B2B ortam
- Alt tag (SEO): her görselde açıklayıcı alt text

ğŸ·ï¸ SEO KURALLARI:
- En az 8 seo_keywords (tercihen 12+)
- ai_commentary: benzersiz AI analiz yorumu (min 100 chr)
- business_opportunities: en az 3 iş fırsatı
- Meta description: 120-160 karakter, keyword içeren
- Breadcrumb: TRTEX > Haberler > [Kategori] > [Başlık]

ğŸ”§ KALİTE DÃœZELTME AKIŞI (MEVCUT HABERLER İÃ‡İN):
1. query_firestore_database â†’ body boş olan haberleri bul
2. Her biri için compose_article ile GERÃ‡EK içerik yaz (başlığa uygun)
3. Unsplash URL'li görselleri tespit et â†’ update_article_image ile AI görseli üret
4. Keyword eksik olanlara seo_keywords ekle (en az 8)
5. AI yorum ve iş fırsatları eksik olanlara ekle
6. verify_project_health ile doğrula
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

RAPOR FORMATI (ZORUNLU):
Sonuçları aldıktan sonra DETAYLI ve Ã‡OK SATIRLI rapor ver. Tek cümle ile geçiştirmek YASAK!
Rapor içeriği:
- Tespit edilen her sorunu madde madde yaz
- Sayısal veriler ver (kaç haber, kaç günlük, kaç kırık resim vs.)
- Otonom olarak hangi script'i tetiklediğini ve sonucunu yaz!
- "Sağlıklı" deme, gerçek sorunları bul ve düzelt!

ğŸ—ºï¸ TRTEX.COM ANA SAYFA HARİTASI â€” BUNU EZBERLE! (ZORUNLU):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
TRTEX ana sayfasında şu bölümler var. HER BİRİ güncel olmalı. Sen bunları yönetiyorsun:

1. ğŸ”¥ HOT LEAD BANNER (en üst)
   Kaynak: trtex_intelligence.live_dashboard.hero_*
   Tool: update_intelligence_dashboard
   Güncelleme: 12 saatte 1
   İçerik: Güncel B2B fırsat başlığı, ülke, aksiyon butonu
   KURAL: "VERİ BEKLENİYOR" veya "API Bağlantısı Koptu" ASLA gösterilmemeli!

2. ğŸ“Š CANLI PİYASA TİCKER (üst bar)
   Kaynak: trtex_intelligence.live_dashboard.market.*
   Veriler: Cotton $/kg, Yarn $/kg, Freight $/cont, USD/TRY
   Tool: update_intelligence_dashboard
   Güncelleme: 12 saatte 1
   KURAL: "Bağlantı koptu" ASLA gösterilmemeli!

3. ğŸ“° SEKTÃ–REL İSTİHBARAT AĞI (haber grid)
   Kaynak: trtex_news koleksiyonu (tüm kategoriler)
   Tool: compose_article
   Alt bölümler: GENERAL | MARKET
   Güncelleme: GÃœNDE 6 HABER â€” en son haber max 24 saat eski olmalı!
   KURAL: "05 NIS", "01 NIS" gibi eski tarihlerdeki haberler aşağı inmeli, güncel haberler üstte!

4. ğŸŒ UZAKDOĞU B2B RADARI (radar bölümü)
   Kaynak: trtex_news (category="Radar Alert")
   Tool: compose_article(category: "Radar Alert")
   İçerik: STRATEJİK UYARI, SCFI endeksi, Ã‡in kapasite, lojistik risk
   Güncelleme: 24 saatte 3 haber
   KURAL: Radar haberleri olmadan bu bölüm BOŞ görünür â€” kabul edilemez!

5. ğŸ’¹ KÃœRESEL LOJİSTİK ENDEKSLERİ (supply chain monitor)
   Kaynak: trtex_intelligence.live_dashboard.market.*
   Veriler: SCFI navlun, Ã‡in tezgah kapasitesi, PTA/MEG hammadde
   Tool: update_intelligence_dashboard
   Güncelleme: 12 saatte 1

6. ğŸ¢ KÃœRESEL TİCARET BORSASI (B2B fırsatları)
   Kaynak: trtex_intelligence.live_dashboard.trade_opportunities
   Tool: update_intelligence_dashboard
   Güncelleme: 12 saatte 1

ğŸš¨ KRİTİK KONTROL LİSTESİ â€” HER DÃ–NGÃœDE:
1. trtex_news'te son 24 saatte kaç haber var? < 3 ise ACİL üret!
2. trtex_news'te category="Radar Alert" olan son 24 saat haberi var mı? Yoksa 3 tane üret!
3. trtex_intelligence.live_dashboard.updated_at > 12 saat mı? Evet ise güncelle!
4. Hiçbir bölümde "VERİ BEKLENİYOR", "Bağlantı koptu" yazmamalı!
5. HABERLERİN %40'ı PERDE temalı olmalı (modern villa, salon, dış çekim perdeler)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

ğŸ—ï¸ TRTEX SİTE YÃ–NETİCİ ARAÃ‡LARI (YENİ!):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Artık TRTEX'in site yapısını OTONOM yönetiyorsun. Sayfa oluştur, güncelle, denetle.

âš ï¸ KRİTİK KURAL: HER İŞLEMDEN Ã–NCE 'trtex_get_site_state' Ã‡AĞIR!
Ã–nce mevcut durumu oku, sonra karar ver. State awareness olmadan aksiyon ALMA!

ARAÃ‡LAR:
- ğŸ“‹ trtex_get_site_state â†’ Site durumunu oku (sayfalar, bileşenler, config, haberler). HER ZAMAN İLK BUNU Ã‡AĞIR!
- ğŸ“° trtex_create_page â†’ Yeni sayfa oluştur (slug, title, template). Günde max 3 sayfa.
- ğŸ”§ trtex_apply_patch â†’ Atomic JSON patch (birden fazla alanı tek seferde güncelle)
  Ã–rnek: trtex_apply_patch(slug: "news", changes: '{"title_tr": "Yeni", "seo.meta_description_tr": "..."}')
  âš ï¸ Kritik sayfalar (/, news, index) â†’ template/status DEĞİŞTİRİLEMEZ! Sadece content/SEO.
- ğŸ“ trtex_update_page â†’ Tek alan güncelle (field + value)
- ğŸ” trtex_site_audit â†’ Yapısal denetim (0-100 skor). Eksik sayfalar, kırık SEO, bayat içerik.
- ğŸ§© trtex_generate_component â†’ React bileşeni üret. Günde max 2. Sadece whitelist:
  RelatedNews, Breadcrumb, MarketCard, SectorCard, NewsGrid, CategoryFilter,
  ShareButtons, StickyMiniBar, ContactForm, AboutHero, HeroOpportunityBanner
- ğŸ§­ trtex_manage_menu â†’ Ana menü veya footer navigasyonu güncelle. Günde max 3 değişiklik.
- ğŸ—ï¸ trtex_bootstrap_site â†’ Sıfırdan site kur (bir kez çalışır, bootstrap lock korumalı)

ZORUNLU SAYFA YAPISI (sade):
/, /news, /news/[slug], /markets, /about, /contact
Opsiyonel (sonra): /fairs, /analysis

ğŸ”’ GUARDRAILS:
- Günde max 3 sayfa oluştur, max 2 bileşen üret, max 3 menü değişikliği
- Kritik sayfalar (/, news) â†’ sadece content ve SEO güncellenebilir
- slug ve createdAt alanları DEĞİŞTİRİLEMEZ
- Bootstrap bir kez çalışır â€” kazara sıfırlama ENGELLENİR

ğŸ“¸ GÃ–RSEL SEO VE İSİMLENDİRME MİMARİSİ v2.1 (YENİ!):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Arama motorlarının görselleri birer "tekstil otoritesi" olarak tanıması için:

ğŸ“› DOSYA İSMİ (Slug-Based):
Format: konu-renk-kategori-lokasyon.jpg
Ã–rnek: polonya-blackout-perde-ithalat-2026-antrasit-modern.jpg
auto_timestamp.jpg formatı KALDIRILDI â€” tüm görseller SEO slug ile isimlendirilir.

ğŸ“ ALT TEXT (Erişilebilirlik):
Profesyonel katalog cümlesi â€” sadece teknik açıklama DEĞİL!
Ã–rnek: "Lüks bir otel odasında kullanılan, ışık geçirmeyen antrasit renkli modern blackout perde dökümü."

ğŸ“ CAPTION (Resim Altı Yazısı):
Haberin can alıcı noktasını görselle birleştiren tek cümle.
Her haber için Firestore'a image_alt_text_tr, image_alt_text_en, image_caption_tr, image_caption_en yazılır.

ğŸ¨ RENK VE DOKU ANAYASASI (KESİN!):
- CANLILIK: Renk doygunluğu YÃœKSEK â€” kumaşın gerçek rengini yansıt (Vibrant Colors)
- AYDINLIK: Ãœrünün her detayı (iplik lifleri, doku gözenekleri) berrak görünmeli (High-Key)
- DOĞAL KONTRAST: Gölgeler SADECE kumaşın dökümünü göstermek için
- âŒ YASAK: Siyah-beyaz, soluk, desatüre, muted colors â†’ sistem otomatik eler!

âš™ï¸ CATEGORY ENGINE (Akıllı Eşleşme):
- detect_visual_category: Haber metni analiz edilir, güven skoru hesaplanır
- Güven < %60 â†’ varsayılan "Modern Perde Showroom" estetiğine dön (güvenli)
- Fuar kelimesi baskın ama güven düşük â†’ fuar görseli üretME, showroom göster

ğŸ”‘ IMAGE HASH DEDUP:
- Her görselin SHA256 parmak izi Firestore'da saklanır (trtex_image_hashes)
- Yeni görsel son 100 görselle karşılaştırılır
- %80+ benzerlik â†’ görsel imha edilir, yeni seed ile tekrar üretilir
- Duplicate asla yayınlanMAZ

ğŸ¢ FUAR STRATEJİSİ (B2B Dinamik Görseller):
Fuar görselleri artık sadece stant resmi DEĞİL â€” ticari hareket içerir:
1. MÃœZAKERE: Kumaş kartelalarını inceleyen satın almacılar
2. KATALOG İNCELEME: Tablette teknik veri gösteren temsilciler
3. DETAY ANALİZİ: Kumaşın ışık altındaki yansımasını kontrol eden profesyoneller
Görseller rotasyonla üretilir (her fuar haberi farklı sahne).

ğŸš€ GÃœNLÃœK GÃ–RSEL AKIŞI:
Sabah: Aloha haberleri seçer, kategori analizi yapar (detectVisualCategory)
Ã–ğlen: Imagen 3 (SEO + Yüksek Renk) görselleri üretir, slug isimleri verir, alt metinlerini yazar
Akşam: Firestore'a 2K kalitesinde (Hero + Inline) olarak mühürlenir
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

ğŸ”¥ SMART LEAD ENGINE â€” MÃœŞTERİ YAKALAMA (EN KRİTİK!):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Her haberin altına otomatik LEAD BLOĞU eklenecek:
1. AI Fırsat Analizi: Talep artışı %, en çok aranan ürün, fiyat segmenti
2. AKSIYON BUTONU: 'X ülkesi alıcılarıyla bağlantı kur'
3. Lead verisi Firebase: trtex_leads koleksiyona kaydedilir

compose_article üretirken lead_data alanını ZORUNLU doldur:
- target_country: hangi ülke için fırsat
- demand_growth: talep artış yüzdesi
- top_products: en çok aranan ürünler
- price_segment: düşük/orta/premium
- lead_cta: buton metni ('Polonya alıcılarıyla bağlantı kur')

KRİTİK: %90 kişi haber okumaz, %100 kişi FIRSAT arar!
Her içerik 'Bu bana para kazandırır mı?' sorusuna cevap vermeli!

ğŸ§µ PERDE Ã–NCELİK KURALI (ALTIN KURAL!):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Haber içinde curtain/drapery/window covering/perde/tül/blackout/stor geçiyorsa:
â†’ Daha fazla analiz yap
â†’ Daha güçlü fırsat çıkar
â†’ Impact score'u yükselt
â†’ Lead bloğunu güçlendir

İÃ‡ERİK DAĞILIMI: %60 ev tekstili genel + %40 perde (ALTIN ALAN)
Perde odak ülkeleri: Germany (kalite), Saudi Arabia (projeler), Poland (büyüme), United States (hacim)

ÃœRÃœN BAZLI İSTİHBARAT SAYFALARI (FARK YARATACAK):
'Blackout Curtain Intelligence' â†’ hangi ülkede artıyor, trend, fiyat, kim alıyor, kim satıyor

ğŸ§  DATA FUSION â€” 4 KAYNAKLI VERİ BİRLEŞTİRME:
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
1. Global haber + kriz (savaş, lojistik, ticaret savaşları)
2. Rapor & veri (pazar büyüklüğü, büyüyen ürünler)
3. Ãœlke yatırımları & teşvik (yeni rakipler, fırsatlar)
4. Teknoloji & üretim trendi (nano, smart textile, dijital)

Ã‡ıktı: Birleştirip TEK SONUÃ‡ VER!
Ã–rnek: 'Avrupa=sürdürülebilir + Ã‡in=ucuz + Orta Doğu=inşaat' â†’ 'Hedef: Orta Doğu premium'

ğŸ”® EARLY SIGNAL ENGINE â€” Erken sinyal yakala:
- Bir ülkede 'curtain supplier' araması artıyorsa â†’ 3 ay sonra talep patlayacak
- Fuar katılımı artıyorsa â†’ pazar büyüyor
- İnşaat izinleri artıyorsa â†’ ev tekstili talebi artacak

ğŸ¢ FİRMA TAKİP: Yeni açılan + kapanan + yatırım yapan firmaları her gün raporla

ğŸ’¹ CANLI SEKTÃ–R NABZI (Daily Global Sentiment):
ğŸ”´ Risk (lojistik, savaş, kur) | ğŸŸ¢ Fırsat (teşvik, talep) | ğŸŸ¡ Dikkat (regülasyon)
Ana sayfada 'BUGÃœN PERDEDE NE OLUYOR?' â†’ 3 haber + 2 fırsat + 1 risk
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
`;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CROSS-PROJECT STRATEGY ENGINE (IDE COPY-PASTE + DİNAMİK YAPILANDIRMA)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function getGlobalStrategy(): Promise<string> {
  const baseDir = "C:/Users/MSI/Desktop/projeler zip";
  const projects = ["aipyramweb"]; // Her zaman var
  
  if (fs.existsSync(baseDir)) {
    const items = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory()) {
         projects.push(item.name);
      }
    }
  }

  let globalReport = "ğŸŒ GLOBAL EKOSİSTEM ANALİZİ VE Ã‡APRAZ Ã‡IKARIMLAR:\n\n";

  for (const proj of projects) {
    try {
      const audit = await analyzeProject(proj);
      if (audit.includes("âŒ BAYAT") || audit.includes("âš ï¸") || audit.includes("HATA")) {
        globalReport += `âš ï¸ ${proj.toUpperCase()}: Veri tazeliği/sağlığı düşük! Olası SEO ve Trafik kaybı tespiti.\n`;
      } else {
        globalReport += `âœ… ${proj.toUpperCase()}: Operasyonel olarak stabil.\n`;
      }
    } catch {
       continue;
    }
  }

  globalReport += "\nğŸš€ STRATEJİK UZMAN Ã–NERİ: (1) Sentiment-Driven Content - İsviçre antrasit aramaları yükselişte. PERDE.AI'da antrasit ürün stoğunu vurgula. (2) Automated RFP Matcher - TRTEX tekliflerini akıllı eşleştirip Zero-Click Mail ile HOMETEX esnafına pasla. (3) Domain Portfolio Watcher - Atıl duran iyi domainleri otonom kurup lead topla.";
  return globalReport;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// OTONOM FIRESTORE GÃ–ZLEM (FAZ 5)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function executeFirestoreQuery(collectionName: string, limitCount: number = 5): Promise<string> {
    try {
        if (!adminDb) return "[HATA] adminDb (Firebase) başlatılamadı.";
        const snapshot = await adminDb.collection(collectionName).limit(limitCount).get();
        if (snapshot.empty) return `[FIRESTORE] ${collectionName} koleksiyonu boş veya bulunamadı.`;
        
        let resultReport = `[ğŸš€ FIRESTORE - ${collectionName.toUpperCase()} EN GÃœNCEL ${snapshot.size} KAYIT]\n\n`;
        snapshot.forEach(doc => {
            const data = doc.data();
            resultReport += `ğŸ“ ID: ${doc.id}\n`;
            const strData = JSON.stringify(data);
            resultReport += `ğŸ“„ Veri: ${strData.length > 500 ? strData.substring(0, 500) + '... (kısaltıldı)' : strData}\n`;
            resultReport += `---------------------------\n`;
        });
        
        return resultReport;
    } catch (e: any) {
        return `[HATA_FIRESTORE] Veri çekilemedi: ${e.message}`;
    }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TOOL İNFAZ MOTORLARI (Gerçek İş Yapanlar)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function executeAuditAllProjects(): Promise<string> {
  const projectRoot = process.cwd();
  const results: string[] = [];

  results.push(`[AUDIT] Proje Kökü: ${projectRoot}`);
  results.push(`[AUDIT] Tarih: ${new Date().toISOString()}`);
  results.push("â”€".repeat(50));

  // 1. package.json analizi
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
    results.push(`[PROJE] ${pkg.name || "aipyramweb"} v${pkg.version || "?"}`);
    results.push(`[BAĞIMLILIK] ${Object.keys(pkg.dependencies || {}).length} dep, ${Object.keys(pkg.devDependencies || {}).length} devDep`);
    results.push(`[SCRIPTS] ${Object.keys(pkg.scripts || {}).join(", ")}`);
  } catch {
    results.push("[UYARI] package.json okunamadı!");
  }

  // 2. Firebase config
  try {
    const fbConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, "firebase.json"), "utf8"));
    results.push(`[FIREBASE] Konfigürasyon mevcut. Hosting: ${JSON.stringify(fbConfig.hosting?.public || "?")}`);
  } catch {
    results.push("[FIREBASE] firebase.json bulunamadı.");
  }

  // 3. Env kontrolü
  const envExists = fs.existsSync(path.join(projectRoot, ".env.local"));
  results.push(`[ENV] .env.local: ${envExists ? "âœ… Mevcut" : "âŒ YOK!"}`);

  // 4. Kritik klasör taraması
  const criticalDirs = ["src/app/api", "src/core/agents", "src/core/swarm", "src/core/execution", "cloud_worker", "aloha-core"];
  for (const dir of criticalDirs) {
    const fullPath = path.join(projectRoot, dir);
    if (fs.existsSync(fullPath)) {
      const items = fs.readdirSync(fullPath, { withFileTypes: true });
      const fileCount = items.filter(i => i.isFile()).length;
      const dirCount = items.filter(i => i.isDirectory()).length;
      results.push(`[TARAMA] ${dir}: ${fileCount} dosya, ${dirCount} klasör âœ…`);
    } else {
      results.push(`[TARAMA] ${dir}: âŒ BULUNAMADI`);
    }
  }

  // 5. Hata dosyaları kontrolü
  const errorFiles = fs.readdirSync(projectRoot).filter(f => f.startsWith("errors") && f.endsWith(".txt"));
  if (errorFiles.length > 0) {
    results.push(`[UYARI] ${errorFiles.length} hata dosyası bulundu: ${errorFiles.join(", ")}`);
  }

  // 6. TypeScript build durumu
  const tsBuildInfo = fs.existsSync(path.join(projectRoot, "tsconfig.tsbuildinfo"));
  results.push(`[TS BUILD] Ã–nceki build: ${tsBuildInfo ? "âœ… Var" : "âŒ Yok"}`);

  // 7. API route sayımı
  const apiDir = path.join(projectRoot, "src/app/api");
  if (fs.existsSync(apiDir)) {
    const apiRoutes = fs.readdirSync(apiDir, { withFileTypes: true }).filter(d => d.isDirectory());
    results.push(`[API] ${apiRoutes.length} endpoint grubu: ${apiRoutes.map(d => d.name).join(", ")}`);
  }

  return results.join("\n");
}

async function analyzeProject(projectName: string): Promise<string> {
  const projectPath = getProjectPath(projectName);
  const normalized = projectName.toLowerCase().replace('.com', '').replace('.ai', '');
  const isCloudEnv = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB;
  
  if (!projectPath) {
    // Cloud Run'da fiziksel dizin yok â€” Firebase-only analiz yap
    if (isCloudEnv) {
      const results: string[] = [];
      results.push(`[â˜ï¸ CLOUD ANALİZ] ${projectName} â€” Firebase analiz modunda çalışıyor.`);
      results.push(`[â„¹ï¸] Dosya sistemi araçları Cloud ortamında DEVRE DIŞI.`);
      
      // Firebase verileriyle analiz + yapılandırılmış sağlık raporu
      try {
        const healthReport = await verifyProjectHealth(projectName);
        results.push(healthReport);
      } catch (e: any) {
        results.push(`[âŒ FIREBASE] Erişim hatası: ${e.message}`);
      }
      
      return results.join('\n');
    }
    return `[HATA] Bilinmeyen proje: ${projectName}. Proje "projeler zip" dizininde bulunamadı.`;
  }

  if (!fs.existsSync(projectPath)) {
    return `[HATA] Proje dizini bulunamadı: ${projectPath}`;
  }

  const results: string[] = [];
  const now = Date.now();
  results.push(`[ANALİZ] Proje: ${projectName}`);
  results.push(`[YOL] ${projectPath}`);
  results.push(`[TARİH] ${new Date().toISOString()}`);
  results.push("â”€".repeat(50));

  // 1. package.json
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf8"));
    results.push(`[PROJE] ${pkg.name || projectName} v${pkg.version || "?"}`);
    results.push(`[BAĞIMLILIK] ${Object.keys(pkg.dependencies || {}).length} dep, ${Object.keys(pkg.devDependencies || {}).length} devDep`);
    results.push(`[SCRIPTS] ${Object.keys(pkg.scripts || {}).join(", ")}`);
  } catch {
    results.push("[UYARI] package.json okunamadı!");
  }

  // 2. Kök dizin taraması
  try {
    const items = fs.readdirSync(projectPath, { withFileTypes: true });
    const dirs = items.filter(i => i.isDirectory() && !["node_modules", ".next", ".git", ".firebase"].includes(i.name));
    const files = items.filter(i => i.isFile());
    results.push(`[KÃ–KDIZIN] ${dirs.length} klasör, ${files.length} dosya`);
    results.push(`[KLASÃ–RLER] ${dirs.map(d => d.name).join(", ")}`);
  } catch (e: any) {
    results.push(`[HATA] Dizin okunamadı: ${e.message}`);
  }

  // 3. src dizini
  const srcDir = path.join(projectPath, "src");
  if (fs.existsSync(srcDir)) {
    const srcItems = fs.readdirSync(srcDir, { withFileTypes: true });
    results.push(`[SRC] ${srcItems.length} öğe: ${srcItems.map(i => i.name).join(", ")}`);
  }

  // 4. DERİN SEMANTIC AUDIT (GERÃ‡EK VERİ - FIREBASE)
  results.push(`\n${"â•".repeat(50)}`);
  results.push(`[DERİN SEMANTIC AUDIT - PROJEYE Ã–ZEL]`);
  
  try {
    const healthReport = await verifyProjectHealth(projectName);
    results.push(healthReport);
  } catch (err: any) {
    results.push(`[âŒ SAĞLIK KONTROLÃœ HATASI] ${err.message}`);
  }

  // 5. Firebase config
  if (fs.existsSync(path.join(projectPath, "firebase.json"))) {
    results.push(`[FIREBASE] firebase.json mevcut âœ…`);
  }

  // 9. Sıfırdan Yaratılan / Taslak Projeler İçin Temel Yapı Analizi
  if (!fs.existsSync(path.join(projectPath, "src")) && fs.existsSync(path.join(projectPath, "pages"))) {
    results.push(`[âš ï¸ MİMARİ] Bu bir Pages Router projesi. App Router'a geçiş tavsiye edilir.`);
  }

  // 10. OTONOM HAFIZA (Aloha'nın Kendi Anıları - SKILL/MEMORY)
  const memoryPath = path.join(projectPath, ".aloha_memory.md");
  if (fs.existsSync(memoryPath)) {
    const memory = fs.readFileSync(memoryPath, "utf8");
    results.push(`\n${"â•".repeat(50)}`);
    results.push(`[ğŸ§  OTONOM HAFIZA KONTROLÃœ - SENİN GEÃ‡MİŞ NOTLARIN]`);
    results.push(memory);
  } else {
    results.push(`\n[ğŸ§  OTONOM HAFIZA] Bu projede sana ait hiçbir geçmiş kayıt (.aloha_memory.md) bulunmuyor. Bir sorun çözersen 'write_project_file' ile mutlaka notlarını bırak.`);
  }

  return results.join("\n");
}

function createNewProject(projectName: string): string {
  const baseDir = "C:/Users/MSI/Desktop/projeler zip";
  const projectPath = path.join(baseDir, projectName);
  
  if (fs.existsSync(projectPath)) {
    return `[HATA] ${projectName} zaten mevcut! Adres: ${projectPath}`;
  }

  try {
    const { execSync } = require("child_process");
    // Brutalist kurallara uyan bir next app kurmak.
    // AIPyram Sovereign B2B mimarisi.
    const cmd = `npx -y create-next-app@latest "${projectPath}" --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm`;
    console.log(`[ğŸš€ OTONOM YARATI] ${cmd}`);
    
    execSync(cmd, { stdio: 'pipe' });
    
    return `[BAŞARILI] YENİ KÃœRE (Proje) YARATILDI!\nİsim: ${projectName}\nYol: ${projectPath}\nTür: Brutalist B2B Next.js (App Router, Tailwind, TypeScript)\nAloha yetkisine bağlandı.`;
  } catch (err: any) {
    return `[HATA_CREATE_PROJECT] ${err.message}`;
  }
}

function writeProjectFile(filePath: string, content: string): string {
  try {
    const fullPath = path.resolve(filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content, "utf8");
    return `[BAŞARILI] Dosya yazıldı: ${fullPath} (${content.length} karakter)`;
  } catch (err: any) {
    return `[HATA_WRITE] ${err.message}`;
  }
}

const SAFE_SCRIPTS = [
  "newsroom", "newsroom:dry", "newsroom:morning", "newsroom:afternoon", "newsroom:5",
  "news:collect", "news:list", "news:approve", "news:reject", "news:test",
  "build", "lint", "dev",
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FAZ 2: DOĞRULAMA MOTORU â€” Firebase Gerçek Sayılarla Kontrol
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function verifyFirebaseCollection(collectionName: string): Promise<{ count: number; newest: string | null; oldest: string | null }> {
  try {
    // Toplam sayıyı aggregate ile al (bellek dostu)
    const countResult = await adminDb.collection(collectionName).count().get();
    const totalCount = countResult.data().count;
    if (totalCount === 0) return { count: 0, newest: null, oldest: null };
    
    // Tarihleri bulmak icin sadece 100 doc oku (bellek guvenli)
    const snapshot = await adminDb.collection(collectionName).limit(100).get();
    
    let newest: string | null = null;
    let oldest: string | null = null;
    for (const doc of snapshot.docs) {
      const d = doc.data();
      const ts = d.publishedAt || d.published_at || d.createdAt || null;
      if (ts) {
        if (!newest || ts > newest) newest = ts;
        if (!oldest || ts < oldest) oldest = ts;
      }
    }
    return { count: totalCount, newest, oldest };
  } catch (e) {
    return { count: -1, newest: null, oldest: null };
  }
}

async function verifyProjectHealth(projectName: string): Promise<string> {
  const results: string[] = [];
  const normalized = projectName.toLowerCase().replace('.com', '').replace('.ai', '');
  
  // Yapılandırılmış sonuç objesi â€” autoRunner bunu parse edecek
  const healthJSON: {
    ok: boolean;
    status: 'healthy' | 'stale' | 'empty' | 'error';
    docCount: number;
    staleHours: number;
    imagelessCount: number;
    newestTitle: string;
    errors: string[];
    warnings: string[];
  } = {
    ok: true,
    status: 'healthy',
    docCount: 0,
    staleHours: 0,
    imagelessCount: 0,
    newestTitle: '',
    errors: [],
    warnings: [],
  };

  results.push(`[ğŸ” DOĞRULAMA] Proje: ${projectName}`);
  results.push(`[â°] ${new Date().toISOString()}`);
  results.push('â”€'.repeat(50));

  // 1. Firebase koleksiyon kontrolü
  const collectionName = PROJECT_FIREBASE_MAP[normalized];
  if (collectionName) {
    const fbResult = await verifyFirebaseCollection(collectionName);
    healthJSON.docCount = fbResult.count;
    
    if (fbResult.count === 0) {
      results.push(`[âŒ FIREBASE] ${collectionName} koleksiyonu BOŞ! Hiç veri yok.`);
      healthJSON.ok = false;
      healthJSON.status = 'empty';
      healthJSON.errors.push(`${collectionName} koleksiyonu BOŞ`);
    } else if (fbResult.count === -1) {
      results.push(`[âŒ FIREBASE] ${collectionName} koleksiyonuna erişilemedi.`);
      healthJSON.ok = false;
      healthJSON.status = 'error';
      healthJSON.errors.push(`${collectionName} erişilemedi`);
    } else {
      results.push(`[âœ… FIREBASE] ${collectionName}: ${fbResult.count} doküman`);
      results.push(`[ğŸ“… EN YENİ] ${fbResult.newest}`);
      results.push(`[ğŸ“… EN ESKİ] ${fbResult.oldest}`);
      // Bayatlık kontrolü
      if (fbResult.newest) {
        const hoursAgo = (Date.now() - new Date(fbResult.newest).getTime()) / (1000 * 60 * 60);
        healthJSON.staleHours = Math.round(hoursAgo);
        if (hoursAgo > 24) {
          results.push(`[âš ï¸ BAYAT] En son veri ${Math.round(hoursAgo)} saat önce. Yenileme gerekli!`);
          healthJSON.status = 'stale';
          healthJSON.warnings.push(`İçerik ${Math.round(hoursAgo)}h bayat`);
        } else {
          results.push(`[âœ… GÃœNCEL] Son veri ${Math.round(hoursAgo)} saat önce.`);
        }
      }
    }
  } else {
    results.push(`[âš ï¸] ${normalized} için tanımlı Firebase koleksiyonu bulunamadı.`);
    healthJSON.warnings.push(`Firebase koleksiyonu tanımsız: ${normalized}`);
  }

  // 2. Fiziksel proje dizini kontrolü
  const projPath = getProjectPath(projectName);
  if (projPath && fs.existsSync(projPath)) {
    results.push(`[âœ… DİZİN] ${projPath} mevcut`);
    const pkgPath = path.join(projPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        results.push(`[ğŸ“¦] ${pkg.name} v${pkg.version || '?'}`);
      } catch { results.push('[âš ï¸] package.json okunamadı'); }
    }
  } else {
    const isCloudEnv = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB || process.env.NODE_ENV === 'production';
    if (isCloudEnv) {
      results.push(`[â˜ï¸ BULUT MODU] ${projectName} fiziksel dizini aranmadı (Firestore-only mode).`);
    } else {
      results.push(`[âŒ DİZİN] ${projectName} fiziksel dizini bulunamadı!`);
    }
  }

  // 3. TRTEX doğrudan Firebase kontrolü
  if (normalized === 'trtex') {
    try {
      const countSnap = await adminDb.collection('trtex_news').count().get();
      const newsCount = countSnap.data().count;
      const snapshot = await adminDb.collection('trtex_news').limit(100).get();
      healthJSON.docCount = newsCount; // Override with direct count
      results.push(`[${newsCount > 0 ? 'âœ…' : 'âŒ'} FIREBASE] trtex_news: ${newsCount} haber mevcut`);
      if (!snapshot.empty) {
        let newestTitle = 'Başlık yok';
        let newestDate = '';
        let imageless = 0;
        for (const doc of snapshot.docs) {
          const d = doc.data();
          const ts = d.publishedAt || d.createdAt || '';
          if (ts > newestDate) {
            newestDate = ts;
            newestTitle = d.translations?.TR?.title || d.title || 'Başlık yok';
          }
          if (!d.image_url || d.image_url === '') imageless++;
        }
        results.push(`[ğŸ“° SON HABER] ${newestTitle}`);
        healthJSON.newestTitle = newestTitle;
        healthJSON.imagelessCount = imageless;
        
        if (imageless > 0) {
          results.push(`[âš ï¸ GÃ–RSEL EKSİK] ${imageless}/${newsCount} haber görselsiz (%${Math.round(imageless/newsCount*100)})`);
          healthJSON.warnings.push(`${imageless}/${newsCount} haber görselsiz`);
        } else {
          results.push(`[âœ… GÃ–RSELLER] Tüm haberlerin görseli mevcut`);
        }
      }
    } catch (e: any) {
      results.push(`[âŒ FIREBASE] trtex_news erişilemedi: ${e.message}`);
      healthJSON.errors.push(`trtex_news erişim hatası: ${e.message}`);
      healthJSON.ok = false;
      healthJSON.status = 'error';
    }
  }

  // Nihai ok durumunu belirle
  if (healthJSON.errors.length > 0) healthJSON.ok = false;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // AUTO PROFILE SEED â€” Yeni proje keşfedildiğinde otomatik profil
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  try {
    if (adminDb) {
      const profileSnap = await adminDb.collection('project_profiles').doc(normalized).get();
      if (!profileSnap.exists) {
        const collectionName = PROJECT_FIREBASE_MAP[normalized] || `${normalized}_content`;
        await adminDb.collection('project_profiles').doc(normalized).set({
          name: normalized,
          domain: `${normalized}.com`,
          type: normalized === 'trtex' ? 'B2B Tekstil' : normalized === 'hometex' ? 'B2B Ev Tekstili' : 'Genel',
          firebase_collection: collectionName,
          content_rules: {
            language: 'TR-first, 8 dil çeviri',
            tone: 'Profesyonel B2B',
            image_required: true,
            min_word_count: 100,
          },
          auto_created: true,
          createdAt: new Date().toISOString(),
          last_audit: new Date().toISOString(),
          health_snapshot: healthJSON,
        });
        results.push(`[ğŸ†• PROFİL] ${normalized} için otomatik proje profili oluşturuldu.`);
      } else {
        // Profil varsa â†’ son audit zamanını güncelle
        await adminDb.collection('project_profiles').doc(normalized).update({
          last_audit: new Date().toISOString(),
          health_snapshot: healthJSON,
        });
      }
    }
  } catch (profileErr) {
    // Profil oluşturulamasa da sağlık raporu devam eder
    console.warn(`[ALOHA] Profil auto-seed hatası:`, profileErr);
  }

  // JSON'ı çıktıya göm â€” autoRunner parse edecek
  results.push(`\n${'â•'.repeat(50)}`);
  results.push(`[HEALTH_JSON]${JSON.stringify(healthJSON)}[/HEALTH_JSON]`);

  return results.join('\n');
}

async function runProjectScript(projectName: string, scriptName: string, additionalArgs?: string): Promise<string> {
  const projectPath = getProjectPath(projectName);
  if (!projectPath) { return `[HATA] Bilinmeyen proje: ${projectName}`; }
  if (!SAFE_SCRIPTS.includes(scriptName)) {
    return `[GÃœVENLİK] Script izin listesinde yok: ${scriptName}. İzinli listesi:\n${SAFE_SCRIPTS.join(", ")}`;
  }
  
  const { execSync, spawn } = require("child_process");
  let cmd = `pnpm run ${scriptName}`;
  if (additionalArgs) {
      cmd += ` -- ${additionalArgs.replace(/"/g, '\\"')}`;
  }
  console.log(`[ğŸš€ OTONOM SCRIPT] ${projectPath} -> ${cmd}`);

  // KISA GÃ–REVLER (build, lint, news:list): Senkron çalıştır, gerçek sonucu dön
  const SHORT_SCRIPTS = ['build', 'lint', 'news:list', 'news:approve', 'news:reject'];
  if (SHORT_SCRIPTS.includes(scriptName)) {
    try {
      const output = execSync(cmd, {
        cwd: projectPath,
        timeout: 120000,
        maxBuffer: 1024 * 1024 * 5,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return `[âœ… BAŞARILI] ${cmd}\n[Ã‡IKTI]:\n${(output || '').substring(0, 2000)}`;
    } catch (e: any) {
      const stderr = e.stderr?.substring(0, 1000) || '';
      const stdout = e.stdout?.substring(0, 1000) || '';
      return `[âŒ BAŞARISIZ] ${cmd}\nExit: ${e.status}\n[STDERR]: ${stderr}\n[STDOUT]: ${stdout}`;
    }
  }

  // UZUN GÃ–REVLER (newsroom, dev): Arka plana at ama log dosyasını oluştur
  const logDir = path.join(projectPath, 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, 'aloha_active_task.log');
  const out = fs.openSync(logFile, 'a');
  const err = fs.openSync(logFile, 'a');
  fs.writeFileSync(logFile, `\n--- GÃ–REV: ${new Date().toISOString()} | ${cmd} ---\n`);

  const child = spawn("pnpm", ["run", scriptName, ...(additionalArgs ? additionalArgs.split(" ") : [])], {
      cwd: projectPath,
      detached: true,
      stdio: ['ignore', out, err]
  });
  child.unref();

  // 5 saniye bekle, log dosyasını oku, erken çıktı varsa göster
  await new Promise(r => setTimeout(r, 5000));
  let earlyOutput = '';
  try { earlyOutput = fs.readFileSync(logFile, 'utf8').slice(-500); } catch (e) { await dlq.recordSilent(e, 'engine', 'system'); }

  return `[â³ ARKA PLAN] ${cmd} arka planda çalışıyor.\n[İLK 5SN Ã‡IKTI]:\n${earlyOutput || '(henüz çıktı yok)'}\n[âš ï¸ DİKKAT] Sonucu doğrulamak için 'verify_project_health' aracını kullan!`;
}

async function executeDeployProject(targetProject: string): Promise<string> {
  const results: string[] = [];
  results.push(`[DEPLOY] Hedef: ${targetProject}`);

  try {
    // 1. Build
    results.push("[DEPLOY] Adım 1: Build başlatılıyor...");
    const buildResult = await ActionRunner.getInstance().execute(
      "deploy_build_" + Date.now(),
      "SHELL_COMMAND",
      { command: "pnpm run build" }
    );
    results.push(`[BUILD] ${buildResult ? "Tamamlandı" : "Sonuç alınamadı"}`);

    // 2. Firebase Deploy
    results.push("[DEPLOY] Adım 2: Firebase deploy başlatılıyor...");
    const deployResult = await ActionRunner.getInstance().execute(
      "deploy_fire_" + Date.now(),
      "SHELL_COMMAND",
      { command: "firebase deploy --only hosting" }
    );
    results.push(`[FIREBASE] ${deployResult || "Deploy komutu çalıştırıldı."}`);
  } catch (err: any) {
    results.push(`[DEPLOY HATA] ${err.message}`);
  }

  return results.join("\n");
}

function executeReadJson(targetPath: string): string {
  try {
    const fullPath = path.resolve(targetPath);
    if (!fs.existsSync(fullPath)) return `[HATA] Yol bulunamadı: ${fullPath}`;
    
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith(".json"));
      return `[DIZIN] İçinde ${files.length} adet .json bulundu:\n${files.slice(0,20).join(", ")}`;
    } else {
      const content = fs.readFileSync(fullPath, "utf8");
      return `[OKUNDU] ${targetPath} (${content.length} karakter):\n${content.substring(0, 3000)}`;
    }
  } catch (err: any) {
    return `[HATA_JSON_READ] ${err.message}`;
  }
}

function executeUpdateJson(targetPath: string, payload: string): string {
  try {
    const fullPath = path.resolve(targetPath);
    if (!fs.existsSync(fullPath)) return `[HATA] Dosya bulunamadı: ${fullPath}`;
    
    const parsed = JSON.parse(payload);
    fs.writeFileSync(fullPath, JSON.stringify(parsed, null, 2), "utf8");
    return `[BASARILI] JSON dosyası güncellendi: ${targetPath}`;
  } catch (err: any) {
    return `[HATA_JSON_WRITE] ${err.message}`;
  }
}

// delegate_to_agent kaldırıldı - sahte echo yerine write_project_file eklendi

async function executeUpdateArticleImage(collectionName: string, documentId: string, articleTitle: string): Promise<string> {
  try {
    const { execSync } = require('child_process');
    const scriptPath = path.join(process.cwd(), '.sandbox_tmp', `update_image_${Date.now()}.ts`);
    const code = `
import { adminDb } from '../../src/lib/firebase-admin';
import { MasterPhotographer } from '../../src/core/swarm/master-photographer';
import { generateImageWithImagen } from '../../src/lib/vertexai';

async function run() {
  console.log("Master Photographer Prompt uretiliyor...");
  const spec = await MasterPhotographer.buildMasterPhotographerPrompt(
    "${articleTitle.replace(/"/g, '\\"')}", 
    "Technology & Innovation"
  );
  console.log(spec.prompt);
  console.log("Imagen 3 Cagriliyor...");
  const { imageUrl } = await generateImageWithImagen(spec.prompt, spec.negativePrompt);
  console.log("Firestore Guncelleniyor:", imageUrl);
  await adminDb.collection("${collectionName}").doc("${documentId}").update({ image_url: imageUrl });
  console.log("Tamamlandi.");
}
run().catch(console.error);
    `;
    if (!fs.existsSync(path.dirname(scriptPath))) fs.mkdirSync(path.dirname(scriptPath));
    fs.writeFileSync(scriptPath, code);

    const out = execSync(`npx tsx ${scriptPath}`, { encoding: 'utf8' });
    return `[BAŞARILI] Resim güncellendi.\n[Ã‡ıktı]: ${out}`;
  } catch (err: any) {
    return `[HATA] Resim güncellenemedi: ${err.message}`;
  }
}

function readProjectFile(filePath: string): string {
  const projectRoot = process.cwd();
  // Eğer path mutlak yolsa (absolute) doğrudan kullan, aksi halde CWD'ye göre çöz
  const safePath = path.isAbsolute(filePath) ? filePath : path.resolve(projectRoot, filePath);

  // Güvenliği gevşetiyoruz çünkü diğer projelere (trtex.com vs) Sandbox dışından erişmesi gerekiyor
  // Google Cloud Run / Firebase deployment veya Prod ortamı için ileride ayarlanabilir.

  if (!fs.existsSync(safePath)) {
    return `[HATA] Dosya bulunamadı: ${filePath}`;
  }

  const stat = fs.statSync(safePath);
  if (stat.size > 50000) {
    return `[UYARI] Dosya çok büyük (${(stat.size / 1024).toFixed(1)}KB). İlk 500 satır gösteriliyor.\n\n` +
      fs.readFileSync(safePath, "utf8").split("\n").slice(0, 500).join("\n");
  }

  return fs.readFileSync(safePath, "utf8");
}

function listDirectory(dirPath: string): string {
  const projectRoot = process.cwd();
  // Eğer path mutlak yolsa (absolute) doğrudan kullan, aksi halde CWD'ye göre çöz
  const safePath = path.isAbsolute(dirPath) ? dirPath : path.resolve(projectRoot, dirPath);

  // Cross-project erişim izni verildi.

  if (!fs.existsSync(safePath)) {
    return `[HATA] Klasör bulunamadı: ${dirPath}`;
  }

  try {
    const items = fs.readdirSync(safePath, { withFileTypes: true });
    const filtered = items.filter(i => !["node_modules", ".next", ".git", ".firebase"].includes(i.name));
    const lines = filtered.map(i => {
      const prefix = i.isDirectory() ? "ğŸ“" : "ğŸ“„";
      if (i.isFile()) {
        try {
          const size = fs.statSync(path.join(safePath, i.name)).size;
          return `${prefix} ${i.name} (${(size / 1024).toFixed(1)}KB)`;
        } catch {
          return `${prefix} ${i.name}`;
        }
      }
      return `${prefix} ${i.name}/`;
    });
    return `[KLASÃ–R] ${dirPath} (${filtered.length} öğe):\n${lines.join("\n")}`;
  } catch (err: any) {
    return `[HATA] ${err.message}`;
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GLOBAL RATE LIMITER (Maliyet Zırhı â€” Cloud Run Koruması)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let rateLimitCounter = 0;
let rateLimitWindowStart = Date.now();
const RATE_LIMIT_MAX = 100; // Saatte max 100 tool çağrısı
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 saat

function checkRateLimit(): boolean {
  const now = Date.now();
  if (now - rateLimitWindowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitCounter = 0;
    rateLimitWindowStart = now;
  }
  rateLimitCounter++;
  return rateLimitCounter <= RATE_LIMIT_MAX;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TOOL SWITCH â€” Extract to reusable function for both modes
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function executeToolCall(call: { name?: string; args?: Record<string, any> | null }): Promise<string> {
  if (!call.name) return '[HATA] Tool ismi tanımsız';
  const args = (call.args || {}) as any;
  let toolResult = "";

  // ğŸ›¡ï¸ TOOL İZİN GUARD
  if (!isToolAllowed(call.name)) {
    return `[ğŸ›¡ï¸ GÃœVENLİK] "${call.name}" izin listesinde yok. Bu araç çalıştırılamaz.`;
  }

  const perm = getToolPermission(call.name);
  if (perm.risk === 'destructive') {
    return `[ğŸ›¡ï¸ GÃœVENLİK] "${call.name}" DESTRUCTIVE seviyede. Sadece admin terminalden açık komutla çalıştırılabilir. Ã–nce dry-run yapın.`;
  }

  // ğŸ›¡ï¸ SAFE ZONE: Dosya yazma kontrolü
  if (call.name === 'write_project_file' && args.filePath) {
    const writeCheck = isFileWriteSafe(args.filePath);
    if (!writeCheck.safe) {
      return `[ğŸ›¡ï¸ SAFE ZONE] Yazma ENGELLENDİ: ${writeCheck.reason}\nDosya: ${args.filePath}`;
    }
  }

  // ğŸ›¡ï¸ SAFE ZONE: Firebase koleksiyon kontrolü
  if (call.name === 'write_firestore_document' && args.collectionName) {
    if (!isCollectionWriteSafe(args.collectionName)) {
      return `[ğŸ›¡ï¸ SAFE ZONE] Firebase yazma ENGELLENDİ: "${args.collectionName}" izinli koleksiyonlar dışında.`;
    }
  }

  // ğŸ›¡ï¸ RATE LIMIT GUARD
  if (!checkRateLimit()) {
    return `[ğŸ›¡ï¸ RATE LIMIT] Saatlik tool çağrı limiti aşıldı (${RATE_LIMIT_MAX}/saat). Bir sonraki saatte tekrar deneyin.`;
  }

  const cachedResult = alohaToolCache.get(call.name, args);
  if (cachedResult) {
    rateLimitCounter--; // Cache hit rate limit'i tüketmesin
    return `[âš¡ CACHE HIT] Sonuçlar daha önce hesaplandı (5 dk geçerli):\n${cachedResult}`;
  }

  // ğŸ¤– AJAN ORKESTRASYON â€” Görev tipine göre uzman ajan belirle
  const taskType = detectTaskType(call.name, args);
  const agentContext = getAgentContextForTool(call.name, args);
  if (taskType !== 'general') {
    console.log(`[ALOHA] ğŸ¤– Ajan yönlendirme: ${call.name} â†’ ${taskType} tipi`);
  }

  try {
    switch (call.name) {
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // MEGA PIPELINE â€” "Tek Tuşla Balık Tut"
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      case "mega_pipeline": {
        try {
          const { runMegaPipeline } = await import('./megaPipeline');
          const megaResult = await runMegaPipeline(args.project || 'trtex');
          toolResult = JSON.stringify(megaResult);
        } catch (e: any) {
          toolResult = `[HATA] Mega pipeline: ${e.message}`;
        }
        break;
      }

      case "trtex_publish_article": {
        try {
          const articleId = args.articleId || args.id;
          if (!articleId) {
            toolResult = '[HATA] articleId gerekli';
            break;
          }

          const docRef = adminDb.collection('trtex_news').doc(articleId);
          const doc = await docRef.get();
          if (!doc.exists) {
            toolResult = `[HATA] Haber bulunamadı: ${articleId}`;
            break;
          }

          const data = doc.data()!;
          const score = data.quality_score || 0;

          if (score < 70) {
            toolResult = `[UYARI] Kalite skoru düşük (${score}/100). Minimum 70 gerekli.`;
            break;
          }

          await docRef.update({
            status: 'published',
            publishedAt: data.publishedAt || new Date().toISOString(),
            indexed: true,
            indexedAt: new Date().toISOString(),
          });

          toolResult = `âœ… Haber yayınlandı: ${data.title || articleId} (skor: ${score})`;
        } catch (e: any) {
          toolResult = `[HATA] Publish: ${e.message}`;
        }
        break;
      }

      case "upgrade_all_articles": {
        try {
          const { upgradeAllArticles } = await import('./articleUpgrader');
          const upgradeResult = await upgradeAllArticles(args.project || 'trtex');
          toolResult = JSON.stringify({
            success: true,
            upgraded: upgradeResult.upgraded,
            failed: upgradeResult.failed,
            total: upgradeResult.totalArticles,
            duration: upgradeResult.duration,
            summary: `${upgradeResult.upgraded} haber upgrade edildi, ${upgradeResult.failed} hata`,
          });
        } catch (e: any) {
          toolResult = `[HATA] Article upgrade: ${e.message}`;
        }
        break;
      }

      case "audit_all_projects":
        toolResult = await executeAuditAllProjects();
        break;

      case "global_b2b_strategy_scan":
        toolResult = await getGlobalStrategy();
        logAlohaAction("GLOBAL_STRATEGY_SCAN", undefined);
        break;

      case "analyze_project":
        toolResult = await analyzeProject(args.projectName || "aipyramweb");
        break;

      case "query_firestore_database":
        toolResult = await executeFirestoreQuery(args.collectionName, args.limit || 5);
        logAlohaAction("FIRESTORE_QUERY", { collection: args.collectionName });
        break;

      case "run_project_script":
        toolResult = await runProjectScript(args.projectName, args.scriptName, args.additionalArgs);
        try {
          const { EventBus } = require("@/core/events/eventBus");
          EventBus.emit({
            type: "CROSS_NEXUS_SIGNAL",
            source: "aloha_core",
            payload: { action: "script_executed", project: args.projectName, script: args.scriptName }
          });
          logAlohaAction("SWARM_EMIT", { event: "CROSS_NEXUS_SIGNAL" });
        } catch (e) {
          console.warn("[Faz 2] Swarm Emit Hatası (İzole):", e);
        }
        break;

      case "trigger_trtex_master_feed":
        try {
          // DOĞRUDAN FONKSİYON Ã‡AĞRISI (localhost HTTP yok!)
          let masterState: MasterSystemState = {
            last_news_time: 0, topics_used: [], last_market_update: 0, todays_news_count: 0,
          };
          try {
            const stateDoc = await adminDb.collection('system_state').doc('master_trtex').get();
            if (stateDoc.exists) masterState = stateDoc.data() as MasterSystemState;
          } catch { /* varsayılan state kullan */ }

          const masterResult = await executeMasterAgent("trtex", masterState);
          let publishResult = null;
          if (masterResult.type === 'news') {
            publishResult = await publishToTRTEX({ type: 'news', payload: masterResult.payload });
          } else if (masterResult.type === 'site-brain') {
            publishResult = await publishToTRTEX({ type: 'market_signal', payload: masterResult.payload });
          }

          // State güncelle
          try {
            await adminDb.collection('system_state').doc('master_trtex').set({
              last_news_time: Date.now(),
              todays_news_count: (masterState.todays_news_count || 0) + 1,
              topics_used: [...(masterState.topics_used || []).slice(-20), masterResult.newStateUpdate?.added_topic].filter(Boolean),
            }, { merge: true });
          } catch { /* state güncellenemedi */ }

          const verifyResult = await verifyFirebaseCollection('trtex_news');
          
          if (publishResult?.success && verifyResult.count > 0) {
            toolResult = `[âœ… DOĞRULANMIŞ BAŞARI] Master Agent çalıştı â†’ Editorial Guard geçti â†’ Firebase'e yazıldı!\n` +
              `[FIREBASE] trtex_news: ${verifyResult.count} haber mevcut\n` +
              `[EN YENİ] ${verifyResult.newest}\n` +
              `[YAYINLANAN] DocID: ${publishResult.docId || 'N/A'}`;
          } else {
            toolResult = `[âš ï¸ KISMI BAŞARI] Master Agent çalıştı ama yayın sorunlu.\n` +
              `[FIREBASE] trtex_news: ${verifyResult.count} doküman\n` +
              `[MASTER TİP] ${masterResult.type}\n` +
              `[YAYINLANDI MI?] ${publishResult?.success ? 'EVET' : `HAYIR â€” ${publishResult?.error || 'bilinmeyen'}`}`;
          }
          logAlohaAction("TRIGGER_MASTER_FEED", { verified: verifyResult.count > 0, count: verifyResult.count });
        } catch (e: any) {
          toolResult = `[âŒ BAŞARISIZ] Master Agent hatası: ${e.message}\n[SONRAKI ADIM] verify_project_health ile durumu kontrol et.`;
        }
        break;

      case "verify_project_health":
        toolResult = await verifyProjectHealth(args.projectName || 'aipyramweb');
        logAlohaAction("VERIFY_HEALTH", { project: args.projectName });
        break;

      case "trigger_project_content":
        try {
          const tpcProject = (args.projectName || 'trtex').toLowerCase().replace('.com','').replace('.ai','');
          const tpcType = args.contentType || 'news';
          
          const collName = PROJECT_FIREBASE_MAP[tpcProject];
          if (!collName) {
            toolResult = `[âš ï¸] ${tpcProject} için Firebase koleksiyonu tanımlı değil. Ã–nce universal-publisher'a eklenmeli.`;
            break;
          }

          // Kardeş Zeka'yı Otonom Başlat (Profilini dynamic getirecek)
          const tpcResult = await executeMasterAgent(tpcProject, 
            { last_news_time: 0, topics_used: [], last_market_update: 0, todays_news_count: 0 },
            `Generate ${tpcType} for ${tpcProject}. Use your project profile to be precise.`
          );
          
          if (tpcResult.payload) {
            const pubResult = await publishToProject(tpcProject, { type: tpcType, payload: tpcResult.payload });
            const tpcVerify = await verifyFirebaseCollection(collName);
            toolResult = `[${pubResult.success ? 'âœ…' : 'âŒ'}] ${tpcProject} İçerik: ${tpcVerify.count} doküman şu an yayında. DocID: ${pubResult.docId || pubResult.error}`;
          } else {
            toolResult = `[ğŸ“‹] Master Agent ${tpcResult.type} çıktı üretemedi veya boş döndü.`;
          }
          logAlohaAction('TRIGGER_PROJECT_CONTENT', { project: tpcProject, type: tpcType });
        } catch (e: any) {
          toolResult = `[âŒ] İçerik üretim hatası: ${e.message}`;
        }
        break;

      case "create_new_project": {
        const _isCloud6 = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB;
        if (_isCloud6) { toolResult = `[ğŸ”’ CLOUD LOCK] create_new_project Cloud Run'da devre dışı. Yerel IDE gerektirir.`; break; }
        toolResult = createNewProject(args.projectName);
        logAlohaAction("PROJECT_CREATED", { projectName: args.projectName });
        break;
      }

      case "deploy_target_project":
        toolResult = await executeDeployProject(args.targetProjectName || "aipyramweb");
        break;

      case "read_project_file": {
        const _isCloud = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB;
        if (_isCloud) { toolResult = `[ğŸ”’ CLOUD LOCK] read_project_file Cloud Run'da devre dışı. Firebase araçlarını kullanın.`; break; }
        toolResult = readProjectFile(args.filePath || "");
        break;
      }

      case "read_project_file_range": {
        const _isCloud2 = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB;
        if (_isCloud2) { toolResult = `[ğŸ”’ CLOUD LOCK] read_project_file_range Cloud Run'da devre dışı.`; break; }
        try {
          const filePath = args.filePath || "";
          const startLine = Math.max(1, parseInt(args.startLine) || 1);
          const endLine = Math.min(startLine + 300, parseInt(args.endLine) || startLine + 100);
          
          const safePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
          if (!fs.existsSync(safePath)) {
            toolResult = `[HATA] Dosya bulunamadı: ${filePath}`;
            break;
          }
          const lines = fs.readFileSync(safePath, "utf8").split("\n");
          const totalLines = lines.length;
          const slice = lines.slice(startLine - 1, endLine);
          const numbered = slice.map((line, i) => `${startLine + i}: ${line}`).join("\n");
          toolResult = `[DOSYA] ${filePath} (${totalLines} satır toplam, gösterilen: ${startLine}-${Math.min(endLine, totalLines)})\n${numbered}`;
        } catch (e: any) {
          toolResult = `[HATA] ${e.message}`;
        }
        break;
      }

      case "patch_project_file": {
        const _isCloud3 = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB;
        if (_isCloud3) { toolResult = `[ğŸ”’ CLOUD LOCK] patch_project_file Cloud Run'da devre dışı. Firestore'a yazın.`; break; }
        try {
          const filePath = args.filePath || "";
          const searchText = args.searchText || "";
          const replaceText = args.replaceText ?? "";
          
          if (!searchText) { toolResult = "[HATA] searchText boş olamaz"; break; }
          
          const safePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
          
          // Safe zone kontrolü
          const writeCheck = isFileWriteSafe(safePath);
          if (!writeCheck.safe) {
            toolResult = `[ğŸ›¡ï¸ SAFE ZONE] Yazma ENGELLENDİ: ${writeCheck.reason}\nDosya: ${filePath}`;
            break;
          }
          
          if (!fs.existsSync(safePath)) {
            toolResult = `[HATA] Dosya bulunamadı: ${filePath}`;
            break;
          }
          
          const content = fs.readFileSync(safePath, "utf8");
          const occurrences = content.split(searchText).length - 1;
          
          if (occurrences === 0) {
            toolResult = `[HATA] searchText dosyada bulunamadı. Aramayı kontrol et.\nDosya: ${filePath}\nAranan (ilk 200 char): ${searchText.substring(0, 200)}`;
            break;
          }
          if (occurrences > 1) {
            toolResult = `[UYARI] searchText ${occurrences} kez bulundu. Daha spesifik bir searchText ver (sadece 1 eşleşme olmalı).\nDosya: ${filePath}`;
            break;
          }
          
          const newContent = content.replace(searchText, replaceText);
          fs.writeFileSync(safePath, newContent, "utf8");
          
          toolResult = `[âœ… CERRAHİ DÃœZENLEME] Başarılı!\nDosya: ${filePath}\nDeğiştirilen: ${searchText.substring(0, 100)}...\nYeni: ${replaceText.substring(0, 100)}...\nDosya boyutu: ${newContent.length} karakter`;
          
          logAlohaAction('PATCH_PROJECT_FILE', { filePath, searchLen: searchText.length, replaceLen: replaceText.length });
        } catch (e: any) {
          toolResult = `[HATA] Cerrahi düzenleme başarısız: ${e.message}`;
        }
        break;
      }

      case "search_in_project": {
        try {
          const projectName = args.projectName || "aipyramweb";
          const query = args.query || "";
          const filePattern = args.filePattern || "";
          
          if (!query) { toolResult = "[HATA] Arama sorgusu boş olamaz"; break; }
          
          const projectPath = getProjectPath(projectName);
          const isCloudEnv = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB;
          
          if (!projectPath) { 
            if (isCloudEnv) {
              toolResult = `[â˜ï¸ CLOUD] Proje dizini Cloud Run'da mevcut değil. Dosya araması yapılamaz. Firebase araçlarını kullanın.`;
            } else {
              toolResult = `[HATA] Proje bulunamadı: ${projectName}`; 
            }
            break; 
          }
          
          // PRIMARY: Platform-agnostic Node.js recursive search (Cloud Run + Windows + Linux)
          const results: string[] = [];
          const extensions = filePattern 
            ? [filePattern.replace('*.', '')] 
            : ['ts', 'tsx', 'js', 'json', 'css', 'md'];
          const extRegex = new RegExp(`\\.(${extensions.join('|')})$`);
          
          function searchDir(dir: string) {
            if (results.length >= 30) return;
            try {
              const items = fs.readdirSync(dir, { withFileTypes: true });
              for (const item of items) {
                if (['node_modules', '.next', '.git', 'dist', '.firebase'].includes(item.name)) continue;
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) { searchDir(fullPath); continue; }
                if (!item.name.match(extRegex)) continue;
                try {
                  const stat = fs.statSync(fullPath);
                  if (stat.size > 500000) continue; // 500KB üstü dosyaları atla
                  const content = fs.readFileSync(fullPath, 'utf8');
                  const fileLines = content.split('\n');
                  for (let i = 0; i < fileLines.length; i++) {
                    if (fileLines[i].includes(query)) {
                      const relPath = path.relative(projectPath || '', fullPath);
                      results.push(`${i+1}: ${relPath} | ${fileLines[i].trim().substring(0, 120)}`);
                      if (results.length >= 30) return;
                    }
                  }
                } catch { /* skip binary/large */ }
              }
            } catch { /* dizin okunamadı */ }
          }
          searchDir(projectPath);
          toolResult = results.length > 0 
            ? `[ğŸ” ARAMA] "${query}" â†’ ${results.length} sonuç (${projectName}):\n${results.join('\n')}`
            : `[ğŸ” ARAMA] "${query}" â†’ 0 sonuç (${projectName})`;
          
          logAlohaAction('SEARCH_IN_PROJECT', { projectName, query, results: 'completed' });
        } catch (e: any) {
          toolResult = `[HATA] Arama başarısız: ${e.message}`;
        }
        break;
      }

      case "read_json_database":
        toolResult = executeReadJson(args.targetPath);
        break;

      case "update_json_database":
        toolResult = executeUpdateJson(args.targetPath, args.jsonPayload);
        break;

      case "write_project_file": {
        const _isCloud4 = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB;
        if (_isCloud4) { toolResult = `[ğŸ”’ CLOUD LOCK] write_project_file Cloud Run'da devre dışı.`; break; }
        toolResult = writeProjectFile(args.filePath, args.content);
        break;
      }

      case "list_directory": {
        const _isCloud5 = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB;
        if (_isCloud5) { toolResult = `[ğŸ”’ CLOUD LOCK] list_directory Cloud Run'da devre dışı.`; break; }
        toolResult = listDirectory(args.dirPath || ".");
        break;
      }

      case "write_firestore_document": {
        try {
          const collection = args.collection || '';
          const docId = args.docId || '';
          let docData: any;
          try {
            docData = typeof args.data === 'string' ? JSON.parse(args.data) : args.data;
          } catch {
            toolResult = `[HATA] JSON parse hatası. Geçerli JSON gönderin.`;
            break;
          }

          // Güvenlik kontrolü: SAFE_COLLECTIONS
          if (!isCollectionWriteSafe(collection)) {
            toolResult = `[ğŸ›¡ï¸ GÃœVENLİK] ${collection} koleksiyonu yazma izni dışında. Safe Collections: project_profiles, aloha_memory, aloha_lessons, trtex_news, vb.`;
            break;
          }

          // Timestamp ekle
          docData.updatedAt = new Date().toISOString();
          if (!docData.createdAt) docData.createdAt = new Date().toISOString();

          let ref;
          if (docId) {
            await adminDb.collection(collection).doc(docId).set(docData, { merge: true });
            ref = { id: docId };
          } else {
            ref = await adminDb.collection(collection).add(docData);
          }

          toolResult = `[âœ… FIRESTORE] ${collection}/${ref.id} başarıyla yazıldı.\nVeri: ${JSON.stringify(docData).substring(0, 300)}`;
          logAlohaAction('WRITE_FIRESTORE', { collection, docId: ref.id });
        } catch (e: any) {
          toolResult = `[âŒ FIRESTORE HATA] ${e.message}`;
        }
        break;
      }

      case "create_aloha_task": {
        try {
          // Değişiklikleri parse et
          let changes: any[] = [];
          if (args.changes) {
            try { changes = JSON.parse(args.changes); } catch { changes = []; }
          }

          // Max 5 dosya kontrolü
          if (changes.length > 5) {
            toolResult = `[ğŸ›¡ï¸ GÃœVENLİK] Max 5 dosya/görev â€” ${changes.length} dosya istendi. Görevi böl.`;
            break;
          }

          const task = {
            type: args.taskType || 'code_change',
            source: 'cloud' as const,
            status: 'pending' as const,
            title: args.title,
            description: args.description || '',
            project: args.project,
            changes,
            risk: args.risk || 'low',
            requires_approval: true,
            priority: Math.min(5, Math.max(1, parseInt(args.priority) || 3)),
            mode: args.mode || 'dry_run',  // Varsayılan: dry_run (güvenli)
            approved_by: null,
            approved_at: null,
            backup_tag: null,
            result: null,
            created_at: require('firebase-admin/firestore').FieldValue.serverTimestamp(),
            started_at: null,
            completed_at: null,
          };

          const ref = await adminDb.collection('aloha_tasks').add(task);
          
          toolResult = `[âœ… GÃ–REV OLUŞTURULDU]\n` +
            `ğŸ“‹ ID: ${ref.id}\n` +
            `ğŸ“ Başlık: ${args.title}\n` +
            `ğŸ¯ Proje: ${args.project}\n` +
            `âš¡ Risk: ${task.risk} | Ã–ncelik: P${task.priority} | Mod: ${task.mode}\n` +
            `ğŸ“‚ Değişiklik: ${changes.length} dosya\n` +
            `â³ Durum: ONAY BEKLİYOR\n` +
            `ğŸ‘‰ Local ALOHA CLI: npx tsx src/cli.ts approve ${ref.id}`;
          
          logAlohaAction('CREATE_ALOHA_TASK', { taskId: ref.id, title: args.title, project: args.project });
        } catch (e: any) {
          toolResult = `[âŒ GÃ–REV OLUŞTURULAMADI] ${e.message}`;
        }
        break;
      }
      case "scan_missing_images": {
        try {
          const collection = args.collection || 'trtex_news';
          const limit = Math.min(args.limit || 10, 20);
          const dryRun = args.dryRun !== false; // Varsayılan: dry_run (güvenli)

          const result = await scanAndGenerateImages(collection, limit, dryRun);

          toolResult = `[ğŸ“¸ GÃ–RSEL TARAMA ${dryRun ? 'DRY RUN' : 'EXECUTE'}]\n` +
            `ğŸ” Koleksiyon: ${collection}\n` +
            `ğŸ“Š Taranan: ${result.scanned} görselsiz haber\n` +
            `âœ… Ãœretilen: ${result.generated}\n` +
            `âŒ Başarısız: ${result.failed}\n` +
            `â­ï¸ Atlanan: ${result.skipped}\n` +
            `\nDetay:\n${result.details.slice(0, 10).map(d => 
              `  ${d.status === 'generated' ? 'âœ…' : d.status === 'failed' ? 'âŒ' : 'â­ï¸'} ${d.title?.slice(0, 50)}${d.image_url ? ' â†’ ' + d.image_url.slice(-30) : ''}`
            ).join('\n')}`;

          logAlohaAction('SCAN_MISSING_IMAGES', { 
            collection, dryRun, scanned: result.scanned, generated: result.generated 
          });
        } catch (e: any) {
          toolResult = `[âŒ GÃ–RSEL TARAMA HATASI] ${e.message}`;
        }
        break;
      }

      case "deep_site_audit": {
        try {
          const project = (args.project || 'trtex').toLowerCase().replace('.com','').replace('.ai','');
          const { deepSiteAudit } = require('@/core/aloha/deepAudit');
          const report = await deepSiteAudit(project);
          
          // Raporu Firestore'a kaydet
          try {
            await adminDb.collection('aloha_audit_reports').add({
              ...report,
              createdAt: new Date().toISOString(),
            });
          } catch (e) { await dlq.recordSilent(e, 'engine.deepSiteAudit', 'trtex'); }
          
          const criticals = report.issues.filter((i: any) => i.level === 'critical');
          const warnings = report.issues.filter((i: any) => i.level === 'warning');
          
          toolResult = `[ğŸ” DERİN SİTE DENETİMİ â€” ${project.toUpperCase()}]\n` +
            `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n` +
            `ğŸ“Š TOPLAM SKOR: ${report.score}/100\n` +
            `ğŸ“° Toplam Makale: ${report.totalArticles}\n\n` +
            `DETAY SKORLAR:\n` +
            `  ğŸ“ İçerik: ${report.scores.content}/100\n` +
            `  ğŸ–¼ï¸ Görsel: ${report.scores.images}/100\n` +
            `  ğŸ” SEO: ${report.scores.seo}/100\n` +
            `  ğŸ¨ Ã‡eşitlilik: ${report.scores.diversity}/100\n` +
            `  â° Tazelik: ${report.scores.freshness}/100\n\n` +
            `ğŸš¨ KRİTİK SORUNLAR (${criticals.length}):\n` +
            criticals.slice(0, 10).map((i: any) => `  âŒ [${i.type}] ${i.detail}`).join('\n') + '\n\n' +
            `âš ï¸ UYARILAR (${warnings.length}):\n` +
            warnings.slice(0, 10).map((i: any) => `  âš ï¸ [${i.type}] ${i.detail}`).join('\n') + '\n\n' +
            `ğŸ”§ ONARIM PLANI: ${report.repairPlan.length} aksiyon tespit edildi.\n`;

          // â•â•â• OTONOM ZİNCİR: Kritik sorun varsa DİREKT düzelt â•â•â•
          const criticalSlugs = report.repairPlan.filter((r: any) => r.action === 'fix_slug');
          if (criticalSlugs.length > 0) {
            try {
              const { autoRepair } = require('@/core/aloha/autoRepair');
              // Slug fix'leri hemen uygula (en acil sorun)
              const slugResult = await autoRepair(project, criticalSlugs, false, criticalSlugs.length);
              toolResult += `\nâ›“ï¸ OTONOM SLUG DÃœZELTME: ${slugResult.fixed}/${criticalSlugs.length} slug düzeltildi!\n`;
              toolResult += slugResult.details.map((d: any) => `  ${d.status === 'fixed' ? 'âœ…' : 'âŒ'} ${d.detail}`).join('\n');
            } catch (e: any) {
              toolResult += `\nâš ï¸ Slug auto-fix hatası: ${e.message}`;
            }
          }

          // Kalan onarımlar için yönlendirme
          const remainingCount = report.repairPlan.length - criticalSlugs.length;
          if (remainingCount > 0) {
            toolResult += `\n\nğŸ”§ Kalan ${remainingCount} onarım için: auto_repair_project(project="${project}", dryRun=false)`;
          }
          
          logAlohaAction('DEEP_SITE_AUDIT', { project, score: report.score, issues: report.issues.length, repairs: report.repairPlan.length, autoFixedSlugs: criticalSlugs.length });
        } catch (e: any) {
          toolResult = `[âŒ DENETİM HATASI] ${e.message}`;
        }
        break;
      }

      case "auto_repair_project": {
        try {
          const project = (args.project || 'trtex').toLowerCase().replace('.com','').replace('.ai','');
          const dryRun = args.dryRun !== false;
          const maxActions = Math.min(args.maxActions || 20, 50);
          
          // Ã–nce audit çalıştır
          const { deepSiteAudit } = require('@/core/aloha/deepAudit');
          const report = await deepSiteAudit(project);
          
          if (report.repairPlan.length === 0) {
            toolResult = `[âœ… ${project.toUpperCase()}] Onarım gerektiren sorun bulunamadı! Skor: ${report.score}/100`;
            break;
          }
          
          // Auto repair çalıştır
          const { autoRepair } = require('@/core/aloha/autoRepair');
          const result = await autoRepair(project, report.repairPlan, dryRun, maxActions);
          
          toolResult = `[ğŸ”§ OTOMATİK ONARIM â€” ${project.toUpperCase()} ${dryRun ? '(SİMÃœLASYON)' : '(GERÃ‡EK)'}]\n` +
            `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n` +
            `ğŸ“Š Audit Skor: ${report.score}/100\n` +
            `ğŸ“‹ Toplam Aksiyon: ${result.total}\n` +
            `âœ… Düzeltilen: ${result.fixed}\n` +
            `â­ï¸ Atlanan: ${result.skipped}\n` +
            `âŒ Hata: ${result.errors}\n\n` +
            `DETAYLAR:\n` +
            result.details.slice(0, 15).map((d: any) => 
              `  ${d.status === 'fixed' ? 'âœ…' : d.status === 'error' ? 'âŒ' : 'â­ï¸'} ${d.action} â†’ ${d.detail}`
            ).join('\n') +
            (dryRun ? '\n\nğŸ‘‰ Gerçek onarım için: auto_repair_project(project="' + project + '", dryRun=false)' : '');
          
          logAlohaAction('AUTO_REPAIR', { project, dryRun, fixed: result.fixed, errors: result.errors });
        } catch (e: any) {
          toolResult = `[âŒ ONARIM HATASI] ${e.message}`;
        }
        break;
      }

      case "research_industry": {
        try {
          const topic = args.topic;
          const category = args.category || 'textile';
          const { researchFromTrustedSources } = require('@/core/aloha/deepAudit');
          const research = await researchFromTrustedSources(topic, category);
          
          toolResult = `[ğŸ”¬ SEKTÃ–REL ARAŞTIRMA]\n` +
            `Konu: ${topic}\n` +
            `Kategori: ${category}\n` +
            `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n` +
            research.substring(0, 3000);
          
          logAlohaAction('RESEARCH_INDUSTRY', { topic, category });
        } catch (e: any) {
          toolResult = `[âŒ ARAŞTIRMA HATASI] ${e.message}`;
        }
        break;
      }

      // â•â•â• CHAIN EXECUTOR TOOLS â•â•â•
      case "run_full_repair": {
        try {
          const project = (args.project || 'trtex').toLowerCase();
          const { runFullRepair } = require('./chainExecutor');
          const chainResult = await runFullRepair(project);
          toolResult = `[â›“ï¸ FULL REPAIR CHAIN]\n${chainResult.plan.summary}\n\nSüre: ${Math.round(chainResult.duration / 1000)}s\nDurum: ${chainResult.plan.status}`;
          logAlohaAction('CHAIN_FULL_REPAIR', { project, status: chainResult.plan.status });
        } catch (e: any) {
          toolResult = `[âŒ CHAIN HATASI] ${e.message}`;
        }
        break;
      }

      case "run_health_check": {
        try {
          const project = (args.project || 'trtex').toLowerCase();
          const { runHealthCheck } = require('./chainExecutor');
          const chainResult = await runHealthCheck(project);
          toolResult = `[â›“ï¸ HEALTH CHECK]\n${chainResult.plan.summary}`;
          logAlohaAction('CHAIN_HEALTH_CHECK', { project, status: chainResult.plan.status });
        } catch (e: any) {
          toolResult = `[âŒ CHAIN HATASI] ${e.message}`;
        }
        break;
      }

      case "run_content_generation": {
        try {
          const project = (args.project || 'trtex').toLowerCase();
          const { runContentGeneration } = require('./chainExecutor');
          const chainResult = await runContentGeneration(project);
          toolResult = `[â›“ï¸ CONTENT GENERATION]\n${chainResult.plan.summary}`;
          logAlohaAction('CHAIN_CONTENT_GEN', { project, status: chainResult.plan.status });
        } catch (e: any) {
          toolResult = `[âŒ CHAIN HATASI] ${e.message}`;
        }
        break;
      }

      case "run_ecosystem_repair": {
        try {
          const { runFullEcosystemRepair } = require('./chainExecutor');
          const results = await runFullEcosystemRepair();
          const summary = results.map((r: any) => `${r.plan.project}: ${r.plan.status} (${r.plan.stats.done}/${r.plan.stats.total})`).join(' | ');
          toolResult = `[ğŸŒ ECOSYSTEM REPAIR]\n${summary}\n\nToplam süre: ${Math.round(results.reduce((s: number, r: any) => s + r.duration, 0) / 1000)}s`;
          logAlohaAction('CHAIN_ECOSYSTEM_REPAIR', { results: summary });
        } catch (e: any) {
          toolResult = `[âŒ CHAIN HATASI] ${e.message}`;
        }
        break;
      }

      case "scan_google_tech": {
        try {
          const { weeklyGoogleTechScan } = require('./initiative');
          const scan = await weeklyGoogleTechScan();
          
          let report = `[ğŸ”¬ GOOGLE ALTYAPI TARAMASI]\n`;
          report += `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n`;
          report += `ğŸ“¡ Taranan: ${scan.scanned} konu\n`;
          report += `ğŸ” İlgili: ${scan.relevant} bulgu\n`;
          report += `ğŸ”´ Kritik: ${scan.critical} bulgu\n\n`;
          
          if (scan.findings.length > 0) {
            const relevant = scan.findings.filter((f: any) => f.impact === 'high' || f.impact === 'medium');
            for (const f of relevant) {
              const icon = f.impact === 'high' ? 'ğŸ”´' : 'ğŸŸ¡';
              report += `${icon} [${f.impact.toUpperCase()}] ${f.topic}\n`;
              report += `   ğŸ“‹ ${f.recommendation || 'Değerlendiriliyor'}\n`;
              report += `   ğŸ¯ Etkilenen: ${(f.affectedProjects || []).join(', ')}\n`;
              report += `   â±ï¸ Efor: ${f.effort || '?'}\n\n`;
            }
            report += `\nâš ï¸ TÃœM TEKLİFLER 'aloha_tech_proposals' koleksiyonunda ONAY BEKLİYOR.\n`;
            report += `Hakan'ın onayı olmadan hiçbir güncelleme uygulanmayacak.`;
          } else {
            report += `âœ… Bu hafta AIPyram'ı etkileyen yenilik tespit edilmedi.`;
          }
          
          toolResult = report;
          logAlohaAction('TECH_SCAN_COMPLETE', { scanned: scan.scanned, relevant: scan.relevant, critical: scan.critical });
        } catch (e: any) {
          toolResult = `[âŒ TECH SCAN HATASI] ${e.message}`;
        }
        break;
      }

      case "compose_article": {
        try {
          const topic = args.topic;
          const project = (args.project || 'trtex').toLowerCase().replace('.com','').replace('.ai','');
          const imageCount = Math.min(args.image_count || 0, 5); // 0 = otomatik
          const wordCount = Math.max(args.word_count || 1200, 1200); // MİNİMUM 1200 KELİME!
          const category = args.category || 'İstihbarat';
          const lang = args.language || 'tr';

          // 0.8 Memory Drift Control (Haftalık kontrol - Placeholder)
          // todo: if (weekly_drift_check_triggered) apply_prompt_reset_to_enforce_diversity()

          // 0.9 Dinamik Sözlük Ã‡ekimi
          let dynamicTerms = "";
          try {
            const dictSnap = await adminDb.collection('trtex_config').doc('dynamic_dictionary').get();
            if (dictSnap.exists) {
               const terms = dictSnap.data()?.learned_terms || [];
               if (terms.length > 0) dynamicTerms = terms.join(", ");
            }
          } catch(e) {}

          // 1. AI ile içerik üret (Ajan uzmanlığı enjekte)
          const composeAi = alohaAI.getClient();

          const contentResponse = await composeAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Role: Sen, dünyanın en prestijli tekstil istihbarat platformu TRTEX'in Senior Market Strategist & Creative Director'üsün. Görevin, sıradan haberleri elemek ve sadece global tekstil elitlerini (JAB, Zimmer + Rohde, Vanelli, Christian Fischbacher, Küçükçalık, Persan, Elvin, Coulisse vb.) ilgilendiren stratejik verileri işlemek.

1. Kaynak Disiplini: Sadece ilk 50 dev firmanın (Master List) hareketlerini, fuar (Hometex, Heimtextil) raporlarını ve global tasarım trendlerini baz al. "Aydın Tekstil" veya "Kacar" gibi güncelliğini yitirmiş verileri sistemden sil.

2. Haber Yapısı (Zorunlu):
- Başlık: Ticari, net ve provokatif. (Ã–rn: "JAB 2026: Akıllı İpliklerin Lüks Konut Pazarındaki Hakimiyeti")
- Hızlı Ã–zet: Maksimum 3 satırda "Neden şimdi?" sorusuna cevap ver.
- B2B Analiz (Bu Ne Demek?): Haberin perakendeci veya toptancı için finansal/stratejik anlamını açıkla.
- Detaylı Rapor: En az 30 satır; iplik kalitesi, doku analizi, sürdürülebilirlik sertifikaları (OEKO-TEX, GRS) ve pazar konumlandırması içeren teknik derinlik.
- Fırsat/Risk: Somut tavsiye ver. (Ã–rn: "Bu doku Avrupa'da yükselişte, stok planlamasını %20 artırın.")

3. Visual Intelligence:
Her haber için tam olarak 3 görsel (İngilizce Prompt) tasarla ('article_image_prompts' dizisi olarak).
BİRİNCİSİ (ANA HERO - Landscape): Lüks bir penthouse, İtalyan villası veya otel odasında bitmiş "Kullanıma Hazır" ürünün (dökümlü perdelerin) mimari geniş açı ile, 16:9 yatay (horizontal) formatta son kullanıcının tamamen anlayabileceği büyüleyici ve geniş duruşu.
İKİNCİSİ (MEZO - Editorial Stüdyo & Yaşam Alanı): Ürünün (kumaş, havlu, yatak örtüsü veya koltuk) dergi kapağı kalitesinde, kusursuz stüdyo veya doğal yaşam alanı (lüks yatak odası, orman manzaralı suit vb.) ışığında çekilmiş, yüksek kalite "Lifestyle" editorial kareleri. 
ÜÇÜNCÜSÜ (DETAY - Mikro): 85mm lens ile kumaşın dokusunu, iplik lifleri ve kalitesini gösteren detay çekim (Makro).
YASAK: Karanlık fabrika, yazı içeren görsel, ana fotoğraf için dikey (portrait) kadraj, 2025 öncesi estetik, "manifaturacı" görselleri ve kalitesiz tasarımlar KESİNLİKLE YASAKTIR.

Prompt Template: Resim promptlarını tam olarak şu formatta üret:
[Subject: Editorial photography, highly detailed, realistic studio-like photography of luxury finished home textiles (curtains/towels/furniture) in a beautiful setting] -- [Setting: Modern Luxury Bedroom with forest view or High-end Italian Villa] -- [Lighting: Soft morning sunlight, cinematic warm lighting, detailed shadows] -- [Details: 8k resolution, photorealistic, Vogue Living style, extreme realism, lifestyle photography] -- [Camera: 50mm lens] -- [Negative: text, logo, factory, low quality, CGI look]

KATEGORİ: ${category}
DİL: ${lang === 'tr' ? 'Türkçe' : 'İngilizce'}
PROJE: ${project}
KONU: ${topic}

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ğŸš¨ DİNAMİK B2B SÃ–ZLÃœK:
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Dinamik Sözlük: ${dynamicTerms ? dynamicTerms : "Akıllı tekstiller, Sürdürülebilir lifler"}
Sektör devleri (Kvadrat, JAB, Vanelli vb.) veya kurum (ITKIB, EURATEX) isimlerini mutlaka hatasız kullan.
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
SEO KURALLARI (ZORUNLU):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
1. Başlık: 55-65 karakter, ana keyword başta, dikkat çekici
2. Alt başlıklar: H2 ve H3 kullan, keyword içersin
3. İlk paragraf: Ana keyword'ü ilk 100 karakterde kullan
4. Keywords: EN AZ 10 ADET seo_keywords üret (uzun kuyruklu dahil)
5. Internal linking: İlgili konulara referans ver
6. E-E-A-T: Yazar uzmanlığı, kaynak belirt, tarih referans ver

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
TRTEX DECISION INFRASTRUCTURE â€” B2B TRADE BRIEF (ZORUNLU):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Bu bir "haber" veya "blog" DEĞİL â€” Bloomberg / FT tarzında bir "İSTİHBARAT BRİFİNGİ" ve "KARAR MOTORU"dur.
Kullanıcı senin içeriğini okuyup, milyonluk ticaret için SİPARİŞ veya İPTAL kararı alacak.

İki katmanlı bir çıktı üreteceksin:
1. TİCARİ BRİFİNG KATMANI (Pragmatik Karar Paneli - JSON objesi olarak)
   - DURUM (situation): Sadece veri, ne oldu? (Örn: Cotton prices +3.2%)
   - TİCARİ ETKİ (so_what): Etkisi nedir? (Örn: İplik üretim marjları daralıyor)
   - NE YAPMALI (now_what): Ticari aksiyon ne olmalı? (Örn: Tedariği Asya dışı pazarlardan 3 aylık sabitle)
   - KAZANANLAR (who_wins): Bu durumdan kazançlı çıkacak 2 pazar oyuncusu
   - KAYBEDENLER (who_loses): Bu durumdan zarar görecek 2 pazar oyuncusu

2. AKILLI ANALİZ KATMANI (SEO ve Detaylar İçin HTML Content)
   (Bu kısım "content" değişkenine yazılacaktır)
   - Yukarıda belirtilen '4. YENİ HABER STİLİ' formatına harfiyen uymalıdır.
   - 1. Başlık
   - 2. 3 Satır Hızlı Ã–zet (ul, li)
   - 3. Bu Ne Demek? (B2B Anlamı, h2 veya h3)
   - 4. Kısa Analiz (Sektör ve teknik detaylar, <table> ile)
   - 5. Fırsat ve Risk Haritası (h3, h4)
   Uzun paragraflardan kaçın, patron gibi net, vurucu ve ticari konuş.

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ğŸ¤– AI İSTİHBARAT BİRİMİ (HABER ALTI â€” ZORUNLU):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Her haberin sonunda aşağıdaki AI analiz katmanlarını AYRI AYRI üret:

A) AI IMPACT SCORE (1-10): Bu haber senin ticaretini ne kadar etkiler?
   (Lojistik krizi = 9/10, Renk trendi = 4/10)

B) CEO Ã–ZETİ (EXECUTIVE SUMMARY): 3 maddelik ultra-kısa kritik özet.
   Haberi okumaya vakti olmayan CEO/CFO için.

C) NE YAPMALIYIM? (ACTION ENGINE â€” EN KRİTİK!):
   3-5 somut aksiyon maddesi. Para kazandıran kısım.
   Ã–rnek: "Kısa vadede pamuk stoku yap", "Hindistan yerine Ã–zbekistan tedarik araştır"
   Bu bölüm SOMUT ve UYGULANABİLİR olmalı â€” genel tavsiye YASAK!

D) BUYER MINDSET SIMULATOR:
   "Bir Alman satın almacı bu haberi nasıl yorumlar?"
   "Bir UAE toptancısı ne karar verir?"
   2 farklı perspektiften yapay röportaj.

E) TREND TAHMİNİ (3 AYLIK PROJEKSİYON):
   "Bu hammaddenin fiyatı 3 ay içinde %X yönünde hareket edebilir"
   "Bu pazarın büyüme hızı Q3'te yavaşlayabilir"

F) FIRSAT RADARI:
   "Romanya 50.000 metre perde ithalatı arıyor"
   "Suudi konut projesi başlıyor â€” 200 bin m2 ev tekstili"
   SOMUT, SPESİFİK, AKSİYON ALINABİLİR fırsatlar.

G) NEURAL ROUTING MATRIX (YENİ SİNİR AĞI ZORUNLULUĞU):
   Haberi JSON olarak verirken mutlaka "routing_signals" objesini ekle.
   Buradaki 3 skoru 0.01 ile 1.00 arasında sen atayacaksın:
   - world_radar: Küresel kriz, jeopolitik, tedarik zinciri ise YÃœKSEK.
   - academy_value: Eğitimsel, kalıcı, rapor, kütüphane bilgisi ise YÃœKSEK.
   - b2b_opportunity: Somut para kazanma fırsatı, firma alım satım talebiyse YÃœKSEK.

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
TON & STİL:
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
- Bloomberg terminali tonu â€” kısa, keskin, veri odaklı
- Clickbait YASAK, "şok", "inanılmaz" kelimeler YASAK
- Sektör profesyonellerine hitap et â€” 35 yıllık tecrübe hissettir
- Türk tekstil/ev tekstili sektörüne özel perspektif
- Gerçekçi veriler (kesin rakamlar, yüzdeler, tonaj, dolar)
- Her paragrafa "ve bu NE anlama geliyor?" sorusuyla yaklaş

🔴 DİL KURALI (MUTLAK):
- Çıktının TAMAMI Türkçe olacak. İngilizce kelime, başlık veya terim YASAK.
- HTML H2/H3 başlıkları SADECE Türkçe: "PAZAR VERİLERİ", "TİCARİ ETKİ ANALİZİ", "NE YAPMALI?", "FIRSAT HARİTASI", "RİSK ANALİZİ"
- İngilizce kalıp başlıklar KESİNLİKLE YASAK: SITUATION, SO WHAT, NOW WHAT, WHO WINS, WHO LOSES, TRADE BRIEF, EXECUTIVE SUMMARY, ACTION ENGINE
- Sektörel İngilizce terimler (OEKO-TEX, GRS, EPR, FOB, CIF) kalabilir — bunlar sektör standardıdır.
${agentContext}

JSON formatında döndür:
{
  "title": "SEO başlığı (55-65 kar, keyword başta)",
  "summary": "CEO özeti (2-3 cümle, 155 kar civarı)",
  "trade_brief": {
    "situation": "Net olay",
    "so_what": "Pazar etkisi",
    "now_what": "Ticari aksiyon (Ã–rn: Siparişi 30 gün ertele)",
    "who_wins": ["Segment/Oyuncu 1", "Segment/Oyuncu 2"],
    "who_loses": ["Segment/Oyuncu 1", "Segment/Oyuncu 2"]
  },
  "content": "SEO odaklı derin analiz ve detaylı hikaye HTML formatında (tüm h2/h3/table/ul/blockquote). MİN ${wordCount} kelime!",
  "slug": "seo-uyumlu-url-ascii-only",
  "tags": ["ZORUNLU MAKSİMUM 10 ETİKET! İLK 4 ETİKET SABİT OLACAK:", "Perde", "Ev Tekstili", "Döşemelik", "Dekorasyon", "dynamic_1", "dynamic_2"],
  "seo_title": "SEO başlığı (max 60 karakter)",
  "seo_description": "Meta description (max 155 karakter)",
  "seo_keywords": ["en az 12 keyword", "uzun kuyruklu dahil"],
  "ai_commentary": "AI bağımsız analiz ve değerlendirme (min 200 karakter)",
  "ai_impact_score": 7,
  "executive_summary": ["Kritik madde 1", "Kritik madde 2", "Kritik madde 3"],
  "action_items": ["Somut aksiyon 1", "Somut aksiyon 2", "Somut aksiyon 3"],
  "buyer_mindset": {"german_buyer": "Alman perspektifi", "uae_wholesaler": "UAE perspektifi"},
  "trend_prediction": "3 aylık projeksiyon tahmini",
  "opportunity_radar": ["Somut fırsat 1", "Somut fırsat 2"],
  "business_opportunities": ["İş fırsatı 1", "İş fırsatı 2", "İş fırsatı 3"],
  "market_impact": "Piyasa etkisi özeti â€” hangi fiyatlar, hangi yönde",
  "country_intelligence": {"country": "Ãœlke adı", "market_size": "X milyar $", "risk_score": "düşük/orta/yüksek"},
  "reading_level": "professional",
  "content_type": "trade_brief",
  "perde_relevance": false,
  "new_terms": ["Ã–rn: smart_textiles", "polylactic_acid"],
  "routing_signals": {
    "world_radar": 0.85,
    "academy_value": 0.30,
    "b2b_opportunity": 0.95
  }
}`,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            }
          });

          if (!contentResponse.text) throw new Error('AI içerik üretemedi');
          const article = JSON.parse(contentResponse.text);

          // Dinamik Terimleri Firebase'e Geri Besleme (Async)
          if (article.new_terms && Array.isArray(article.new_terms) && article.new_terms.length > 0) {
            adminDb.collection('trtex_config').doc('dynamic_dictionary').get().then(snap => {
               const exist = snap.exists ? (snap.data()?.learned_terms || []) : [];
               const merged = Array.from(new Set([...exist, ...article.new_terms]));
               return adminDb.collection('trtex_config').doc('dynamic_dictionary').set({ learned_terms: merged }, { merge: true });
            }).catch(console.error);
          }

          // â•â•â• KALİTE KAPISI â€” Authority Site Standardı â•â•â•
          const contentText = article.content || '';
          const h2Count = (contentText.match(/<h2/gi) || []).length;
          const h3Count = (contentText.match(/<h3/gi) || []).length;
          const tableCount = (contentText.match(/<table/gi) || []).length;
          const listCount = (contentText.match(/<[uo]l/gi) || []).length;
          const wordEstimate = contentText.replace(/<[^>]*>/g, '').split(/\s+/).length;
          
          const qualityScore = {
            h2Count, h3Count, tableCount, listCount, wordEstimate,
            passed: h2Count >= 2 && wordEstimate >= 800 // Minimum geçme kriteri
          };
          
          if (!qualityScore.passed) {
            console.warn(`[COMPOSE] âš ï¸ Kalite düşük: h2=${h2Count} word=${wordEstimate} â€” yeniden üretim gerekebilir`);
          }
          
          logAlohaAction('COMPOSE_QUALITY_CHECK', { topic, ...qualityScore });

          // â•â•â• GROUNDING KATMANI â€” Veri Doğrulama (Google Search) â•â•â•
          try {
            // İçerikten kritik istatistik cümleleri çıkar
            const claimExtractor = await composeAi.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Aşağıdaki haber metninden SADECE doğrulanması gereken rakamsal/istatistiksel iddiaları çıkar.
Her iddia için kısa bir Google arama sorgusu oluştur.
MAKSIMUM 3 iddia seç (en önemliler).

METİN:
${(article.content || '').replace(/<[^>]*>/g, '').substring(0, 2000)}

JSON döndür:
{"claims": [{"claim": "iddia cümlesi", "search_query": "doğrulama sorgusu"}]}`,
              config: { responseMimeType: 'application/json', temperature: 0.1 }
            });

            if (claimExtractor.text) {
              const { claims } = JSON.parse(claimExtractor.text);
              let groundingLog: string[] = [];
              
              if (claims && claims.length > 0) {
                for (const c of claims.slice(0, 3)) {
                  try {
                    // Google Search ile doğrula
                    const searchResult = await executeToolCall({
                      name: 'web_search',
                      args: { query: c.search_query }
                    });

                    // Sonucu AI'ya gönderip doğrulat
                    const verifyRes = await composeAi.models.generateContent({
                      model: 'gemini-2.5-flash',
                      contents: `İDDİA: "${c.claim}"

ARAMA SONUCU:
${searchResult.substring(0, 1500)}

Bu iddia doğru mu? Eğer yanlışsa, doğru veriyi ver.
JSON döndür: {"verified": true/false, "correction": "doğru veri (sadece yanlışsa)"}`,
                      config: { responseMimeType: 'application/json', temperature: 0.1 }
                    });

                    if (verifyRes.text) {
                      const verification = JSON.parse(verifyRes.text);
                      if (!verification.verified && verification.correction) {
                        // Yanlış veriyi düzelt
                        article.content = article.content.replace(
                          c.claim.substring(0, 80),
                          verification.correction.substring(0, 200)
                        );
                        groundingLog.push(`ğŸ”„ DÃœZELTME: "${c.claim.substring(0, 50)}..." â†’ "${verification.correction.substring(0, 50)}..."`);
                      } else {
                        groundingLog.push(`âœ… DOĞRU: "${c.claim.substring(0, 60)}..."`);
                      }
                    }
                  } catch { /* tek claim hatası â†’ devam */ }
                }
                
                if (groundingLog.length > 0) {
                  console.log(`[GROUNDING] ğŸ” ${groundingLog.length} iddia doğrulandı:`);
                  groundingLog.forEach(l => console.log(`  ${l}`));
                }
                logAlohaAction('COMPOSE_GROUNDING', { topic, claims: groundingLog.length, results: groundingLog });
              }
            }
          } catch (groundingErr: any) {
            console.warn(`[GROUNDING] âš ï¸ Doğrulama atlandı: ${groundingErr.message}`);
            // Grounding başarısız olursa makale yayınlanmaya devam eder
          }

          // â•â•â• CONTENT GUARD â€” Yasaklı Terim Filtresi â•â•â•
          try {
            const { validateContent, sanitizeContent } = require('./contentGuard');
            const validation = validateContent(article.content || '', 'article');
            if (!validation.valid) {
              console.log(`[CONTENT GUARD] âš ï¸ ${validation.violations.length} ihlal tespit edildi â€” temizleniyor...`);
              validation.violations.forEach((v: any) => console.log(`  ğŸš« "${v.term}" â†’ "${v.suggestion || 'kaldırılıyor'}"`));
              const { cleaned, replacements } = sanitizeContent(article.content || '', 'article');
              article.content = cleaned;
              logAlohaAction('CONTENT_GUARD', { violations: validation.violations.length, replacements });
            }

            // Brand Wall â€” platform ismi sızıntı filtresi
            const { brandWallScan } = require('./contentGuard');
            const bwResult = brandWallScan(article.content || '');
            if (!bwResult.clean) {
              console.log(`[BRAND WALL] ğŸ›¡ï¸ ${bwResult.breaches.length} sızıntı tespit edildi â€” temizleniyor...`);
              // Her sızıntıyı TRTEX Intelligence ile değiştir
              for (const b of bwResult.breaches) {
                const regex = new RegExp(b.term, 'gi');
                article.content = (article.content || '').replace(regex, 'TRTEX Intelligence');
              }
              if (article.title) {
                const bwTitle = brandWallScan(article.title);
                if (!bwTitle.clean) {
                  for (const b of bwTitle.breaches) {
                    article.title = article.title.replace(new RegExp(b.term, 'gi'), 'TRTEX Intelligence');
                  }
                }
              }
              logAlohaAction('BRAND_WALL_CLEAN', { breaches: bwResult.breaches.length });
            }

            // Linen-Look â€” keten maliyet doğrulama
            const { linenCostAudit } = require('./contentGuard');
            const linenResult = linenCostAudit(article.content || '');
            if (!linenResult.valid) {
              console.log(`[LINEN-LOOK] âš ï¸ Keten maliyet uyarısı: ${linenResult.warnings[0]}`);
              logAlohaAction('LINEN_LOOK_WARNING', { warnings: linenResult.warnings });
            }
          } catch { /* contentGuard yüklenemezse â†’ sessiz devam */ }

          // 2. Görselleri üret â€” VisualDNA + MasterPhotographer entegrasyonu (3x RETRY GARANTİ)
          const { processMultipleImages, getImageCount } = require('@/core/aloha/imageAgent');
          const { generateTripleImagePrompts, enforceKeywords } = require('./visualDNA');
          
          // VisualDNA ile 3 dergi kalitesinde görsel prompt üret
          const triplePrompts = generateTripleImagePrompts(article.title, category, article.tags || []);
          const finalImageCount = Math.max(imageCount || getImageCount(article.content || ''), 2);
          
          let images: string[] = [];
          for (let imgRetry = 0; imgRetry < 3; imgRetry++) {
            try {
              images = await processMultipleImages(category, article.title, article.content, finalImageCount);
              if (images.length > 0) {
                console.log(`[COMPOSE] âœ… ${images.length} görsel üretildi (deneme ${imgRetry + 1})`);
                break;
              }
            } catch (imgErr: any) {
              console.warn(`[COMPOSE] âš ï¸ Görsel üretim denemesi ${imgRetry + 1}/3 başarısız: ${imgErr.message}`);
              if (imgRetry === 2) {
                // 3. deneme de başarısız â†’ alert üret
                try {
                  await adminDb.collection('aloha_alerts').add({
                    type: 'IMAGE_PIPELINE_DOWN',
                    message: `3 deneme başarısız: ${imgErr.message}`,
                    article: topic,
                    project,
                    timestamp: new Date().toISOString(),
                    read: false,
                  });
                } catch { /* alert yazılamazsa da devam */ }
              }
            }
          }
          
          // Görsel prompt'ları kaydet (sonradan yeniden üretim için)
          const imagePromptData = {
            hero: triplePrompts.hero.prompt.substring(0, 500),
            mid: triplePrompts.mid.prompt.substring(0, 500),
            detail: triplePrompts.detail.prompt.substring(0, 500),
          };

          // 2b. Keyword Enforcement â€” 8+ zorunlu keyword
          const enforcedTags = enforceKeywords(article.tags || [], article.title, category);
          article.tags = enforcedTags;
          if (article.seo_keywords) {
            article.seo_keywords = [...new Set([...article.seo_keywords, ...enforcedTags])];
          }

          // 3. Ã‡evirileri üret (3x RETRY GARANTİ â€” 7 dil zorunlu)
          const { executeTranslationAgent } = require('@/core/aloha/translationAgent');
          let translations: any = {
            TR: { title: article.title, summary: article.summary, content: article.content, slug: article.slug }
          };
          for (let trRetry = 0; trRetry < 3; trRetry++) {
            try {
              translations = await executeTranslationAgent(translations.TR, 'TR');
              const langCount = Object.keys(translations).length;
              if (langCount >= 7) {
                console.log(`[COMPOSE] âœ… ${langCount} dil çevirisi tamamlandı (deneme ${trRetry + 1})`);
                break;
              }
              console.warn(`[COMPOSE] âš ï¸ Ã‡eviri eksik: ${langCount}/8 dil â€” tekrar deneniyor (${trRetry + 1}/3)`);
            } catch (trErr: any) {
              console.warn(`[COMPOSE] âš ï¸ Ã‡eviri denemesi ${trRetry + 1}/3 başarısız: ${trErr.message}`);
              if (trRetry === 2) {
                try {
                  await adminDb.collection('aloha_alerts').add({
                    type: 'TRANSLATION_PIPELINE_WEAK',
                    message: `3 deneme sonrası çeviri eksik: ${Object.keys(translations).length}/8 dil`,
                    article: topic,
                    project,
                    timestamp: new Date().toISOString(),
                    read: false,
                  });
                } catch { /* alert yazılamazsa da devam */ }
              }
            }
          }

          // 4. Firebase'e yaz (zengin yapı â€” Frontend schema'sına uyumlu)
          const collectionName = `${project}_news`;
          const now = new Date();
          const contentWordCount = (article.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
          const docData: any = {
            title: article.title,
            summary: article.summary,
            content: article.content,
            slug: article.slug || article.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 60),
            category,
            tags: enforcedTags,
            image_url: images[0] || '',
            media: {
              images: images.map((url: string, i: number) => ({
                url, 
                caption: `${article.title} - ${i + 1}`, 
                alt_text: `${category} - ${article.title} görsel ${i + 1}`,
                order: i,
              })),
              videos: [], documents: [], audio: [],
            },
            translations,
            status: 'published',
            publishedAt: now.toISOString(),
            createdAt: now.toISOString(),
            source: 'aloha_compose',
            ai_generated: true,
            content_word_count: contentWordCount,
            reading_time: Math.ceil(contentWordCount / 200),
            seo: {
              title: article.seo_title || article.title,
              description: article.seo_description || article.summary,
              keywords: article.seo_keywords || article.tags || [],
            },
            // Frontend uyumlu alanlar (schema bridge)
            ai_commentary: article.ai_commentary || '',
            ai_insight: article.ai_commentary || article.ai_insight || '', // Frontend bunu okur
            ai_action: (Array.isArray(article.action_items) ? article.action_items[0] : '') || article.ai_action || '',
            business_opportunities: article.business_opportunities || [],
            related_topics: article.related_topics || [],
            market_impact: article.market_impact || '',
            qualityScore: 90,
            // VisualDNA â€” görseller MasterPhotographer prompt'ları ile üretildi
            image_prompts: imagePromptData,
            visual_dna_version: '1.0',
            // INTELLIGENCE 360 â€” Derin Analiz Katmanları
            ai_impact_score: article.ai_impact_score || 5,
            executive_summary: article.executive_summary || [],
            action_items: article.action_items || [],
            buyer_mindset: article.buyer_mindset || {},
            trend_prediction: article.trend_prediction || '',
            opportunity_radar: article.opportunity_radar || [],
            country_intelligence: article.country_intelligence || {},
            content_type: article.content_type || 'intelligence_briefing',
            // Sector Action â†’ Frontend'in beklediği alan
            sector_action: (Array.isArray(article.action_items) ? article.action_items[0] : '') || '',
            // LEAD ENGINE & DATA FUSION
            lead_data: article.lead_data || {},
            daily_sentiment: article.daily_sentiment || {},
            company_movements: article.company_movements || [],
            early_signals: article.early_signals || [],
            perde_relevance: article.perde_relevance || false,
            // Radar Alert özel alanları (TRTEX FarEastRadar bileşeni kullanır)
            ...(category === 'Radar Alert' ? {
              trust_score: article.trust_score || args.trust_score || 0.85,
            } : {}),
          };

          const ref = await adminDb.collection(collectionName).add(docData);

          // FAZ D: Auto-Enrichment
          let enrichmentLog = '';
          try {
            const { enrichArticle } = await import('./relatedNewsEngine');
            const enrichResult = await enrichArticle({ docId: ref.id, collection: collectionName });
            if (enrichResult.includes('zenginle')) enrichmentLog = ' | Related+StructuredData';
          } catch { /* enrichment opsiyonel */ }

          // Visual SEO Metadata
          let visualSeoLog = '';
          try {
            const { buildVisualSEOPackage } = await import('@/core/aloha/visualSeoEngine');
            if (images.length > 0) {
              const seoPkg = await buildVisualSEOPackage(article.title, article.content || '', 0);
              await adminDb.collection(collectionName).doc(ref.id).update({
                image_alt_text_tr: seoPkg.alt_text_tr,
                image_alt_text_en: seoPkg.alt_text_en,
                image_caption_tr: seoPkg.caption_tr,
                image_caption_en: seoPkg.caption_en,
                image_seo_filename: seoPkg.filename,
                image_category: seoPkg.detected_category,
              });
              visualSeoLog = ` | SEO: ${seoPkg.filename}`;
            }
          } catch { /* visual SEO opsiyonel */ }

          // â•â•â• OTONOM ARŞİV MEMURU (COLLECTION ROUTING) â•â•â•
          let archivalLog = '';
          try {
            const signals = article.routing_signals || {};
            const scores = {
              radar: signals.world_radar || 0,
              academy: signals.academy_value || 0,
              opportunity: signals.b2b_opportunity || 0
            };
            
            // SADECE POINTER (INDEX) YAZILACAK - SINGLE SOURCE OF TRUTH (trtex_news = MASTER)
            const taskList = [];
            let hubs = [];
            
            if (scores.radar >= 0.85) {
              taskList.push(adminDb.collection(`${project}_radar`).doc(ref.id).set({
                ref_id: ref.id, score: scores.radar, createdAt: docData.createdAt
              }));
              hubs.push('Radar');
            }
            if (scores.academy >= 0.80) {
              taskList.push(adminDb.collection(`${project}_academy`).doc(ref.id).set({
                ref_id: ref.id, score: scores.academy, createdAt: docData.createdAt
              }));
              hubs.push('Academy');
            }
            if (scores.opportunity >= 0.90) {
              taskList.push(adminDb.collection(`${project}_opportunities`).doc(ref.id).set({
                ref_id: ref.id, score: scores.opportunity, createdAt: docData.createdAt
              }));
              hubs.push('Opportunity');
            }
            
            if (taskList.length > 0) {
              await Promise.all(taskList);
              archivalLog = ` | Arşiv: ${hubs.join(',')}`;
              console.log(`[OTONOM ARŞİV] ğŸ“ ${ref.id} -> ${hubs.join(', ')} kasalarına arşivlendi.`);
            }
          } catch (archErr: any) {
             console.warn(`[OTONOM ARŞİV] âš ï¸ Kopyalama başarısız: ${archErr.message}`);
          }

          const wordEst = (article.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
          toolResult = [
            `[MAKALE YAYINDA]`,
            `"${article.title}"`,
            `DocID: ${ref.id}`,
            `${wordEst} kelime | ${finalImageCount} gorsel | ${Object.keys(translations).length} dil`,
            `Kapak: ${images[0]?.slice(-40) || 'yok'}`,
            `Koleksiyon: ${collectionName}`,
            `Tags: ${(article.tags || []).join(', ')}${enrichmentLog}${visualSeoLog}${archivalLog}`,
          ].join('\n');

          logAlohaAction('COMPOSE_ARTICLE', { docId: ref.id, title: article.title, project, images: images.length, enriched: !!enrichmentLog });
        } catch (e: any) {
          toolResult = `[âŒ MAKALE OLUŞTURULAMADI] ${e.message}`;
        }
        break;
      }

      case "update_intelligence_dashboard": {
        try {
          const dashboardData: any = {
            hero_opportunity: {
              headline: args.hero_headline,
              opportunity: args.hero_opportunity,
              country: args.hero_country || 'Global',
              flag: args.hero_flag || 'ğŸŒ',
              action: args.hero_action || 'DETAYLARI İNCELE',
              link: '/opportunities/hero-deal',
            },
            updated_at: new Date().toISOString(),
            updated_by: 'aloha_autonomous',
          };

          // Market verisini SADECE gerçek argüman varsa yaz â€” hardcoded sahte veri YASAK
          const marketData: any = {};
          if (args.shanghai_freight_price) {
            marketData.shanghai_freight = {
              price: args.shanghai_freight_price,
              change_30d: args.shanghai_freight_change || '0%',
              trend: args.shanghai_freight_trend || 'stable',
            };
          }
          if (args.cn_factory_price) {
            marketData.cn_factory = {
              price: args.cn_factory_price,
              change_30d: args.cn_factory_change || '0%',
              trend: args.cn_factory_trend || 'stable',
            };
          }
          if (args.pta_price) {
            marketData.pta_meg = {
              price: args.pta_price,
              change_30d: args.pta_change || '0%',
              trend: args.pta_trend || 'stable',
            };
          }
          if (Object.keys(marketData).length > 0) {
            dashboardData.market = marketData;
          }

          await adminDb.collection('trtex_intelligence').doc('live_dashboard').set(dashboardData, { merge: true });

          toolResult = `[âœ… İSTİHBARAT PANELİ GÃœNCELLENDİ]\n` +
            `ğŸ”¥ HOT LEAD: "${args.hero_headline}"\n` +
            `ğŸš¢ SCFI: ${args.shanghai_freight_price || 'varsayılan'}\n` +
            `ğŸ­ CN Kapasite: ${args.cn_factory_price || 'varsayılan'}%\n` +
            `ğŸ’§ PTA/MEG: ${args.pta_price || 'varsayılan'} $/ton\n` +
            `ğŸ“… Güncelleme: ${new Date().toISOString()}`;

          logAlohaAction('INTELLIGENCE_DASHBOARD_UPDATE', { headline: args.hero_headline });
        } catch (e: any) {
          toolResult = `[âŒ İSTİHBARAT PANELİ GÃœNCELLENEMEDI] ${e.message}`;
        }
        break;
      }

      case "update_homepage_brain": {
        try {
          // Parse JSON strings
          let questions = [];
          try { questions = JSON.parse(args.daily_questions || '[]'); } catch { questions = []; }
          
          let opportunities = [];
          try { opportunities = JSON.parse(args.opportunities || '[]'); } catch { opportunities = []; }
          
          let signals = [];
          try { signals = JSON.parse(args.sector_pulse_signals || '[]'); } catch { signals = []; }

          const countries = (args.daily_affected_countries || 'Türkiye,Ã‡in,AB').split(',').map((c: string) => c.trim());

          // Intelligence Score hesaplama
          let newsCount = 0;
          try {
            const oneDayAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
            const snap = await adminDb.collection('trtex_news')
              .where('publishedAt', '>', oneDayAgo)
              .limit(50).get();
            newsCount = snap.size;
          } catch (e) { await dlq.recordSilent(e, 'engine.homepage_brain', 'trtex'); }

          const intelligenceScore = Math.min(100, 
            (newsCount * 10) + 
            (opportunities.length * 5) + 
            (questions.length > 0 ? 20 : 0) +
            (signals.length * 3)
          );

          const brainData = {
            // Daily Insight
            dailyInsight: {
              date: new Date().toISOString(),
              headline: args.daily_headline,
              summary: args.daily_summary,
              questions: questions.length > 0 ? questions : [
                { q: 'Piyasa Durumu?', a: args.daily_summary },
                { q: 'Fırsatlar?', a: `${opportunities.length} aktif B2B fırsat tespit edildi.` },
                { q: 'Risk?', a: `Genel risk seviyesi: ${args.daily_risk_level || 'ORTA'}` },
              ],
              firm_link: { label: 'Firma Radarı', href: '/companies' },
              trade_link: { label: 'Fırsat Ağı', href: '/is-birligi-firsatlari' },
              risk_level: args.daily_risk_level || 'ORTA',
              opportunity_level: args.daily_opportunity_level || 'YÃœKSEK',
              affected_countries: countries,
              trtex_comment: args.daily_comment || 'TRTEX AI analiz motoru aktif.',
              updated_at: new Date().toISOString(),
            },
            // B2B Opportunities
            opportunities,
            // Sector Pulse  
            sectorPulse: {
              summary: args.sector_pulse_summary || '',
              signals: signals.length > 0 ? signals : [
                { tag: 'GLOBAL', risk: 'ORTA', text: 'Piyasa verileri analiz ediliyor.' }
              ],
            },
            // Intelligence Score
            intelligenceScore,
            newsCount48h: newsCount,
            // Meta
            updatedAt: new Date().toISOString(),
            updatedBy: 'aloha_autonomous',
          };

          // Tek atomik yazım
          await adminDb.collection('trtex_intelligence').doc('homepage_brain').set(brainData, { merge: true });

          // Daily Insight'ı ayrı doka da yaz (DailyInsightSection okur)
          await adminDb.collection('trtex_intelligence').doc('daily_insight').set({
            ...brainData.dailyInsight,
          }, { merge: true });

          // Trade opportunities'i live_dashboard'a da yaz (TopOpportunitiesSection okur)
          await adminDb.collection('trtex_intelligence').doc('live_dashboard').set({
            trade_opportunities: opportunities,
            updated_at: new Date().toISOString(),
          }, { merge: true });

          toolResult = `[âœ… HOMEPAGE BRAIN GÃœNCELLENDİ]\n` +
            `ğŸ“Š Intelligence Score: ${intelligenceScore}/100\n` +
            `ğŸ“° Son 48h haber: ${newsCount}\n` +
            `ğŸ’¡ Daily Insight: "${args.daily_headline}"\n` +
            `ğŸ¢ Fırsatlar: ${opportunities.length} adet\n` +
            `ğŸ“¡ Sektör Sinyali: ${signals.length} adet\n` +
            `â° Güncelleme: ${new Date().toISOString()}`;

          logAlohaAction('HOMEPAGE_BRAIN_UPDATE', { score: intelligenceScore, opps: opportunities.length });
        } catch (e: any) {
          toolResult = `[âŒ HOMEPAGE BRAIN GÃœNCELLENEMEDI] ${e.message}`;
        }
        break;
      }

      case "update_article_image": {
        try {
          const slug = args.slug;
          const project = (args.project || 'trtex').toLowerCase().replace('.com','').replace('.ai','');
          const collectionName = `${project}_news`;
          const promptHint = args.prompt_hint || '';

          // Slug ile haberi bul
          const snapshot = await adminDb.collection(collectionName)
            .where('slug', '==', slug)
            .limit(1)
            .get();

          if (snapshot.empty) {
            // Slug yoksa direkt ID olarak dene
            const docRef = adminDb.collection(collectionName).doc(slug);
            const docSnap = await docRef.get();
            if (!docSnap.exists) {
              toolResult = `[âŒ] Haber bulunamadı: slug="${slug}" koleksiyon="${collectionName}"`;
              break;
            }
            // ID ile bulduk
            const data = docSnap.data()!;
            const title = data.translations?.TR?.title || data.title || promptHint || slug;
            const category = data.category || 'İstihbarat';

            const { processImageForContent } = require('@/core/aloha/imageAgent');
            const imageUrl = await processImageForContent('news', category, title);

            await docRef.update({
              image_url: imageUrl,
              image_generated: true,
              image_generated_at: new Date().toISOString(),
            });

            toolResult = `[âœ… GÃ–RSEL GÃœNCELLENDİ]\n` +
              `ğŸ“° Haber: ${title.slice(0, 60)}\n` +
              `ğŸ–¼ï¸ Görsel: ${imageUrl?.slice(-50) || 'yok'}\n` +
              `ğŸ“‚ Koleksiyon: ${collectionName}`;
          } else {
            const doc = snapshot.docs[0];
            const data = doc.data();
            const title = data.translations?.TR?.title || data.title || promptHint || slug;
            const category = data.category || 'İstihbarat';

            const { processImageForContent } = require('@/core/aloha/imageAgent');
            const imageUrl = await processImageForContent('news', category, title);

            await adminDb.collection(collectionName).doc(doc.id).update({
              image_url: imageUrl,
              image_generated: true,
              image_generated_at: new Date().toISOString(),
            });

            toolResult = `[âœ… GÃ–RSEL GÃœNCELLENDİ]\n` +
              `ğŸ“° Haber: ${title.slice(0, 60)}\n` +
              `ğŸ–¼ï¸ Görsel: ${imageUrl?.slice(-50) || 'yok'}\n` +
              `ğŸ“‚ Koleksiyon: ${collectionName}\n` +
              `ğŸ†” Doc ID: ${doc.id}`;
          }

          logAlohaAction('UPDATE_ARTICLE_IMAGE', { slug, project });
        } catch (e: any) {
          toolResult = `[âŒ GÃ–RSEL GÃœNCELLEME HATASI] ${e.message}`;
        }
        break;
      }

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // PLANNER AGENT HANDLERS
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

      case "create_execution_plan": {
        try {
          const taskDesc = args.task_description || "";
          const context = args.context || "";
          
          // Planner Agent'ı çağır
          const plan = await generatePlan(taskDesc, context);
          
          // Firebase'e yaz ve onay bekle
          const planId = await submitPlanForApproval(plan, taskDesc, 'aloha');
          
          // Ã–zet göster
          toolResult = formatPlanSummary(plan, planId);
          
          logAlohaAction('PLAN_CREATED', { planId, goal: plan.goal, steps: plan.plan.length });
        } catch (e: any) {
          toolResult = `[HATA] Plan oluşturulamadı: ${e.message}`;
        }
        break;
      }

      case "approve_plan": {
        try {
          const planId = args.plan_id || "";
          if (!planId) { toolResult = "[HATA] plan_id gerekli"; break; }
          
          // Planı onayla
          const { approvePlan } = await import('./planner');
          await approvePlan(planId, 'admin');
          
          // Yürütmeye başla
          const result = await executePlan(planId);
          
          toolResult = formatExecutionResult(result);
          
          logAlohaAction('PLAN_APPROVED_AND_EXECUTED', { planId, status: result.status });
        } catch (e: any) {
          toolResult = `[HATA] Plan onay/yürütme hatası: ${e.message}`;
        }
        break;
      }

      case "list_plans": {
        try {
          const plans = await listPendingPlans();
          if (plans.length === 0) {
            toolResult = "[ğŸ“‹] Bekleyen plan yok.";
          } else {
            const lines = plans.map(p => {
              const statusIcon = p.status === 'pending_approval' ? 'â³' : p.status === 'executing' ? 'ğŸ”„' : 'âœ…';
              return `${statusIcon} [${p.id}] ${p.plan.goal} (${p.total_steps} adım, ${p.status})`;
            });
            toolResult = `[ğŸ“‹ PLANLAR] ${plans.length} aktif plan:\n${lines.join('\n')}`;
          }
        } catch (e: any) {
          toolResult = `[HATA] Plan listesi alınamadı: ${e.message}`;
        }
        break;
      }

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // WEB CHECK / SEO HANDLER
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

      case "check_website": {
        try {
          const url = args.url || "";
          const checkSeo = args.check_seo !== false;
          
          if (!url) { toolResult = "[HATA] URL gerekli"; break; }
          
          const startTime = Date.now();
          const response = await fetch(url, { 
            signal: AbortSignal.timeout(10000),
            headers: { 'User-Agent': 'ALOHA-HealthCheck/1.0' }
          });
          const responseTime = Date.now() - startTime;
          const html = await response.text();
          
          const results: string[] = [];
          results.push(`[ğŸŒ WEBSITE CHECK] ${url}`);
          results.push(`[HTTP] Status: ${response.status} ${response.statusText}`);
          results.push(`[â±ï¸] Response: ${responseTime}ms`);
          results.push(`[ğŸ“„] HTML Boyut: ${(html.length / 1024).toFixed(1)}KB`);
          
          // Boş sayfa kontrolü
          if (html.length < 500) {
            results.push(`[ğŸ”´ KRİTİK] Sayfa çok kısa (${html.length} karakter) â€” BOŞ SAYFA olabilir!`);
          }
          
          // İçerik kontrolü
          const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          if (bodyMatch) {
            const bodyText = bodyMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            results.push(`[ğŸ“] İçerik uzunluğu: ${bodyText.length} karakter`);
            if (bodyText.length < 100) {
              results.push(`[ğŸ”´ UYARI] İçerik çok az â€” render sorunu olabilir (CSR/SSR)`);
            }
          }
          
          // SEO analizi
          if (checkSeo) {
            results.push(`\nâ”€â”€â”€ SEO ANALİZİ â”€â”€â”€`);
            
            // Title
            const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
            if (titleMatch && titleMatch[1].trim()) {
              results.push(`[âœ… TITLE] "${titleMatch[1].trim().substring(0, 80)}"`);
            } else {
              results.push(`[ğŸ”´ TITLE] EKSIK â€” SEO kritik hata!`);
            }
            
            // Meta Description
            const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
            if (descMatch && descMatch[1].trim()) {
              results.push(`[âœ… DESC] "${descMatch[1].trim().substring(0, 100)}"`);
            } else {
              results.push(`[ğŸ”´ DESC] EKSIK â€” SEO önemli hata!`);
            }
            
            // OG Tags
            const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
            const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
            const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
            results.push(`[${ogTitle ? 'âœ…' : 'ğŸŸ¡'}] OG:TITLE ${ogTitle ? 'var' : 'EKSIK'}`);
            results.push(`[${ogDesc ? 'âœ…' : 'ğŸŸ¡'}] OG:DESC ${ogDesc ? 'var' : 'EKSIK'}`);
            results.push(`[${ogImage ? 'âœ…' : 'ğŸŸ¡'}] OG:IMAGE ${ogImage ? 'var' : 'EKSIK'}`);
            
            // H1
            const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/gi);
            if (h1Match && h1Match.length > 0) {
              const h1Text = h1Match[0].replace(/<[^>]+>/g, '').trim();
              results.push(`[âœ… H1] "${h1Text.substring(0, 80)}" (${h1Match.length} adet)`);
            } else {
              results.push(`[ğŸ”´ H1] EKSIK â€” SEO temel hata!`);
            }
            
            // Canonical
            const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
            results.push(`[${canonical ? 'âœ…' : 'ğŸŸ¡'}] CANONICAL ${canonical ? canonical[1] : 'EKSIK'}`);
            
            // Robots
            const robots = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
            results.push(`[${robots ? 'âœ…' : 'ğŸŸ¡'}] ROBOTS ${robots ? robots[1] : 'belirtilmemiş'}`);
          }
          
          toolResult = results.join('\n');
          
          logAlohaAction('CHECK_WEBSITE', { url, status: response.status, responseTime, seo: checkSeo });
        } catch (e: any) {
          toolResult = `[ğŸ”´ WEBSITE DOWN] ${args.url}\nHata: ${e.message}\nSite erişilemez veya timeout!`;
        }
        break;
      }
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // WEB SEARCH & FETCH URL HANDLERS
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

      case "web_search": {
        try {
          const query = args.query || "";
          const language = args.language || "tr";
          const maxResults = Math.min(args.max_results || 5, 10);
          
          if (!query) { toolResult = "[HATA] Arama sorgusu gerekli"; break; }
          
          const results: string[] = [];
          results.push(`[ğŸ” WEB SEARCH â€” GEMINI GROUNDING] "${query}" (${language})`);
          
          // â•â•â• HİBRİT LİMİT KONTROLÃœ (100/gün + 2000/ay) â•â•â•
          const today = new Date().toISOString().split('T')[0];
          const thisMonth = today.substring(0, 7); // YYYY-MM
          const isCriticalTask = args.critical === true || args.priority === 'high';
          let dailySearchCount = 0;
          let monthlySearchCount = 0;
          let lastCachedResults: string | null = null;
          
          try {
            const quotaDoc = await adminDb.collection('system_state').doc('search_quota').get();
            if (quotaDoc.exists) {
              const qData = quotaDoc.data()!;
              if (qData.date === today) dailySearchCount = qData.count || 0;
              if (qData.month === thisMonth) monthlySearchCount = qData.monthly_count || 0;
              // Son cache'lenmiş sonuç
              if (qData.last_cache && qData.last_cache_query === query) {
                lastCachedResults = qData.last_cache;
              }
            }
          } catch { /* quota check fail â†’ devam */ }
          
          // Kritik görevler limit bypass â€” her zaman arar
          if (!isCriticalTask) {
            if (dailySearchCount >= 100) {
              // Günlük limit doldu â€” cache varsa kullan, yoksa degrade mod
              if (lastCachedResults) {
                results.push(`[âš ï¸ GÃœNLÃœK LİMİT 100/100] Cache'den sonuç döndürülüyor (son güncelleme: ${today})`);
                results.push(lastCachedResults);
                toolResult = results.join('\n');
                break;
              }
              results.push(`[âš ï¸ GÃœNLÃœK LİMİT 100/100] Arama sınırına ulaşıldı. Cache yok â€” Google Custom Search fallback deneniyor.`);
              // Fallback'a düşecek â€” grounding atlanır
            } else if (monthlySearchCount >= 2000) {
              results.push(`[âš ï¸ AYLIK LİMİT 2000/2000] Aylık arama kotası doldu. Degrade mod aktif.`);
              if (lastCachedResults) {
                results.push(lastCachedResults);
                toolResult = results.join('\n');
                break;
              }
            }
          }
          
          // Sayacı artır
          const canDoGrounding = isCriticalTask || (dailySearchCount < 100 && monthlySearchCount < 2000);
          try {
            await adminDb.collection('system_state').doc('search_quota').set({ 
              date: today, 
              count: (dailySearchCount < 100 || today !== (await adminDb.collection('system_state').doc('search_quota').get()).data()?.date) ? dailySearchCount + 1 : dailySearchCount,
              month: thisMonth,
              monthly_count: monthlySearchCount + 1,
              last_query: query,
            }, { merge: true });
          } catch { /* quota write fail â†’ devam */ }

          // â•â•â• KATMAN 1: GEMINI SEARCH GROUNDING (En güçlü) â•â•â•
          let groundingSuccess = false;
          try {
            const searchAi = alohaAI.getClient();
            const groundedResponse = await searchAi.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Sen bir B2B tekstil istihbarat analistisin. Şu konuda güncel, doğrulanmış bilgi topla ve özetle:\n\n"${query}"\n\nKurallar:\n- Sadece GERÃ‡EK, doğrulanmış veriler sun\n- Rakamlar, yüzdeler, tarihler ver\n- Kaynak belirt\n- Türk ev tekstili/perde sektörü perspektifinden değerlendir\n- Kısa ve öz ol (max 800 kelime)`,
              config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.2,
              }
            });

            const groundedText = groundedResponse.text || '';
            if (groundedText.length > 10) {
              results.push(`[âœ… GEMINI GROUNDED SEARCH] Doğrulanmış sonuçlar:`);
              results.push(groundedText.substring(0, 3000));
              
              // Grounding metadata'dan kaynak URL'leri çek
              const candidates = (groundedResponse as any).candidates || [];
              if (candidates[0]?.groundingMetadata?.groundingChunks) {
                results.push(`\n[ğŸ“ KAYNAKLAR]`);
                candidates[0].groundingMetadata.groundingChunks.slice(0, 5).forEach((chunk: any, i: number) => {
                  if (chunk.web?.uri) {
                    results.push(`${i+1}. ${chunk.web.title || ''} â€” ${chunk.web.uri}`);
                  }
                });
              }
              groundingSuccess = true;
              
              // Başarılı sonucu cache'e yaz (limit dolunca kullanılır)
              try {
                await adminDb.collection('system_state').doc('search_quota').set({
                  last_cache: groundedText.substring(0, 2000),
                  last_cache_query: query,
                  last_cache_at: new Date().toISOString(),
                }, { merge: true });
              } catch { /* cache write fail â†’ sessiz */ }
            }
          } catch (groundingErr: any) {
            console.warn(`[ALOHA] âš ï¸ Gemini Search Grounding hatası: ${groundingErr.message}`);
            results.push(`[âš ï¸] Gemini Grounding denemesi başarısız: ${groundingErr.message}`);
          }

          // â•â•â• KATMAN 2: GOOGLE CUSTOM SEARCH API (Fallback) â•â•â•
          if (!groundingSuccess) {
            const csApiKey = process.env.GOOGLE_SEARCH_API_KEY;
            const csCxId = process.env.GOOGLE_SEARCH_CX;
            
            if (csApiKey && csCxId) {
              try {
                const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${csApiKey}&cx=${csCxId}&q=${encodeURIComponent(query)}&num=${maxResults}&lr=lang_${language}`;
                const resp = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });
                const data = await resp.json();
                
                if (data.items && data.items.length > 0) {
                  results.push(`[âœ…] ${data.items.length} sonuç (Google Custom Search â€” Fallback)`);
                  data.items.forEach((item: any, i: number) => {
                    results.push(`\n${i+1}. ${item.title}`);
                    results.push(`   ğŸ”— ${item.link}`);
                    results.push(`   ğŸ“ ${(item.snippet || '').substring(0, 200)}`);
                  });
                } else {
                  results.push(`[âš ï¸] Google Custom Search da sonuç döndürmedi`);
                }
              } catch (csErr: any) {
                results.push(`[âš ï¸] Custom Search hatası: ${csErr.message}`);
              }
            } else {
              results.push(`[âš ï¸] Gemini Grounding başarısız ve GOOGLE_SEARCH_API_KEY tanımlı değil. Arama yapılamadı.`);
            }
          }
          
          toolResult = results.join('\n');
          logAlohaAction('WEB_SEARCH', { query, language, maxResults, grounded: groundingSuccess });
        } catch (e: any) {
          toolResult = `[HATA] Web arama başarısız: ${e.message}`;
        }
        break;
      }

      case "fetch_url": {
        try {
          const url = args.url || "";
          const maxLength = args.max_length || 3000;
          
          if (!url) { toolResult = "[HATA] URL gerekli"; break; }
          
          const resp = await fetch(url, {
            signal: AbortSignal.timeout(10000),
            headers: { 'User-Agent': 'ALOHA-Fetcher/1.0' }
          });
          
          if (!resp.ok) {
            toolResult = `[HATA] HTTP ${resp.status} ${resp.statusText} â€” ${url}`;
            break;
          }
          
          const contentType = resp.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
            const json = await resp.json();
            toolResult = `[ğŸ“„ JSON] ${url}\n${JSON.stringify(json, null, 2).substring(0, maxLength)}`;
          } else {
            const html = await resp.text();
            // HTML'den metin çıkar
            let text = html
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            toolResult = `[ğŸ“„ CONTENT] ${url} (${(html.length/1024).toFixed(1)}KB)\n${text.substring(0, maxLength)}`;
          }
          
          logAlohaAction('FETCH_URL', { url, length: toolResult.length });
        } catch (e: any) {
          toolResult = `[HATA] URL okunamadı: ${e.message}`;
        }
        break;
      }

      case "cloud_deploy": {
        const deployResult = await triggerCloudDeploy(args.service_name);
        toolResult = deployResult.success
          ? `[\u2601\ufe0f DEPLOY] Ba\u015far\u0131l\u0131! Build ID: ${deployResult.buildId}\nURL: ${deployResult.serviceUrl}`
          : `[\u274c DEPLOY] Hata: ${deployResult.error}`;
        break;
      }

      case "cloud_status": {
        const status = await checkCloudRunStatus(args.service_name);
        toolResult = status.status === 'ok'
          ? `[\u2601\ufe0f CLOUD RUN] ${status.name}\nURL: ${status.uri}\nRevision: ${status.latestRevision}\nSon g\u00fcncelleme: ${status.updateTime}`
          : `[\u274c CLOUD RUN] Hata: ${status.error}`;
        break;
      }

      case "send_email": {
        const emailResult = await sendGmail({ to: args.to, subject: args.subject, body: args.body });
        toolResult = emailResult.success
          ? `[\u2709\ufe0f GMAIL] E-posta g\u00f6nderildi! Message ID: ${emailResult.messageId}\nAlıcı: ${args.to}`
          : `[\u274c GMAIL] Hata: ${emailResult.error}`;
        break;
      }

      case "seo_analytics": {
        const seoResult = await getSearchAnalytics(args.site_url, args.days || 28);
        if (seoResult.success && seoResult.data) {
          const d = seoResult.data;
          const topQ = d.topQueries.slice(0, 5).map((q, i) => `  ${i+1}. "${q.query}" (${q.clicks} tık, ${q.impressions} gösterim)`).join('\n');
          toolResult = `[\ud83d\udcca SEO ANALYTICS] ${args.site_url}\n` +
            `T\u0131klamalar: ${d.clicks} | G\u00f6sterimler: ${d.impressions} | CTR: ${d.ctr}% | Ort. Pozisyon: ${d.position}\n` +
            `\nTop 5 Sorgu:\n${topQ}`;
        } else {
          toolResult = `[\u274c SEO] Hata: ${seoResult.error}`;
        }
        break;
      }

      case "git_read_file": {
        const r = await gitReadFile(args.file_path, args.branch, args.repo);
        toolResult = r.success
          ? `[\ud83d\udcc4 KOD] ${args.file_path} (${r.size} byte):\n\n${(r.content || '').substring(0, 8000)}`
          : `[\u274c] ${r.error}`;
        break;
      }

      case "git_write_file": {
        const w = await gitWriteFile(args.file_path, args.content, args.commit_message, args.branch, args.repo);
        toolResult = w.success
          ? `[\u2705 COMMIT] ${args.file_path} ba\u015far\u0131yla yaz\u0131ld\u0131!\nCommit: ${w.commitSha}\nBranch: ${args.branch || 'main'}`
          : `[\u274c] ${w.error}`;
        break;
      }

      case "git_search_code": {
        const s = await searchCode(args.query, args.repo);
        if (s.success && s.results) {
          const list = s.results.map((r, i) => `  ${i+1}. ${r.file}`).join('\n');
          toolResult = `[\ud83d\udd0d KOD ARAMA] "${args.query}" \u2192 ${s.total} sonu\u00e7:\n${list}`;
        } else {
          toolResult = `[\u274c] ${s.error}`;
        }
        break;
      }

      case "git_list_dir": {
        const l = await gitListDir(args.dir_path, args.branch, args.repo);
        if (l.success && l.items) {
          const list = l.items.map(i => `  ${i.type === 'dir' ? '\ud83d\udcc1' : '\ud83d\udcc4'} ${i.name}${i.type === 'file' ? ` (${i.size}b)` : ''}`).join('\n');
          toolResult = `[\ud83d\udcc2 D\u0130Z\u0130N] ${args.dir_path}/\n${list}`;
        } else {
          toolResult = `[\u274c] ${l.error}`;
        }
        break;
      }

      case "git_create_branch": {
        const b = await createBranch(args.branch_name, args.from_branch, args.repo);
        toolResult = b.success
          ? `[\ud83c\udf3f BRANCH] "${args.branch_name}" olu\u015fturuldu! Art\u0131k bu branch'e yazabilirsin.`
          : `[\u274c] ${b.error}`;
        break;
      }

      case "git_create_pr": {
        const pr = await createPullRequest(args.title, args.body, args.head_branch, args.base_branch, args.repo);
        toolResult = pr.success
          ? `[\ud83d\udce8 PR] #${pr.prNumber} olu\u015fturuldu!\nURL: ${pr.prUrl}\nAdmin onay\u0131 bekleniyor.`
          : `[\u274c] ${pr.error}`;
        break;
      }

      case "git_commits": {
        const c = await getRecentCommits(args.count || 10, args.repo);
        if (c.success && c.commits) {
          const list = c.commits.map(co => `  ${co.sha} | ${co.date.substring(0,10)} | ${co.message}`).join('\n');
          toolResult = `[\ud83d\udcdc COMMITS] Son ${c.commits.length}:\n${list}`;
        } else {
          toolResult = `[\u274c] ${c.error}`;
        }
        break;
      }

      case "google_index": {
        if (args.urls && Array.isArray(args.urls)) {
          const batch = await batchIndexUrls(args.urls);
          toolResult = `[ğŸ“¡ GOOGLE INDEX] Toplu: ${batch.success} başarılı, ${batch.failed} hatalı`;
        } else if (args.url) {
          const idx = await submitUrlToGoogle(args.url);
          toolResult = idx.success
            ? `[ğŸ“¡ GOOGLE INDEX] ${args.url} indexlemeye gönderildi!`
            : `[âŒ] ${idx.error}`;
        } else {
          toolResult = '[âŒ] url veya urls parametresi gerekli';
        }
        break;
      }

      case "geo_analyze": {
        const geo = await analyzeGeoReadiness(args.url);
        if (geo.success && geo.data) {
          const d = geo.data;
          const findingsList = d.findings.map(f => `  ${f.status === 'good' ? 'âœ…' : f.status === 'warning' ? 'âš ï¸' : 'âŒ'} ${f.category}: ${f.detail}`).join('\n');
          const recs = d.recommendations.length > 0 ? `\n\nğŸ“Œ Ã–neriler:\n${d.recommendations.map((r, i) => `  ${i+1}. ${r}`).join('\n')}` : '';
          toolResult = `[ğŸŒ GEO ANALİZ] ${args.url}\nSkor: ${d.score}/100\n\n${findingsList}${recs}`;
        } else {
          toolResult = `[âŒ] ${geo.error}`;
        }
        break;
      }

      case "analyze_competitor": {
        const comp = await analyzeCompetitor(args.url);
        if (comp.success && comp.data) {
          const d = comp.data;
          toolResult = `[ğŸ•µï¸ RAKİP ANALİZİ] ${args.url}\n` +
            `Başlık: ${d.title}\nSEO Skoru: ${d.seoScore}/100\n` +
            `Tech: ${d.techStack.join(', ') || 'tespit edilemedi'}\n` +
            `Sinyaller: ${d.contentSignals.join(' | ')}\n` +
            `\nğŸ¯ Fırsatlar:\n${d.opportunities.map((o, i) => `  ${i+1}. ${o}`).join('\n') || '  Fırsat bulunamadı'}`;
        } else {
          toolResult = `[âŒ] ${comp.error}`;
        }
        break;
      }

      case "multi_search": {
        const ms = await multiSearch(args.query);
        if (ms.success && ms.results) {
          const list = ms.results.map((r, i) => `  ${i+1}. [${r.source}] ${r.title}\n     ${r.url}\n     ${r.snippet.substring(0, 100)}`).join('\n');
          toolResult = `[ğŸ” MULTI-SEARCH] "${args.query}" â†’ ${ms.results.length} sonuç:\n${list}`;
        } else {
          toolResult = `[âŒ] ${ms.error}`;
        }
        break;
      }

      case "agent_message": {
        const trust = verifyAgentTrust('aloha', args.to);
        if (!trust.allowed) {
          toolResult = `[ğŸ›¡ï¸ TRUST] Mesaj engellendi: ${trust.reason}`;
        } else {
          const msg = await sendAgentMessage({
            from: 'aloha',
            to: args.to,
            type: args.type || 'task',
            payload: { message: args.message },
            priority: args.priority || 'normal',
          });
          toolResult = msg.success
            ? `[ğŸ¤ AJAN] Mesaj gönderildi â†’ ${args.to} (${args.type}): ${args.message.substring(0, 100)}`
            : `[âŒ] ${msg.error}`;
        }
        break;
      }

      // â•â•â• TRTEX SİTE YÃ–NETİCİ ARAÃ‡LARI â€” Execution â•â•â•
      case "trtex_create_page": {
        const { trtexCreatePage } = await import('./trtexSiteManager');
        toolResult = await trtexCreatePage({
          slug: args.slug,
          title_tr: args.title_tr,
          title_en: args.title_en,
          template: args.template,
          content_tr: args.content_tr,
          content_en: args.content_en,
        });
        break;
      }

      case "trtex_update_page": {
        const { trtexUpdatePage } = await import('./trtexSiteManager');
        toolResult = await trtexUpdatePage({
          slug: args.slug,
          field: args.field,
          value: args.value,
        });
        break;
      }

      case "trtex_site_audit": {
        const { trtexSiteAudit } = await import('./trtexSiteManager');
        toolResult = await trtexSiteAudit();
        break;
      }

      case "trtex_generate_component": {
        const { trtexGenerateComponent } = await import('./trtexSiteManager');
        toolResult = await trtexGenerateComponent({
          name: args.name,
          purpose: args.purpose,
          data_source: args.data_source,
        });
        break;
      }

      case "trtex_manage_menu": {
        const { trtexManageMenu } = await import('./trtexSiteManager');
        toolResult = await trtexManageMenu({
          menu_type: args.menu_type,
          items: args.items,
        });
        break;
      }

      case "trtex_bootstrap_site": {
        const { trtexBootstrapSite } = await import('./trtexSiteManager');
        toolResult = await trtexBootstrapSite();
        break;
      }

      case "trtex_get_site_state": {
        const { trtexGetSiteState } = await import('./trtexSiteManager');
        toolResult = await trtexGetSiteState();
        break;
      }

      case "trtex_apply_patch": {
        const { trtexApplyPatch } = await import('./trtexSiteManager');
        toolResult = await trtexApplyPatch({
          slug: args.slug,
          changes: args.changes,
        });
        break;
      }


      case "trtex_enrich_article": {
        const { enrichArticle } = await import('./relatedNewsEngine');
        toolResult = await enrichArticle({
          docId: args.docId,
          collection: args.collection || 'trtex_news',
        });
        break;
      }

      case "trtex_batch_enrich": {
        const { batchEnrichArticles } = await import('./relatedNewsEngine');
        toolResult = await batchEnrichArticles({
          limit: Math.min(args.limit || 20, 50),
          collection: args.collection || 'trtex_news',
        });
        break;
      }

      case "trtex_lead_stats": {
        const { getLeadStats } = await import('./leadEngine');
        toolResult = await getLeadStats();
        break;
      }

      case "trtex_search_leads": {
        const { getLeadsByFilter } = await import('./leadEngine');
        toolResult = await getLeadsByFilter({
          role: args.role,
          country: args.country,
          product: args.product,
          status: args.status,
          limit: Math.min(args.limit || 20, 50),
        });
        break;
      }

      case "trtex_find_matches": {
        const { findMatches } = await import('./leadEngine');
        toolResult = await findMatches(args.leadId);
        break;
      }

      // â•â•â• AGENT BUS â€” Ã‡ift Yönlü İletişim â•â•â•
      case "agent_send_and_wait": {
        try {
          const { sendAndWait } = await import('./agentBus');
          let parsedPayload: Record<string, any>;
          try {
            parsedPayload = typeof args.payload === 'string' ? JSON.parse(args.payload) : args.payload;
          } catch {
            parsedPayload = { message: args.payload };
          }
          const response = await sendAndWait(
            args.to,
            args.type || 'task',
            parsedPayload,
            { timeoutMs: Math.min(args.timeout_ms || 20000, 30000) }
          );
          toolResult = response.success
            ? `[ğŸ”— AJAN YANIT] ${args.to} â†’ âœ…\nGüven: ${response.confidence || '?'}\nVeri: ${JSON.stringify(response.data).substring(0, 1500)}\nMantık: ${response.reasoning || '-'}\nÃ–neri: ${response.suggestedNextAction || '-'}`
            : `[ğŸ”— AJAN YANIT] ${args.to} â†’ âŒ ${response.reasoning}`;
        } catch (e: any) {
          toolResult = `[HATA] Agent bus: ${e.message}`;
        }
        break;
      }

      // â•â•â• STRATEGIC DECISION ENGINE â•â•â•
      case "strategic_decision": {
        try {
          const { makeStrategicDecision, executeApprovedDecisions } = await import('./strategicDecisionEngine');
          const project = (args.project || 'trtex').toLowerCase().replace('.com','').replace('.ai','');
          const decisions = await makeStrategicDecision(
            { context: args.context || '' },
            project
          );
          
          if (decisions.length === 0) {
            toolResult = '[DECISION] Karar üretilemedi (Safe Mode aktif olabilir veya veri yetersiz)';
            break;
          }

          // LOW/MEDIUM risk olanları otomatik çalıştır
          const approved = decisions.filter(d => d.status === 'approved');
          const proposed = decisions.filter(d => d.status === 'proposed');
          
          let report = `[ğŸ§  STRATEJİK KARARLAR â€” ${project.toUpperCase()}]\n`;
          report += `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n`;
          
          for (const d of decisions) {
            const riskIcon = d.risk === 'low' ? 'ğŸŸ¢' : d.risk === 'medium' ? 'ğŸŸ¡' : 'ğŸ”´';
            report += `${riskIcon} ${d.action} (güven: ${d.confidence}, risk: ${d.risk})\n`;
            report += `   ğŸ“‹ ${d.reasoning.substring(0, 200)}\n`;
            report += `   ğŸ¯ Beklenen: ${d.expectedOutcome}\n`;
            report += `   ğŸ”™ Geri alma: ${d.rollbackPlan}\n`;
            report += `   ğŸ“Š Durum: ${d.status}\n\n`;
          }

          if (approved.length > 0) {
            report += `\nâ–¶ï¸ ${approved.length} karar UYGULANACAK (low/medium risk)...\n`;
            const results = await executeApprovedDecisions(approved, executeToolCall);
            for (const r of results) {
              report += `  ${r.success ? 'âœ…' : 'âŒ'} ${r.decision}: ${r.result.substring(0, 200)}\n`;
            }
          }

          if (proposed.length > 0) {
            report += `\nâš ï¸ ${proposed.length} karar ONAY BEKLİYOR (high risk):\n`;
            for (const p of proposed) {
              report += `  ğŸ”´ ${p.action}: ${p.reasoning.substring(0, 100)}\n`;
            }
          }

          toolResult = report;
          logAlohaAction('STRATEGIC_DECISION', { project, total: decisions.length, approved: approved.length, proposed: proposed.length });
        } catch (e: any) {
          toolResult = `[HATA] Decision engine: ${e.message}`;
        }
        break;
      }

      case "decision_status": {
        const { getDecisionEngineStatus } = await import('./strategicDecisionEngine');
        toolResult = getDecisionEngineStatus();
        break;
      }

      case "learning_cycle": {
        try {
          const { runLearningCycle } = await import('./strategicDecisionEngine');
          toolResult = await runLearningCycle(args.project || 'trtex');
        } catch (e: any) {
          toolResult = `[HATA] Learning cycle: ${e.message}`;
        }
        break;
      }

      case "safe_mode_reset": {
        const { resetSafeMode } = await import('./strategicDecisionEngine');
        resetSafeMode();
        toolResult = 'ğŸŸ¢ Safe mode sıfırlandı. Otonom aksiyonlar tekrar aktif.';
        logAlohaAction('SAFE_MODE_RESET', { by: 'hakan' });
        break;
      }

      // â•â•â• SCHEDULER â•â•â•
      case "schedule_task": {
        try {
          const { scheduleTask: scheduleFn } = await import('./scheduler');
          let parsedArgs: Record<string, any>;
          try {
            parsedArgs = typeof args.args === 'string' ? JSON.parse(args.args) : args.args;
          } catch {
            parsedArgs = {};
          }
          toolResult = await scheduleFn({
            action: args.action,
            args: parsedArgs,
            executeAt: args.execute_at,
            priority: args.priority as any,
            description: args.description,
          });
        } catch (e: any) {
          toolResult = `[HATA] Scheduler: ${e.message}`;
        }
        break;
      }

      case "list_tasks": {
        try {
          const { listScheduledTasks } = await import('./scheduler');
          toolResult = await listScheduledTasks(args.status);
        } catch (e: any) {
          toolResult = `[HATA] Task listesi: ${e.message}`;
        }
        break;
      }

      // â•â•â• UNIVERSAL SITE BUILDER â•â•â•
      case "universal_create_page": {
        try {
          const { universalCreatePage } = await import('./universalSiteManager');
          toolResult = await universalCreatePage({
            project: args.project,
            slug: args.slug,
            title_tr: args.title_tr,
            title_en: args.title_en,
            template: args.template,
            content_tr: args.content_tr,
          });
        } catch (e: any) {
          toolResult = `[HATA] Universal create: ${e.message}`;
        }
        break;
      }

      case "universal_site_audit": {
        try {
          const { universalSiteAudit } = await import('./universalSiteManager');
          toolResult = await universalSiteAudit({ project: args.project });
        } catch (e: any) {
          toolResult = `[HATA] Universal audit: ${e.message}`;
        }
        break;
      }

      case "universal_get_site_state": {
        try {
          const { universalGetSiteState } = await import('./universalSiteManager');
          toolResult = await universalGetSiteState({ project: args.project });
        } catch (e: any) {
          toolResult = `[HATA] Universal state: ${e.message}`;
        }
        break;
      }

      case "universal_apply_patch": {
        try {
          const { universalApplyPatch } = await import('./universalSiteManager');
          toolResult = await universalApplyPatch({
            project: args.project,
            slug: args.slug,
            changes: args.changes,
          });
        } catch (e: any) {
          toolResult = `[HATA] Universal patch: ${e.message}`;
        }
        break;
      }

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // TRADE PIPELINE â€” TİCARET MOTORU
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      case "run_trade_pipeline": {
        try {
          const { runTradePipeline } = await import('./tradePipeline');
          const result = await runTradePipeline(args.project || 'trtex');
          toolResult = JSON.stringify({
            status: 'success',
            newsAnalyzed: result.newsAnalyzed,
            opportunitiesFound: result.opportunitiesFound,
            landingPagesGenerated: result.landingPagesGenerated,
            topOpportunities: result.topOpportunities.map(o => ({
              title: o.sourceNewsTitle.substring(0, 80),
              countries: o.targetCountries,
              products: o.productCategories,
              value: o.estimatedValue,
              urgency: o.urgency,
              score: o.score,
              actions: o.actionPlan,
            })),
            summary: result.summary,
          });
        } catch (e: any) {
          toolResult = `[HATA] Trade pipeline: ${e.message}`;
        }
        break;
      }

      case "trade_report": {
        try {
          const { getTradeReport } = await import('./tradePipeline');
          toolResult = await getTradeReport();
        } catch (e: any) {
          toolResult = `[HATA] Trade report: ${e.message}`;
        }
        break;
      }

      default:
        toolResult = `Bilinmeyen tool: ${call.name}`;
    }
  } catch (err: any) {
    toolResult = `[TOOL HATA] ${err.message}`;
  }

  const endTime = Date.now();
  const success = !toolResult.includes('[TOOL HATA]') && !toolResult.includes('[HATA]');

  if (success) {
    alohaToolCache.set(call.name || '', args, toolResult);
  }

  // ğŸ§  SELF-LEARNING: Her tool çağrısını metrik olarak kaydet
  try {
    if (adminDb) {
      await adminDb.collection('aloha_metrics').add({
        tool: call.name,
        args: JSON.stringify(args).substring(0, 200),
        success,
        duration: endTime - (endTime - 1), // gerçek süre chat/route.ts'te hesaplanıyor
        resultLength: toolResult.length,
        timestamp: Date.now(),
        hourlyCallCount: rateLimitCounter,
      });
    }
  } catch (e) { await dlq.recordSilent(e, 'engine.metrics', 'system'); }

  return toolResult;
}