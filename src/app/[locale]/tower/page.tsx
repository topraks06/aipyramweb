import fs from "fs/promises";
import path from "path";
import { Server, Zap, ShieldAlert, Cpu } from "lucide-react";

async function getTowerData() {
  try {
    const agentsPath = path.join(process.cwd(), "src/core/agents/site-agents.json");
    const matrixPath = path.join(process.cwd(), "data", "learning_matrix.json");

    let agents = [];
    let learningMatrix = {};

    try {
      const a = await fs.readFile(agentsPath, "utf-8");
      agents = JSON.parse(a);
    } catch (e) {}

    try {
      const m = await fs.readFile(matrixPath, "utf-8");
      learningMatrix = JSON.parse(m);
    } catch (e) {}

    return { agents, learningMatrix };
  } catch (err) {
    return { agents: [], learningMatrix: {} };
  }
}

export default async function ControlTower() {
  const { agents, learningMatrix } = await getTowerData();

  const cLevel = agents.filter((a: any) => a.rank === "C-LEVEL");
  const veterans = agents.filter((a: any) => a.rank === "VETERAN");
  const rookies = agents.filter((a: any) => a.rank === "ROOKIE");

  const totalLessons = Object.values(learningMatrix).reduce((acc: number, arr: any) => acc + arr.length, 0);
  const isBrainComatose = !process.env.GEMINI_API_KEY;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-mono pb-24">
      <header className="border-b border-neutral-800 bg-black pt-12 pb-8 px-8">
        <div className="flex items-center gap-4 mb-2">
           <Zap className="text-red-600 w-8 h-8" />
           <h1 className="text-4xl font-black text-white uppercase tracking-widest">AIPYRAM TOWER</h1>
        </div>
        <p className="text-neutral-500 uppercase tracking-widest text-sm font-bold">Autonomous Swarm Control Matrix = 1000-Year Protocol</p>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-12">
        {isBrainComatose && (
          <div className="mb-12 bg-red-950/40 border-2 border-red-600 p-8 rounded-2xl flex items-center gap-6 shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-pulse">
            <ShieldAlert className="w-16 h-16 text-red-500 shrink-0" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">🚨 KİRİTİK SİSTEM KOMASI (SILENT FAILURE)</h2>
              <p className="text-red-300 font-bold">GEMINI_API_KEY bulunamadı! Ajanların zihin bağı koptu. Otonomi şu an sadece Mock (Uydurma) verilerle çalışıyor. Çökmediler ama kör durumdalar. Derhal .env dosyasını Cloud'a yükleyin!</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
           <MetricCard title="Ajan Popülasyonu" value={agents.length} label="Aktif Node" icon={Cpu} />
           <MetricCard title="Öğrenme Döngüsü" value={totalLessons} label="Kayıtlı Ders" icon={ShieldAlert} />
           <MetricCard title="Veteran (Eğitici)" value={veterans.length} label="Kıdemli Ajan" icon={Server} />
           <MetricCard title="Rookie (Acemi)" value={rookies.length} label="Eğitilen Ajan" icon={Zap} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
             <h2 className="text-xl text-white font-bold uppercase tracking-widest border-b border-neutral-800 pb-2 flex justify-between">
                <span>Swarm Mimari Şebekesi</span>
                <span className="text-red-500 text-xs mt-1">CROSS-POLLINATION LİVE</span>
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map((ag: any, i: number) => {
                  let badgeColor = "bg-green-900/40 text-green-400";
                  if (ag.rank === "C-LEVEL") badgeColor = "bg-red-900/40 text-red-500";
                  else if (ag.rank === "VETERAN") badgeColor = "bg-blue-900/40 text-blue-400";

                  return (
                    <div key={i} className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-red-500/50 transition-colors">
                       <div className="flex justify-between items-start mb-4">
                          <div className="text-lg font-bold text-white tracking-tight">{ag.name}</div>
                          <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-black ${badgeColor}`}>
                            {ag.rank}
                          </span>
                       </div>
                       <div className="text-xs text-neutral-500 mb-3">{ag.domain}</div>
                       <p className="text-sm text-neutral-400 leading-relaxed mb-4">{ag.systemPrompt}</p>
                       
                       {ag.mentor && (
                         <div className="mt-4 pt-3 border-t border-neutral-800 text-xs font-bold text-neutral-500 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                           Çapraz Öğrenme: Mentör <span className="text-white">[{ag.mentor}]</span>
                         </div>
                       )}
                    </div>
                  );
                })}
             </div>
          </div>

          <div className="space-y-8">
             <h2 className="text-xl text-white font-bold uppercase tracking-widest border-b border-red-900/50 pb-2 flex items-center gap-2">
                <ShieldAlert className="text-red-500 w-5 h-5" /> 
                <span>QC Art Director Hata Sicili</span>
             </h2>

             <div className="bg-black border border-neutral-800 p-6 rounded-xl space-y-6 max-h-[800px] overflow-y-auto">
                {Object.keys(learningMatrix).length === 0 ? (
                  <div className="text-sm text-neutral-500 font-medium">Şu an kusursuz işliyor. Sicil temiz.</div>
                ) : (
                  Object.entries(learningMatrix).map(([agentId, lessons]: any) => (
                    <div key={agentId} className="border-l-2 border-red-900 pl-4 py-2">
                       <span className="text-red-400 font-bold text-xs uppercase block mb-3">Target: {agentId}</span>
                       <div className="space-y-4">
                         {lessons.slice().reverse().map((l: any, idx: number) => (
                           <div key={idx} className="bg-neutral-900 p-4 rounded-lg text-sm text-neutral-300 leading-relaxed">
                             <div className="text-[10px] text-neutral-600 mb-2">{new Date(l.timestamp).toLocaleString()}</div>
                             {l.lesson}
                           </div>
                         ))}
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, label, icon: Icon }: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col justify-between h-32 hover:bg-neutral-800 transition-colors">
      <div className="flex justify-between items-start">
         <span className="text-4xl font-black text-white">{value}</span>
         <Icon className="text-red-600 w-6 h-6" />
      </div>
      <div>
         <div className="text-xs uppercase font-bold text-neutral-400">{title}</div>
         <div className="text-[10px] text-neutral-600">{label}</div>
      </div>
    </div>
  );
}
