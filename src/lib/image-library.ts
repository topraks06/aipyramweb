import { adminDb } from '@/lib/firebase-admin';
import { uploadMultiResolution } from '@/lib/storage-utils';

export interface LibraryImage {
    key: string;
    url_1k: string;
    url_2k: string;
    url_4k?: string;
    url_8k?: string;
    category: string;
    tags: string[];
    style: string;
    roomType: string;
    color: string;
    productType: string;
    source: 'imagen' | 'user_upload' | 'trtex_article';
    node: 'perde' | 'trtex' | 'hometex';
    usageCount: number;
    createdAt: string;
}

const COLLECTION = 'image_library';

export async function addImage(data: Omit<LibraryImage, 'key' | 'usageCount' | 'createdAt'>): Promise<string> {
    try {
        const docRef = adminDb.collection(COLLECTION).doc();
        const key = `img_${docRef.id}`;
        
        await docRef.set({
            key,
            ...data,
            usageCount: 0,
            createdAt: new Date().toISOString()
        });
        
        return key;
    } catch (error) {
        console.error("Error adding image to library:", error);
        throw error;
    }
}

export async function findByTags(tags: string[], limitCount: number = 10): Promise<LibraryImage[]> {
    try {
        // Querying for any of the tags using array-contains-any
        const snapshot = await adminDb.collection(COLLECTION)
            .where('tags', 'array-contains-any', tags)
            .limit(limitCount)
            .get();
            
        return snapshot.docs.map(doc => doc.data() as LibraryImage);
    } catch (error) {
        console.error("Error finding images by tags:", error);
        return [];
    }
}

export async function findByCategory(category: string, limitCount: number = 10): Promise<LibraryImage[]> {
    try {
        const snapshot = await adminDb.collection(COLLECTION)
            .where('category', '==', category)
            .orderBy('createdAt', 'desc')
            .limit(limitCount)
            .get();
            
        return snapshot.docs.map(doc => doc.data() as LibraryImage);
    } catch (error) {
        console.error("Error finding images by category:", error);
        return [];
    }
}

export async function findSimilarImage(roomType: string, style: string, color: string): Promise<LibraryImage | null> {
    try {
        // Find an image that perfectly matches the requested room, style, and primary color
        const snapshot = await adminDb.collection(COLLECTION)
            .where('roomType', '==', roomType)
            .where('style', '==', style)
            .where('color', '==', color)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
            
        if (!snapshot.empty) {
            const img = snapshot.docs[0].data() as LibraryImage;
            // Increment usage automatically
            await incrementUsage(img.key);
            return img;
        }
        return null;
    } catch (error) {
        console.error("Error finding similar image in vault:", error);
        return null;
    }
}

export async function incrementUsage(key: string): Promise<void> {
    try {
        const querySnapshot = await adminDb.collection(COLLECTION).where('key', '==', key).limit(1).get();
        if (querySnapshot.empty) return;
        
        const doc = querySnapshot.docs[0];
        const currentCount = doc.data().usageCount || 0;
        await doc.ref.update({ usageCount: currentCount + 1 });
    } catch (error) {
        console.error("Error incrementing usage:", error);
    }
}

/**
 * Fakes multi-resolution generation. In a full production env, 
 * this would use Sharp to resize the buffer and upload to Google Cloud Storage.
 */
export async function generateMultiResolution(originalDataUrl: string): Promise<{url_1k: string, url_2k: string, url_4k?: string}> {
    const baseName = `img_res_${Date.now()}_${crypto.randomUUID().slice(0, 7)}`;
    try {
        const urls = await uploadMultiResolution(originalDataUrl, baseName);
        return {
           url_1k: urls.url_1k,
           url_2k: urls.url_2k
        };
    } catch(e) {
        console.error("GCS MultiRes upload failed, falling back to base64:", e);
        return {
           url_1k: originalDataUrl,
           url_2k: originalDataUrl
        };
    }
}
