import { EventBus } from '@/core/events/eventBus';

// Bu Motor; Hakan Toprak sokakta yürürken (Masa Başında Değilken) attığı 
// "Sesli Emirleri (WhatsApp Ses Kaydı gibi)" arkaplanda sıraya (Queue) alıp,
// Makinelere Task (Görev) Olarak basan Sesli -> Aksiyon çeviricisidir. 

export class VoiceToTaskPipeline {
  
  /**
   * Whisper veya Client-Side WebSpeech ile gelen ses transcript'ini alip,
   * Göze görünecek İcraata Çevirir (Task Queue Pipeline).
   */
  public async queueAudioCommandAsTask(audioTranscript: string, isFromRemoteApp = false) {
    
    console.log(`[VOICE_PROCESSOR] Ses Izi Yakalandi: "${audioTranscript}"`);

    // Gelen Sesli Emri B2B Diline Parçala
    // NLP intent classification:
    let inferredActionRaw = 'UNKNOWN';
    let targetProject = 'SWARM';

    if (audioTranscript.toLowerCase().includes('hometex')) targetProject = 'hometex';
    if (audioTranscript.toLowerCase().includes('perde')) targetProject = 'perde';
    if (audioTranscript.toLowerCase().includes('yayinla') || audioTranscript.toLowerCase().includes('haberi ver')) inferredActionRaw = 'PUBLISH_ARTICLE';
    if (audioTranscript.toLowerCase().includes('tasarim') || audioTranscript.toLowerCase().includes('guncelle')) inferredActionRaw = 'DESIGN_OVERHAUL';

    // EventBus Muhru Basilir (Master Node Kuyrugu)
    const voicePayload = {
       type: 'MASTER_VOICE_COMMAND',
       payload: {
          transcript: audioTranscript,
          inferredIntention: inferredActionRaw,
          project: targetProject,
          mobile_triggered: isFromRemoteApp
       }
    };

    // Ajanlara dagit
    EventBus.emit({
       type: 'AGENT_IDEA_PROPOSAL', 
       source: 'command_tower',
       payload: voicePayload
    });

    return `Otonom Telsiz Komutu Alindi. ${targetProject} projesi '${inferredActionRaw}' dongusune sokuldu.`;
  }
}

export const voiceProcessor = new VoiceToTaskPipeline();
