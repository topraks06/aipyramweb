// Bu dosya Hakan'ın "Tek Dosya (Unified imageAgent)" Anayasası gereği iptal edilmiştir.
// Tüm mantık "imageAgent.ts" içerisine taşınmıştır. Geriye dönük uyumluluk için proxy görevi görür.
export { Category } from './imageAgent';

export class MasterPhotographer {
  public static buildMasterPhotographerPrompt(args: any) {
    return { prompt: "PROXY_PROMPT", negativePrompt: "PROXY_NEGATIVE" };
  }
}
