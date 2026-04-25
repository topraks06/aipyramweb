import { NextRequest, NextResponse } from "next/server";
import { alohaAI } from "@/core/aloha/aiClient";

/**
 * ═══════════════════════════════════════════════════════════════
 *  PERDE.AI — B2B KEŞİF FÖYÜ HESAPLAMA MOTORU
 *  Kaynak: Orijinal perde.ai/src/services/gemini.ts → calculateB2BMetrics()
 * 
 *  Müşteri bilgileri + oda ölçüleri + kumaş fiyatı →
 *  Profesyonel keşif föyü (kesim listesi, montaj talimatları, fiyat)
 * ═══════════════════════════════════════════════════════════════
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, measurements, fabricPrice, sewingDetails } = body;

    if (!customer?.name || !measurements?.length) {
      return NextResponse.json(
        { error: "Müşteri bilgisi ve en az bir oda ölçüsü gereklidir." },
        { status: 400 }
      );
    }

    const result = await alohaAI.generateJSON(
      `Sen profesyonel bir İç Mimar, Perde Toptancısı ve Üretim/Montaj Şefisin (Master Tailor & Installer).
Müşteri için ölçüsü alınan kapsamlı bir "Keşif ve Üretim Projesi" detayları aşağıdadır:

Müşteri: ${customer.name} (${customer.phone || "Telefon yok"})
Adres/Şantiye: ${customer.address || "Belirtilmemiş"}
Teslim/Montaj Tarihi: ${customer.date || "Belirtilmemiş"}
Kumaş Ort. Birim Fiyat (₺): ${fabricPrice || "Belirtilmemiş"}
Ana Dikim/Tasarım İstekleri: ${sewingDetails || "Standart"}

ÖLÇÜ ALINAN ODALAR (Keşif Tutanağı):
${measurements.map((m: any) => `- Oda: ${m.roomName} | Genişlik: ${m.width}cm | Yükseklik: ${m.height}cm | Zemin/Tavan: ${m.ceilingType || "Standart"}`).join("\n")}

Lütfen gerçekçi, sektörel argolar içeren (ekstrafor, kurşun, kanun pile, alçıpan çelik dübeli, rustik vb.) eksiksiz bir ÇOĞUL YÖNETİM FİŞİ oluştur.

Sonucu KESİNLİKLE AŞAĞIDAKİ JSON formatında döndür:

{
  "projectSummary": {
    "totalFabricMeters": "Toplam gereken kumaş, fireler dahil",
    "totalHardwareMeters": "Toplam korniş/rustik metre ihtiyacı",
    "totalCostTRY": "Malzeme + İşçilik + Montaj dahil KDV haliyle toplam tutar (Sadece Sayı)"
  },
  "customerQuote": {
    "welcomeMessage": "Müşteriye sunulacak prestijli teklif önsözü",
    "deliveryTerms": "Tahmini teslim, garanti ve bakım notları",
    "rooms": [
      {
        "room": "Oda Adı",
        "description": "Oda için müşterinin anlayacağı şık ürün açıklaması",
        "price": "Odanın tahmini fiyatı"
      }
    ]
  },
  "productionTicket": {
    "tailorInstructions": [
      "Terzi için: Desen takibine dikkat. Kumaş yan dikiş payları...",
      "Etek ve tepe detayları (örn: amerikan pile, 8cm ekstrafor...)"
    ],
    "cutList": [
      { "item": "Kumaş Kesim Ölçüsü", "qty": "Oda/Pencere bazlı boy ve metraj" }
    ],
    "wasteWarning": "Olası kumaş fire (waste) analizi ve tavsiyesi"
  },
  "installationTicket": {
    "hardwareNeeds": "Korniş, dübel tipi (alçıpan çelik/helezon), L ayak vb. listesi",
    "installerNotes": [
      "Montör için: Tavan alçıpan olduğu için çelik / paraşüt dübel kullanılmalıdır.",
      "İskele/Merdiven ihtiyacı veya zorluk uyarısı"
    ]
  }
}`,
      {
        complexity: "complex",
      },
      "perde.b2b-calc"
    );

    return NextResponse.json({
      success: true,
      quote: result,
    });

  } catch (error: any) {
    console.error("[B2B-CALC] API Error:", error);
    return NextResponse.json(
      { error: error.message || "Hesaplama hatası" },
      { status: 500 }
    );
  }
}
