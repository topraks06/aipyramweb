import { adminDb } from '@/lib/firebase-admin';

export async function getWeeklyDigest(): Promise<string> {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const isoString = sevenDaysAgo.toISOString();

        // Get news from the last 7 days from trtex_news
        // Since adminDb is the initialized firestore admin instance
        const querySnapshot = await adminDb
            .collection('trtex_news')
            .where('createdAt', '>=', isoString)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        if (querySnapshot.empty) {
            return `📊 PAZAR ÖZETİ:\nBu hafta Pazar Radarında (TRTEX) yeni bir işlem, talep veya istihbarat hareketi algılanmadı. Stabilite devam ediyor.`;
        }

        const newsItems = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return `• ${data.title} — ${data.commercial_note || 'Piyasa durumu izleniyor.'}`;
        });

        return `📊 HAFTALIK PAZAR ÖZETİ (TRTEX):\n${newsItems.join('\n')}`;

    } catch (error) {
        console.error("TRTEX Bridge Error:", error);
        return `📊 PAZAR ÖZETİ:\nŞu an pazar verilerine ulaşılamıyor (TRTEX terminalinde geçici bağlantı sorunu).`;
    }
}
