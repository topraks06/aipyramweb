import { NextResponse } from "next/server";
import { runSwarm } from "@/core/aloha/orchestrator";
import { executeSystemAction } from "@/core/actions/systemActions";
import { executeFileAction } from "@/core/actions/fileActions";

export async function POST(req: Request) {
  try {
    // 1. Internal Security Guard (Sadece bizim Queue Master tetikleyebilir)
    const secret = req.headers.get("x-internal-secret");
    if (secret !== (process.env.AIPYRAM_GLOBAL_API_KEY || "sk_aipyram_master_71")) {
      return NextResponse.json({ error: "Unauthorized Worker Access" }, { status: 401 });
    }

    const payload = await req.json();
    const { jobId, project, task, context } = payload;

    if (!jobId || !task) {
      return NextResponse.json({ error: "Invalid Job Payload" }, { status: 400 });
    }

    console.log(`\n⚙️ [Worker Node] Processing Background Job: ${jobId} for Project: ${project}`);

    // 2. RUN DEEP SWARM (Timeout korkusu olmadan)
    const swarmResult = await runSwarm({ task, context });
    
    // 3. GOD MODE EXECUTION (Eğer Aloha "ACT" veya "OVERRIDE" kullandıysa aksiyonu tetikle)
    const finalDecisionStr = swarmResult.finalDecision?.result || "";
    
    console.log(`[Worker Node] Swarm Result for ${jobId}: ${finalDecisionStr.substring(0, 50)}...`);

    // Gelişmiş "GitHub API / File Actions" Entegrasyonu:
    // Planda Aloha'nın çıktısı JSON olarak parse edilebilir. Eğer Aloha bir kod değişikliği istediyse,
    // GitHub API üzerinden PR açabiliriz. (Simüle Ediliyor)
    if (finalDecisionStr.includes("COMMIT_TO_GITHUB") || finalDecisionStr.includes("FILE_MODIFICATION")) {
        console.log(`[Worker Node] God Mode Tetiklendi: GitHub Webhook ateşleniyor veya Güvenli Dosya yazılıyor...`);
        // executeFileAction(...) veya GitHub API fetch(...)
    }

    // 4. SONUCU FIRESTORE'A YAZ (Client daha sonra /jobs/:id ile sorgular)
    // await adminDb.collection('job_results').doc(jobId).set(swarmResult);
    console.log(`✅ [Worker Node] Job ${jobId} Completed Successfully.`);

    return NextResponse.json({ success: true, jobId, message: "Job executed in background." });

  } catch (error: any) {
    console.error(`[Worker Node Error]:`, error.message);
    // Hata durumunu Firestore'a yaz (Dead Letter Queue)
    return NextResponse.json({ success: false, error: "Worker failed: " + error.message }, { status: 500 });
  }
}
