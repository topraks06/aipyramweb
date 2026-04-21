"use client";

import { useState } from "react";
import { Copy, Terminal, Zap, ShieldAlert, Cpu, CheckCircle2, Loader2, Send } from "lucide-react";
import { AgentTerminal, LogEntry } from "@/components/shared/AgentTerminal";

export default function SwarmTerminal() {
  const [task, setTask] = useState("");
  const [domain, setDomain] = useState("perde");
  const [mode, setMode] = useState("deep");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeStream, setActiveStream] = useState<LogEntry[]>([]);

  const getAgentIcon = (agent: string) => {
    switch(agent) {
      case "VISIONARY": return <Zap className="w-5 h-5 text-yellow-400" />;
      case "REALITY": return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case "APOLLON": return <Cpu className="w-5 h-5 text-blue-400" />;
      case "ALOHA": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default: return <Terminal className="w-5 h-5 text-zinc-400" />;
    }
  };

  const executeSwarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);
    setResult(null);

    const tf = () => new Date().toISOString().substring(11, 19);
    let logs: LogEntry[] = [{ id: 'init', agent: 'SYSTEM', message: `INITIATING SWARM PROTOCOL FOR TARGET: ${domain.toUpperCase()}`, status: 'warning', timestamp: tf() }];
    setActiveStream([...logs]);

    try {
      const response = await fetch("/api/brain/v1/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "sk_aipyram_master_71", // Local test key
          "x-project": domain
        },
        body: JSON.stringify({ task, mode })
      });

      if (mode === "deep") {
        if (!response.body) throw new Error("Readable stream başlatılamadı.");
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;

        let buffer = "";
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            // The last item in split array might be incomplete json if no \n at the end yet
            buffer = lines.pop() || "";
            
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line);
                if (parsed.type === "log") {
                  logs.push({ id: Math.random().toString(), agent: parsed.agent, message: parsed.message, status: parsed.status, timestamp: tf() });
                  setActiveStream([...logs]);
                } else if (parsed.type === "finish") {
                  logs.push({ id: 'fin', agent: 'SUCCESS', message: 'Swarm execution completed. Payload decrypted.', status: 'success', timestamp: tf() });
                  setActiveStream([...logs]);
                  await new Promise(r => setTimeout(r, 600));
                  setResult({ success: true, mode: 'deep', project: domain, data: parsed.data });
                }
              } catch (e) {
                console.error("Stream parse error:", e);
              }
            }
          }
        }
      } else {
        // Fast and Autonomous Mode
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      logs.push({ id: 'err', agent: 'ERROR', message: 'CRITICAL FAILURE: Brain connection lost.', status: 'error', timestamp: tf() });
      setActiveStream([...logs]);
      setResult({ error: "Beyne bağlanırken hata oluştu. Sunucu çökmüş olabilir." });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono p-4 md:p-8 relative overflow-hidden">
      {/* Background Matrix/Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 flex gap-8 flex-col lg:flex-row">
        
        {/* Left Panel: Command Input */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-md rounded-xl p-6 shadow-2xl">
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-500" />
              Master Brain
            </h1>
            <p className="text-xs text-zinc-500 mb-6 uppercase tracking-wider">Aipyram Agent OS v4.0</p>
            
            <form onSubmit={executeSwarm} className="flex flex-col gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">HEDEF DOMAİN (EKOSİSTEM)</label>
                <select 
                  value={domain} onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-700/50 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="perde">Perde.ai (Retail/3D)</option>
                  <option value="trtex">Trtex.com (B2B/Trading)</option>
                  <option value="hometex">Hometex.ai (Fair/Matching)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">TETİKLEYİCİ MOD</label>
                <select 
                  value={mode} onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-700/50 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="fast">⚡ Fast (Single Shot)</option>
                  <option value="deep">🧠 Deep (Swarm Chaining)</option>
                  <option value="autonomous">🏭 Autonomous (Queue/Worker)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">SİSTEM EMRİ (GÖREV)</label>
                <textarea 
                  value={task} onChange={(e) => setTask(e.target.value)}
                  rows={4}
                  placeholder="Ajanlara vereceğiniz görevi yazın..."
                  className="w-full bg-black/50 border border-zinc-700/50 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder:text-zinc-600"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !task}
                className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
              >
                {loading ? null : <Send className="w-5 h-5" />}
                {loading ? "[ PROTOCOL_EXECUTING ]" : "SÜRÜYÜ ATEŞLE"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Matrix Execution Stream */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-6 min-h-[600px] shadow-inner relative flex flex-col">
            <div className="border-b border-zinc-900 pb-4 mb-4 flex justify-between items-center">
              <h2 className="text-sm font-semibold tracking-wider text-zinc-500">C:\\AIPYRAM\\GOD_MODE\\EXECUTION_TRACE</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-xs text-zinc-500">{loading ? 'PROCESSING' : 'IDLE'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {!result && !loading && activeStream.length === 0 && (
                <div className="flex h-full items-center justify-center text-zinc-600 italic">
                  Ajanların iletişim logları burada listelenecektir...
                </div>
              )}

              {(loading || activeStream.length > 0) && (
                <AgentTerminal logs={activeStream} isActive={loading} title="DEEP_SWARM_ANALYSIS" />
              )}

              {result?.error && (
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg text-red-400">
                  ⚠️ {result.error}
                </div>
              )}

              {/* AUTONOMOUS MODE RENDER */}
              {result?.success && result.mode === 'autonomous' && (
                <div className="p-4 border border-blue-500/30 bg-blue-500/10 rounded-lg">
                  <h3 className="text-blue-400 font-bold mb-2">🏭 JOB QUEUED SUCCESSFULLY</h3>
                  <p className="text-zinc-300 text-sm">{result.message}</p>
                  <div className="mt-4 p-3 bg-black/50 rounded font-mono text-xs text-zinc-400 border border-zinc-800">
                    jobId: {result.jobId}<br/>
                    statusUrl: {result.statusUrl}
                  </div>
                </div>
              )}

              {/* FAST MODE RENDER */}
              {result?.success && result.mode === 'fast' && (
                <div className="p-4 border border-emerald-500/30 bg-emerald-500/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-emerald-400 font-bold">⚡ FAST SHOT EXECUTION ({result.data.finalDecision.agent})</h3>
                  </div>
                  <div className="p-4 bg-black/60 rounded border border-emerald-500/20 text-sm whitespace-pre-wrap text-zinc-300">
                    {result.data.finalDecision.result}
                  </div>
                </div>
              )}

              {/* DEEP SWARM CHAIN RENDER */}
              {result?.success && result.mode === 'deep' && result.data?.chain && (
                <div className="space-y-6">
                  {result.data.chain.map((step: any, idx: number) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-zinc-800 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 200}ms` }}>
                      <div className="absolute -left-[11px] top-1 w-5 h-5 bg-zinc-950 rounded-full flex items-center justify-center">
                        {getAgentIcon(step.agent)}
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-xs tracking-wider" style={{ color: step.agent === 'VISIONARY' ? '#FBBF24' : step.agent === 'REALITY' ? '#EF4444' : '#60A5FA' }}>
                            [{step.agent}_NODE]
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono">CONF: {step.confidence}</span>
                        </div>
                        <pre className="text-xs text-zinc-300 whitespace-pre-wrap overflow-x-auto bg-black/30 p-3 rounded">
                          {(() => {
                            try { return JSON.stringify(JSON.parse(step.result), null, 2); }
                            catch { return step.result; }
                          })()}
                        </pre>
                      </div>
                    </div>
                  ))}

                  {/* FINAL ALOHA DECISION */}
                  {result.data?.finalDecision && (
                    <div className="relative pl-6 border-l-2 border-emerald-500/50 mt-8 animate-in fade-in zoom-in duration-700">
                      <div className="absolute -left-[11px] top-1 w-5 h-5 bg-zinc-950 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-emerald-400 text-xs tracking-wider">
                            [👑 ALOHA_MASTER_DECISION]
                          </span>
                        </div>
                        <div className="text-sm text-emerald-100/90 whitespace-pre-wrap leading-relaxed bg-black/40 p-4 rounded border border-emerald-500/20">
                          {(() => {
                            try { 
                              const parsed = JSON.parse(result.data.finalDecision.result);
                              return parsed.finalAction || parsed.response || result.data.finalDecision.result;
                            }
                            catch { return result.data.finalDecision.result; }
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
