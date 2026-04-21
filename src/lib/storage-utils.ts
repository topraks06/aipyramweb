import sharp from 'sharp';
import { admin } from '@/lib/firebase-admin';

export async function uploadToStorage(base64Image: string, fileName: string): Promise<string> {
    try {
        const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET || "");
        // Default bucket could be left empty if app initializes it properly
        // e.g. admin.storage().bucket() uses default bucket from cert

        // Extract base64 payload
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Convert to WebP via Sharp
        const webpBuffer = await sharp(imageBuffer).webp({ quality: 85 }).toBuffer();
        
        const file = bucket.file(fileName);
        await file.save(webpBuffer, {
            metadata: {
                contentType: 'image/webp'
            }
        });
        
        await file.makePublic();
        return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    } catch (error) {
        console.error("Storage upload error:", error);
        throw error;
    }
}

export async function uploadMultiResolution(base64Image: string, baseFileName: string): Promise<{url_1k: string, url_2k: string}> {
    try {
        const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET || "");
        
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // 1K Res
        const buffer1k = await sharp(imageBuffer)
            .resize({ width: 1024, withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();
        
        // 2K Res
        const buffer2k = await sharp(imageBuffer)
            .resize({ width: 2048, withoutEnlargement: true })
            .webp({ quality: 90 })
            .toBuffer();

        const file1k = bucket.file(`${baseFileName}_1k.webp`);
        const file2k = bucket.file(`${baseFileName}_2k.webp`);

        await Promise.all([
            file1k.save(buffer1k, { metadata: { contentType: 'image/webp' } }),
            file2k.save(buffer2k, { metadata: { contentType: 'image/webp' } })
        ]);

        await Promise.all([
            file1k.makePublic(),
            file2k.makePublic()
        ]);

        return {
            url_1k: `https://storage.googleapis.com/${bucket.name}/${file1k.name}`,
            url_2k: `https://storage.googleapis.com/${bucket.name}/${file2k.name}`,
        };
    } catch (error) {
        console.error("MultiRes Storage upload error:", error);
        // Fallback or rethrow
        throw error;
    }
}
