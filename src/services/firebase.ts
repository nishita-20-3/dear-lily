import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import type { RegisteredUser, UserProfile, PhotoStrip, DiaryEntry, Album } from '../types';

// Firebase Configuration for Dear Lily Cloud Realtime Database
const firebaseConfig = {
  apiKey: "AIzaSyDearLilyCloudStudioAppKey2026",
  authDomain: "dear-lily-studio.firebaseapp.com",
  projectId: "dear-lily-studio",
  storageBucket: "dear-lily-studio.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:abcdef1234567890",
};

// Initialize Firebase App singleton safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Helper: Sanitize object IDs and undefined properties for Firestore
function sanitizeDocData<T extends Record<string, any>>(data: T): T {
  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val !== undefined) {
      sanitized[key] = val;
    }
  }
  return sanitized as T;
}

export const FirebaseService = {
  // ================= USER PROFILES & ACCOUNTS =================
  saveUser: async (user: RegisteredUser | UserProfile): Promise<boolean> => {
    try {
      if (!user.id) return false;
      const cleanId = user.id.trim().toLowerCase();
      const userRef = doc(db, 'users', cleanId);
      const cleanData = sanitizeDocData({
        ...user,
        id: cleanId,
        email: user.email ? user.email.trim().toLowerCase() : '',
        updatedAt: new Date().toISOString(),
      });
      await setDoc(userRef, cleanData, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firebase saveUser cloud warning (falling back to local cache):', err);
      return false;
    }
  },

  getUser: async (userId: string): Promise<RegisteredUser | null> => {
    try {
      if (!userId) return null;
      const cleanId = userId.trim().toLowerCase();
      const userRef = doc(db, 'users', cleanId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as RegisteredUser;
      }
      return null;
    } catch (err) {
      console.warn('Firebase getUser cloud warning:', err);
      return null;
    }
  },

  getUserByEmail: async (email: string): Promise<RegisteredUser | null> => {
    try {
      if (!email) return null;
      const cleanEmail = email.trim().toLowerCase();
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        return querySnap.docs[0].data() as RegisteredUser;
      }
      return null;
    } catch (err) {
      console.warn('Firebase getUserByEmail cloud warning:', err);
      return null;
    }
  },

  // ================= PHOTO STRIPS =================
  savePhotoStrip: async (strip: PhotoStrip): Promise<boolean> => {
    try {
      if (!strip.id) return false;
      const stripRef = doc(db, 'photo_strips', strip.id);
      const cleanData = sanitizeDocData({
        ...strip,
        userId: (strip.userId || '').trim().toLowerCase(),
        userEmail: (strip.userEmail || '').trim().toLowerCase(),
        updatedAt: new Date().toISOString(),
      });
      await setDoc(stripRef, cleanData, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firebase savePhotoStrip cloud warning:', err);
      return false;
    }
  },

  getPhotoStrips: async (userId: string, userEmail?: string): Promise<PhotoStrip[]> => {
    try {
      const cleanId = (userId || '').trim().toLowerCase();
      const cleanEmail = (userEmail || '').trim().toLowerCase();

      const q = query(collection(db, 'photo_strips'), where('userId', '==', cleanId));
      const querySnap = await getDocs(q);
      const stripsMap = new Map<string, PhotoStrip>();

      querySnap.forEach((docSnap: any) => {
        stripsMap.set(docSnap.id, docSnap.data() as PhotoStrip);
      });

      if (cleanEmail) {
        const qEmail = query(collection(db, 'photo_strips'), where('userEmail', '==', cleanEmail));
        const emailSnap = await getDocs(qEmail);
        emailSnap.forEach((docSnap: any) => {
          stripsMap.set(docSnap.id, docSnap.data() as PhotoStrip);
        });
      }

      return Array.from(stripsMap.values());
    } catch (err) {
      console.warn('Firebase getPhotoStrips cloud warning:', err);
      return [];
    }
  },

  deletePhotoStrip: async (stripId: string): Promise<boolean> => {
    try {
      if (!stripId) return false;
      await deleteDoc(doc(db, 'photo_strips', stripId));
      return true;
    } catch (err) {
      console.warn('Firebase deletePhotoStrip cloud warning:', err);
      return false;
    }
  },

  // ================= DIARY ENTRIES =================
  saveDiaryEntry: async (entry: DiaryEntry): Promise<boolean> => {
    try {
      if (!entry.id) return false;
      const entryRef = doc(db, 'diary_entries', entry.id);
      const cleanData = sanitizeDocData({
        ...entry,
        userId: (entry.userId || '').trim().toLowerCase(),
        updatedAt: new Date().toISOString(),
      });
      await setDoc(entryRef, cleanData, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firebase saveDiaryEntry cloud warning:', err);
      return false;
    }
  },

  getDiaryEntries: async (userId: string): Promise<DiaryEntry[]> => {
    try {
      const cleanId = (userId || '').trim().toLowerCase();
      const q = query(collection(db, 'diary_entries'), where('userId', '==', cleanId));
      const querySnap = await getDocs(q);
      return querySnap.docs.map((d: any) => d.data() as DiaryEntry);
    } catch (err) {
      console.warn('Firebase getDiaryEntries cloud warning:', err);
      return [];
    }
  },

  // ================= ALBUMS =================
  saveAlbum: async (album: Album): Promise<boolean> => {
    try {
      if (!album.id) return false;
      const albumRef = doc(db, 'albums', album.id);
      const cleanData = sanitizeDocData({
        ...album,
        userId: (album.userId || '').trim().toLowerCase(),
        updatedAt: new Date().toISOString(),
      });
      await setDoc(albumRef, cleanData, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firebase saveAlbum cloud warning:', err);
      return false;
    }
  },

  getAlbums: async (userId: string): Promise<Album[]> => {
    try {
      const cleanId = (userId || '').trim().toLowerCase();
      const q = query(collection(db, 'albums'), where('userId', '==', cleanId));
      const querySnap = await getDocs(q);
      return querySnap.docs.map((d: any) => d.data() as Album);
    } catch (err) {
      console.warn('Firebase getAlbums cloud warning:', err);
      return [];
    }
  },
};
