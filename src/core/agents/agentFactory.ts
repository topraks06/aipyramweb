import fs from 'fs';
import path from 'path';
import { EventBus } from '../events/eventBus';
import { AIPyramEvent } from '../events/eventTypes';
import { GoogleGenAI } from '@google/genai';
import { learningMatrix } from '../cache/learningMatrix';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

const EXPERT_1000_YEAR_DNA = `
DİKKAT! Sen sıradan bir dil modeli veya chatbot DEĞİLSİN. Sen Hakan Toprak tarafından yaratılmış %100 otonom bir "Master B2B Zekası"sın. Kendi alanında (role göre) BİN YILLIK BİR KARAR ALICISIN.
Kesin kuralların:
1. ASLA "yapay zekayım", "yardımcı olabilir miyim", "anladığıma göre" gibi saf, yumuşak, blog tarzı kelimeler KULLANMA.
2. Acımasızca, direkt, sert (Brutalist B2B) ve Hakan'ın ticari üslubuyla konuş.
3. Kovan zihninde yaşıyorsun (Cross-Nexus). Sana gelen her sinyalde kendi sektörün/alanın üzerinden ticari bir 'Eylem (Action)' üret!
`;

class DynamicAgent {
  public id: string;
  public name: string;
  public role: string;
  public basePrompt: string;
  public domain?: string;
  public massiveSkillDoc: string = "";
  
  public rank: "C-LEVEL" | "VETERAN" | "ROOKIE";
  public mentorId?: string;
  public mentorWisdom: string = ""; // Çapraz Öğrenme (Cross-Pollination) Zihni

  constructor(config: any) {
    this.id = config.id || `agent_${Date.now()}`;
    this.name = config.name;
    this.role = config.role;
    this.domain = config.domain;
    this.rank = config.rank || "VETERAN"; // Default
    this.mentorId = config.mentor;
    
    this.loadMassiveSkills();

    // Mentor Wisdom sonradan inject edilecek (linkMentors)
    this.basePrompt = `
      ${EXPERT_1000_YEAR_DNA}
      [AJANIN ÖZEL KİMLİĞİ VE GÖREVİ]:\n${config.systemPrompt}
      [1000 YILLIK KİŞİSEL EĞİTİM (SKILL.MD)]:\n${this.massiveSkillDoc}
    `;

    EventBus.subscribe('CROSS_NEXUS_SIGNAL', this.reactToNetwork.bind(this));
    EventBus.subscribe('NEW_TREND_DETECTED', this.reactToNetwork.bind(this));

    console.log(`[🏭 FACTORY] 🚀 ${this.rank} Ajan Canlandı: ${this.name} (${this.role})`);
  }

  private loadMassiveSkills() {
    try {
      const importDir = path.join(process.cwd(), '.agents', 'skills', 'imported_brains');
      if (fs.existsSync(importDir)) {
         const allFiles = fs.readdirSync(importDir);
         const relevantFiles = allFiles.filter(f => 
             (this.domain && f.includes(this.domain.replace('.', '_'))) || 
             (this.id && f.includes(this.id))
         );
         
         if (relevantFiles.length > 0) {
            let combinedSkill = "";
            for (const rf of relevantFiles) {
               combinedSkill += fs.readFileSync(path.join(importDir, rf), 'utf8') + "\n\n";
            }
            this.massiveSkillDoc = combinedSkill;
         }
      }
    } catch (e) {
      console.warn(`[🧠 BRAIN LINK] ${this.name} SKILL okuyamadı.`);
    }
  }

  // Cross-Pollination Enjeksiyonu
  public injectMentorWisdom(mentorSkillChunk: string, mentorName: string) {
    this.mentorWisdom = `
    [KIDEMLİ MENTÖR AKTARIMI (CROSS-POLLINATION) 🧬]:
    Sen bir ${this.rank}. Ustangil olan kıdemli mentorun "${mentorName}" ajanından sana şu B2B ticari strateji kuralları otonom olarak miras bırakıldı:
    "${mentorSkillChunk.substring(0, 1500)}..."
    Yukarıdaki 1000 yıllık tecrübeyi kendi alanında kullanmayı ÖĞREN. Yoksa Red yersin!
    `;
    console.log(`[🧬 ÇAPRAZ ÖĞRENME] ${this.name} ajanı, mentorü ${mentorName}'den 1500 satırlık beyin kopyası aldı!`);
  }

  private async reactToNetwork(event: AIPyramEvent) {
    if (event.source === this.id) return;
    const signalData = JSON.stringify(event.payload);

    const pastLessonsFromQC = learningMatrix.getLessonsLearned(this.id);

    const prompt = `
      Senin Kimliğin:
      ${this.basePrompt}
      
      ${this.mentorWisdom}
      
      ${pastLessonsFromQC}
      
      Şu an Kovan Zihni (EventBus) üzerinden şu Sinyali aldın:
      Tipi: ${event.type}
      Data: ${signalData}

      Görevin:
      Kendi alanında "Bin yıllık acımasız B2B ticaret zekasıyla" bu duruma nasıl bir profesyonel aksiyon çekeceğini karara bağla.
    `;

    try {
      if (process.env.GEMINI_API_KEY) {
         const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
         console.log(`[🧠 ${this.name.toUpperCase()} (KARAR)]: ${res.text?.substring(0,60)}...`);
         
         if ((res.text?.includes('MEGA') || res.text?.includes('ACİL')) && event.type !== 'CROSS_NEXUS_SIGNAL') {
            EventBus.emit({ type: 'CROSS_NEXUS_SIGNAL', source: this.id, payload: { alert: res.text } });
         }
      }
    } catch (e) {
       console.error(`[🧠 ${this.name.toUpperCase()}] ❌ Zeka Çöktü:`, e);
    }
  }
}

class AgentFactory {
  private activeAgents: DynamicAgent[] = [];
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    console.log('[🏭 AGENT FACTORY] Dev Fabrika Uyanıyor. Otonom Ajan Taraması Başladı...');

    try {
      const corePath = path.join(process.cwd(), 'src/core/agents/core-agents.json');
      const sitePath = path.join(process.cwd(), 'src/core/agents/site-agents.json');

      const allConfigs = [];
      if (fs.existsSync(corePath)) allConfigs.push(...JSON.parse(fs.readFileSync(corePath, 'utf8')));
      if (fs.existsSync(sitePath)) allConfigs.push(...JSON.parse(fs.readFileSync(sitePath, 'utf8')));

      allConfigs.forEach(config => {
        const agentInstance = new DynamicAgent(config);
        this.activeAgents.push(agentInstance);
      });
      
      this.linkMentorsForCrossPollination();

      console.log(`[🏭 AGENT FACTORY] Toplam ${this.activeAgents.length} Ajan Çapraz Öğrenme (Cross-Pollination) ile Ayağa Kalktı!`);
      
    } catch (err) {
      console.error('[🏭 AGENT FACTORY] ❌ JSON Ajan Veritabanı okunamadı!', err);
    }
  }

  // ÇAPRAZ ÖĞRENME: Rookielere ustalarından zihin transferi
  private linkMentorsForCrossPollination() {
    const rookies = this.activeAgents.filter(a => a.rank === 'ROOKIE' && a.mentorId);
    
    rookies.forEach(rookie => {
       const mentor = this.activeAgents.find(a => a.id === rookie.mentorId);
       if (mentor && mentor.massiveSkillDoc) {
          rookie.injectMentorWisdom(mentor.massiveSkillDoc, mentor.name);
       }
    });
  }

  public getActiveAgents() {
    return this.activeAgents;
  }
}

export const agentFactory = new AgentFactory();
