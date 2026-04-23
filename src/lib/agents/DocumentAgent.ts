import { admin, adminDb } from '@/lib/firebase-admin';
import { getNode } from '@/lib/sovereign-config';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generateProforma(SovereignNodeId: string, orderId: string, orderData: any): Promise<{pdfUrl: string}> {
  console.log(`[DocumentAgent] ${SovereignNodeId} için PDF oluşturuluyor. Sipariş ID: ${orderId}`);
  
  const config = getNode(SovereignNodeId);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  page.drawText(`${config.shortName} - B2B Teklif Formu`, { x: 50, y: height - 50, size: 20, font, color: rgb(0, 0, 0) });
  page.drawText(`Müşteri: ${orderData?.customerName || 'Bilinmiyor'}`, { x: 50, y: height - 90, size: 12, font });
  page.drawText(`Tutar: ${orderData?.grandTotal || 0} USD`, { x: 50, y: height - 110, size: 12, font });
  if (orderData?.discount) {
     page.drawText(`İndirim: ${orderData.discount} USD`, { x: 50, y: height - 130, size: 12, font });
  }
  page.drawText(`Notlar: ${orderData?.notes || 'Yok'}`, { x: 50, y: height - 150, size: 12, font });

  // Approve Link
  const approveUrl = `https://${config.domain}/approve-order?id=${orderId}`;
  page.drawText(`Siparişi Onaylamak İcin Linke Tiklayin:`, { x: 50, y: height - 200, size: 14, font, color: rgb(0.2, 0.2, 0.2) });
  page.drawText(`${approveUrl}`, { x: 50, y: height - 220, size: 12, font, color: rgb(0, 0, 1) });
  
  const pdfBytes = await pdfDoc.save();
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || "";
  const mockPdfUrl = `https://storage.googleapis.com-mock-test/documents/${SovereignNodeId}/${orderId}_proforma.pdf`;
  let pdfUrl = mockPdfUrl;

  try {
     const bucket = admin.storage().bucket(bucketName);
     const file = bucket.file(`documents/${SovereignNodeId}/${orderId}_proforma.pdf`);
     await file.save(Buffer.from(pdfBytes), { metadata: { contentType: 'application/pdf' } });
     await file.makePublic();
     pdfUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  } catch (err) {
     console.error("[DocumentAgent] PDF GCS Upload failed (Bucket undefined or permission error). Using Mock URL.");
  }
  
  if (orderId) {
    try {
      await adminDb.collection(config.projectCollection).doc(orderId).update({
        latestDocumentUrl: pdfUrl,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error(`[DocumentAgent] ${SovereignNodeId} projesi güncellenemedi: ${orderId}`, e);
    }
  }

  return { pdfUrl };
}
