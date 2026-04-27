import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import type { User } from 'firebase/auth';

export interface SovereignUser {
  uid: string;
  email: string | null;
  name: string;
  globalRole: 'admin' | 'member';
  nodes: string[]; // List of SovereignNodeId where the user is registered
  lastActive: string;
  createdAt: string;
}

/**
 * Universal Sovereign Identity Manager
 * Ensures that a user is registered in the global "sovereign_users" pool.
 */
export async function syncSovereignIdentity(user: User, activeNode: string): Promise<SovereignUser> {
  const sovereignRef = doc(db, 'sovereign_users', user.uid);
  const snap = await getDoc(sovereignRef);

  const now = new Date().toISOString();

  if (snap.exists()) {
    const data = snap.data() as SovereignUser;
    
    // If the user isn't registered to this specific node yet, add it
    if (!data.nodes.includes(activeNode)) {
      data.nodes.push(activeNode);
      await updateDoc(sovereignRef, {
        nodes: data.nodes,
        lastActive: now,
      });
    } else {
      await updateDoc(sovereignRef, {
        lastActive: now,
      });
    }

    return data;
  } else {
    // New global user
    const newUser: SovereignUser = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || '',
      globalRole: 'member', // Default to member, overridden by admin emails later if needed
      nodes: [activeNode],
      lastActive: now,
      createdAt: now,
    };

    await setDoc(sovereignRef, newUser);
    return newUser;
  }
}
