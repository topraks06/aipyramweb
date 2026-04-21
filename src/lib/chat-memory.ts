import { adminDb } from '@/lib/firebase-admin';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date | string;
}

export interface ChatSession {
    sessionId: string;
    userId?: string;
    messages: ChatMessage[];
    lastContext: string;
    projectName?: string;
    createdAt: string;
    updatedAt: string;
}

const COLLECTION = 'chat_sessions';

export async function getSession(sessionId: string): Promise<ChatSession | null> {
    try {
        const doc = await adminDb.collection(COLLECTION).doc(sessionId).get();
        if (!doc.exists) return null;
        return doc.data() as ChatSession;
    } catch (error) {
        console.error("Error getting chat session:", error);
        return null;
    }
}

export async function saveMessage(sessionId: string, message: ChatMessage, userId?: string): Promise<void> {
    try {
        const docRef = adminDb.collection(COLLECTION).doc(sessionId);
        const doc = await docRef.get();
        const now = new Date().toISOString();

        if (!doc.exists) {
            await docRef.set({
                sessionId,
                userId: userId || null,
                messages: [message],
                lastContext: message.text.substring(0, 50),
                createdAt: now,
                updatedAt: now
            });
        } else {
            const data = doc.data() as ChatSession;
            const updatedMessages = [...data.messages, message].slice(-20); // Keep last 20 messages

            await docRef.update({
                messages: updatedMessages,
                lastContext: message.text.substring(0, 50),
                updatedAt: now
            });
        }
    } catch (error) {
        console.error("Error saving chat message:", error);
    }
}

export async function getRecentContext(sessionId: string): Promise<string> {
    const session = await getSession(sessionId);
    if (!session || !session.messages.length) return "";
    
    // Return last 5 messages context
    const recent = session.messages.slice(-5);
    return recent.map(m => `${m.role}: ${m.text}`).join('\n');
}
