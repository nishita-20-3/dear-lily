import type { UserProfile, RegisteredUser, PhotoStrip, DiaryEntry, Album, AppSettings } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const DEFAULT_UNAUTH_USER: UserProfile = {
  id: '',
  name: '',
  username: '',
  email: '',
  avatar: '',
  coverImage: '',
  bio: '',
  birthday: '',
  joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  favoriteTheme: 'Floral Journal',
  isAuth: false,
};

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  cursorSparkles: true,
  clickEffects: true,
  themeColor: 'pastel-pink',
};

const DEFAULT_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: 'user_admin_default',
    name: 'Lily Admin',
    username: 'admin',
    email: 'admin@dearlily.com',
    password: 'admin',
    role: 'admin',
    isAdmin: true,
    joinDate: 'August 2026',
  },
  {
    id: 'user_aarohii_default',
    name: 'Aarohii',
    username: 'aarohii',
    email: 'aarohii.n.2021@gmail.com',
    password: 'admin',
    role: 'admin',
    isAdmin: true,
    joinDate: 'August 2026',
  },
];

// IndexedDB Engine for Unlimited Photo Strip Storage
const DB_NAME = 'DearLilyStudioDB';
const DB_VERSION = 1;
const STORE_STRIPS = 'photo_strips';

let inMemoryStripsCache: PhotoStrip[] = [];
let isDbInitialized = false;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject('IndexedDB not available');
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_STRIPS)) {
        db.createObjectStore(STORE_STRIPS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const saveAllStripsToIndexedDB = async (strips: PhotoStrip[]) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_STRIPS, 'readwrite');
    const store = tx.objectStore(STORE_STRIPS);
    store.clear();
    for (const s of strips) {
      store.put(s);
    }
  } catch (err) {
    console.error('Failed to save photo strips to IndexedDB:', err);
  }
};

export const StorageService = {
  initIndexedDB: async (): Promise<PhotoStrip[]> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_STRIPS, 'readonly');
      const store = tx.objectStore(STORE_STRIPS);
      const req = store.getAll();
      return new Promise((resolve) => {
        req.onsuccess = () => {
          const dbStrips: PhotoStrip[] = req.result || [];
          let localStrips: PhotoStrip[] = [];
          try {
            const data = localStorage.getItem('dear_lily_strips');
            localStrips = data ? JSON.parse(data) : [];
          } catch {}

          const map = new Map<string, PhotoStrip>();
          for (const s of [...dbStrips, ...localStrips]) {
            if (s && s.id) map.set(s.id, s);
          }
          const merged = Array.from(map.values());
          inMemoryStripsCache = merged;
          isDbInitialized = true;

          saveAllStripsToIndexedDB(merged).catch(() => {});
          resolve(merged);
        };
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      console.warn('IndexedDB fallback to localStorage:', e);
      return [];
    }
  },

  getUser: (): UserProfile => {
    const data = localStorage.getItem('dear_lily_user');
    if (!data) return DEFAULT_UNAUTH_USER;
    try {
      const parsed = JSON.parse(data);
      return { ...parsed, isAuth: Boolean(parsed.isAuth) };
    } catch {
      return DEFAULT_UNAUTH_USER;
    }
  },

  saveUser: (user: UserProfile) => {
    try {
      localStorage.setItem('dear_lily_user', JSON.stringify({ ...user, isAuth: true }));
    } catch (e) {
      console.warn('Quota error saving user session, trying fallback...', e);
    }

    // Automatically update registered users list so logging back in preserves bio, birthday, avatar, coverImage, etc.
    if (user && user.email) {
      const existing = StorageService.getRegisteredUsers();
      const cleanEmail = user.email.trim().toLowerCase();
      const cleanId = user.id ? user.id.trim().toLowerCase() : '';
      
      const idx = existing.findIndex(
        (u) =>
          (cleanId && u.id.trim().toLowerCase() === cleanId) ||
          (cleanEmail && u.email.trim().toLowerCase() === cleanEmail)
      );

      if (idx !== -1) {
        existing[idx] = {
          ...existing[idx],
          name: user.name || existing[idx].name,
          username: user.username || existing[idx].username,
          avatar: user.avatar !== undefined ? user.avatar : existing[idx].avatar,
          coverImage: user.coverImage !== undefined ? user.coverImage : existing[idx].coverImage,
          bio: user.bio !== undefined ? user.bio : existing[idx].bio,
          birthday: user.birthday !== undefined ? user.birthday : existing[idx].birthday,
          favoriteTheme: user.favoriteTheme || existing[idx].favoriteTheme,
        };
        try {
          localStorage.setItem('dear_lily_registered_users', JSON.stringify(existing));
        } catch {}
      }

      // Sync SQLite server database
      try {
        fetch(`${API_BASE_URL}/user/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            bio: user.bio,
            birthday: user.birthday,
            avatar: user.avatar,
            coverImage: user.coverImage,
            favoriteTheme: user.favoriteTheme,
          }),
        }).catch(() => {});
      } catch {}
    }
  },

  updateRegisteredUserProfile: (userId: string, fields: Partial<RegisteredUser>) => {
    const existing = StorageService.getRegisteredUsers();
    const cleanEmail = fields.email ? fields.email.trim().toLowerCase() : '';
    const cleanId = userId ? userId.trim().toLowerCase() : '';
    
    const idx = existing.findIndex(
      (u) =>
        (cleanId && u.id.trim().toLowerCase() === cleanId) ||
        (cleanEmail && u.email.trim().toLowerCase() === cleanEmail)
    );

    if (idx !== -1) {
      existing[idx] = {
        ...existing[idx],
        ...fields,
      };
      localStorage.setItem('dear_lily_registered_users', JSON.stringify(existing));
    }

    try {
      fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ...fields }),
      }).catch(() => {});
    } catch {}
  },

  clearUserSession: () => {
    localStorage.removeItem('dear_lily_user');
  },

  getRegisteredUsers: (): RegisteredUser[] => {
    const data = localStorage.getItem('dear_lily_registered_users');
    let users: RegisteredUser[] = [];
    if (data) {
      try {
        users = JSON.parse(data);
      } catch {
        users = [];
      }
    }

    let updated = [...users];
    let modified = false;
    for (const defUser of DEFAULT_REGISTERED_USERS) {
      if (!updated.some((u) => u.email.trim().toLowerCase() === defUser.email.toLowerCase())) {
        updated.push(defUser);
        modified = true;
      }
    }

    if (!data || modified) {
      localStorage.setItem('dear_lily_registered_users', JSON.stringify(updated));
    }
    return updated;
  },

  saveRegisteredUser: (regUser: RegisteredUser) => {
    const existing = StorageService.getRegisteredUsers();
    const cleanEmail = regUser.email.trim().toLowerCase();
    const updated = [...existing.filter((u) => u.email.trim().toLowerCase() !== cleanEmail), regUser];
    localStorage.setItem('dear_lily_registered_users', JSON.stringify(updated));
  },

  updateUserPasswordLocal: (email: string, newPass: string): boolean => {
    const existing = StorageService.getRegisteredUsers();
    const targetIndex = existing.findIndex((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (targetIndex === -1) return false;
    existing[targetIndex].password = newPass;
    localStorage.setItem('dear_lily_registered_users', JSON.stringify(existing));
    return true;
  },

  // PERMANENT REGISTER FUNCTION (SAVES TO LOCAL STORAGE IMMEDIATELY + SYNCS SERVER)
  registerUserAPI: async (name: string, username: string, email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanUsername = username.trim() || cleanEmail.split('@')[0];

    const localUsers = StorageService.getRegisteredUsers();
    if (localUsers.some((u) => u.email.trim().toLowerCase() === cleanEmail)) {
      return { success: false, error: 'This email is already registered. Please log in.' };
    }

    const isDefaultAdmin = cleanEmail === 'admin@dearlily.com' || cleanEmail === 'aarohii.n.2021@gmail.com';

    const regUserLocal: RegisteredUser = {
      id: 'user_' + Date.now(),
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: password,
      role: isDefaultAdmin ? 'admin' : 'user',
      isAdmin: isDefaultAdmin,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };

    // Save to device storage immediately so credentials persist permanently across website restarts
    StorageService.saveRegisteredUser(regUserLocal);

    const profile: UserProfile = {
      id: regUserLocal.id,
      name: regUserLocal.name,
      username: regUserLocal.username,
      email: regUserLocal.email,
      avatar: '',
      coverImage: '',
      bio: '',
      birthday: '',
      joinDate: regUserLocal.joinDate || '',
      favoriteTheme: 'Floral Journal',
      role: regUserLocal.role,
      isAdmin: regUserLocal.isAdmin,
      isAuth: true,
    };
    StorageService.saveUser(profile);

    // Sync with backend API in background if server is online
    try {
      fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, username: cleanUsername, email: cleanEmail, password, role: regUserLocal.role }),
      }).catch(() => {});
    } catch {}

    return { success: true, user: profile };
  },

  // PERMANENT LOGIN FUNCTION (CHECKS LOCAL STORAGE + SERVER API)
  loginUserAPI: async (email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Check Local Device Storage FIRST (auto-seeded with default admin accounts)
    const localUsers = StorageService.getRegisteredUsers();
    let account = localUsers.find((u) => u.email.trim().toLowerCase() === cleanEmail);

    // Fallback for default admin accounts if somehow not found
    if (!account && (cleanEmail === 'admin@dearlily.com' || cleanEmail === 'aarohii.n.2021@gmail.com') && (cleanPassword === 'admin' || password === 'admin')) {
      account = {
        id: 'user_admin_default',
        name: 'Lily Admin',
        username: 'admin',
        email: cleanEmail,
        password: cleanPassword,
        role: 'admin',
        isAdmin: true,
        joinDate: 'August 2026',
      };
      StorageService.saveRegisteredUser(account);
    }

    if (account) {
      if (account.password !== password && account.password !== cleanPassword) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      const profile: UserProfile = {
        id: account.id,
        name: account.name,
        username: account.username,
        email: account.email,
        avatar: account.avatar || '',
        coverImage: account.coverImage || '',
        bio: account.bio || '',
        birthday: account.birthday || '',
        joinDate: account.joinDate || '',
        favoriteTheme: account.favoriteTheme || 'Floral Journal',
        role: account.role || (cleanEmail === 'admin@dearlily.com' || cleanEmail === 'aarohii.n.2021@gmail.com' ? 'admin' : 'user'),
        isAdmin: account.isAdmin || account.role === 'admin' || cleanEmail === 'admin@dearlily.com' || cleanEmail === 'aarohii.n.2021@gmail.com',
        isAuth: true,
      };
      StorageService.saveUser(profile);

      // Sync backend in background
      try {
        fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        }).catch(() => {});
      } catch {}

      return { success: true, user: profile };
    }

    // 2. Fallback to Server API if user was registered on backend SQLite server
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'No account found with this email. Please register.' };
      }
      const regUserLocal: RegisteredUser = {
        id: data.user.id,
        name: data.user.name,
        username: data.user.username,
        email: data.user.email,
        password: cleanPassword,
        role: data.user.role || 'user',
        isAdmin: data.user.isAdmin,
        joinDate: data.user.joinDate,
      };
      StorageService.saveRegisteredUser(regUserLocal);
      StorageService.saveUser(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'No account found with this email. Please register.' };
    }
  },

  // VERIFY EMAIL FOR FORGOT PASSWORD
  verifyEmailAPI: async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    const localUsers = StorageService.getRegisteredUsers();
    const existsLocally = localUsers.some((u) => u.email.trim().toLowerCase() === cleanEmail);

    try {
      const res = await fetch(`${API_BASE_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (res.ok || existsLocally) {
        return { success: true };
      }
      return { success: false, error: 'No account found with this email.' };
    } catch {
      if (existsLocally) return { success: true };
      return { success: false, error: 'No account found with this email.' };
    }
  },

  // RESET PASSWORD
  resetPasswordAPI: async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    StorageService.updateUserPasswordLocal(cleanEmail, newPassword);

    try {
      await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, newPassword }),
      });
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  getAdminUsersAPI: async (): Promise<{ users: any[]; totalUsers: number }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.users)) return data;
      const localUsers = StorageService.getRegisteredUsers();
      return {
        users: localUsers.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          joinDate: u.joinDate || 'August 2026',
          createdAt: u.joinDate || 'August 2026',
          stripsCount: 0,
          diaryCount: 0,
        })),
        totalUsers: localUsers.length,
      };
    } catch {
      const localUsers = StorageService.getRegisteredUsers();
      return {
        users: localUsers.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          joinDate: u.joinDate || 'August 2026',
          createdAt: u.joinDate || 'August 2026',
          stripsCount: 0,
          diaryCount: 0,
        })),
        totalUsers: localUsers.length,
      };
    }
  },

  createAdminUserAPI: async (userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: data.error || 'Failed to create user.' };
    } catch {
      const localUsers = StorageService.getRegisteredUsers();
      const cleanEmail = userData.email.trim().toLowerCase();
      const existing = localUsers.find((u) => u.email.trim().toLowerCase() === cleanEmail);
      if (existing) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      const newUser: RegisteredUser = {
        id: 'user_' + Date.now(),
        name: userData.name,
        username: userData.username || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: userData.password,
        role: userData.role || 'user',
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
      localUsers.push(newUser);
      localStorage.setItem('dear_lily_registered_users', JSON.stringify(localUsers));
      return { success: true };
    }
  },

  updateAdminUserAPI: async (id: string, userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: data.error || 'Failed to update user.' };
    } catch {
      const localUsers = StorageService.getRegisteredUsers();
      const idx = localUsers.findIndex((u) => u.id === id || u.email.trim().toLowerCase() === userData.email?.trim().toLowerCase());
      if (idx !== -1) {
        localUsers[idx] = {
          ...localUsers[idx],
          name: userData.name || localUsers[idx].name,
          username: userData.username || localUsers[idx].username,
          email: userData.email || localUsers[idx].email,
          password: userData.password || localUsers[idx].password,
          role: userData.role || localUsers[idx].role,
        };
        localStorage.setItem('dear_lily_registered_users', JSON.stringify(localUsers));
      }
      return { success: true };
    }
  },

  deleteAdminUserAPI: async (id: string): Promise<{ success: boolean; error?: string }> => {
    const localUsers = StorageService.getRegisteredUsers();
    const filtered = localUsers.filter((u) => u.id !== id && u.email.trim().toLowerCase() !== id.trim().toLowerCase());
    localStorage.setItem('dear_lily_registered_users', JSON.stringify(filtered));

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: data.error || 'Failed to delete user.' };
    } catch {
      return { success: true };
    }
  },

  // PER-USER PHOTO STRIP DATA ISOLATION
  getPhotoStrips: (userId?: string): PhotoStrip[] => {
    let allStrips: PhotoStrip[] = [];
    if (inMemoryStripsCache.length > 0 || isDbInitialized) {
      allStrips = inMemoryStripsCache;
    } else {
      try {
        const data = localStorage.getItem('dear_lily_strips');
        allStrips = data ? JSON.parse(data) : [];
        if (allStrips.length > 0) inMemoryStripsCache = allStrips;
      } catch {
        allStrips = [];
      }
    }
    if (!userId) return allStrips;

    const loggedInUser = StorageService.getUser();
    const cleanId = userId.trim().toLowerCase();
    const cleanUserEmail = (loggedInUser.email || '').trim().toLowerCase();

    return allStrips.filter((s: PhotoStrip) => {
      if (!s.userId && !s.userEmail) return true;
      const sId = (s.userId || '').trim().toLowerCase();
      const sEmail = (s.userEmail || '').trim().toLowerCase();

      return (
        sId === cleanId ||
        (cleanUserEmail && sEmail === cleanUserEmail) ||
        sId === 'default_user' ||
        sId === ''
      );
    });
  },

  savePhotoStrips: (userStrips: PhotoStrip[], userId?: string) => {
    try {
      const loggedInUser = StorageService.getUser();
      const targetUserId = userId || loggedInUser.id || 'default_user';
      const targetUserEmail = (loggedInUser.email || '').trim().toLowerCase();

      const currentAll = inMemoryStripsCache.length > 0 ? inMemoryStripsCache : (() => {
        try {
          const data = localStorage.getItem('dear_lily_strips');
          return data ? JSON.parse(data) : [];
        } catch {
          return [];
        }
      })();

      const otherUsersStrips = currentAll.filter(
        (s: PhotoStrip) =>
          (s.userId || '') !== targetUserId &&
          (!targetUserEmail || (s.userEmail || '').trim().toLowerCase() !== targetUserEmail) &&
          (s.userId || '') !== ''
      );

      const updatedUserStrips = userStrips.map((s: PhotoStrip) => ({
        ...s,
        userId: targetUserId,
        userEmail: s.userEmail || targetUserEmail,
      }));

      // Deduplicate by ID
      const map = new Map<string, PhotoStrip>();
      for (const s of [...updatedUserStrips, ...otherUsersStrips]) {
        if (s && s.id) map.set(s.id, s);
      }
      const merged = Array.from(map.values());

      // Update in-memory cache immediately so UI gets all strips synchronously
      inMemoryStripsCache = merged;
      isDbInitialized = true;

      // Persist to IndexedDB (virtually unlimited quota in background)
      saveAllStripsToIndexedDB(merged).catch((e) => console.error('IndexedDB background sync error:', e));

      // Sync backend SQLite API in background
      for (const strip of updatedUserStrips) {
        try {
          fetch(`${API_BASE_URL}/photo-strips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(strip),
          }).catch(() => {});
        } catch {}
      }

      // Persist to LocalStorage with progressive quota trimming loop
      let saveSuccess = false;
      let limit = merged.length;
      while (limit >= 1 && !saveSuccess) {
        try {
          localStorage.setItem('dear_lily_strips', JSON.stringify(merged.slice(0, limit)));
          saveSuccess = true;
        } catch {
          limit = Math.floor(limit * 0.75);
        }
      }

      // Notify window listeners (e.g. GalleryView)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error('Error saving photo strips:', err);
    }
  },

  // PER-USER DIARY ENTRY DATA ISOLATION
  getDiaryEntries: (userId?: string): DiaryEntry[] => {
    const data = localStorage.getItem('dear_lily_diary');
    const allEntries: DiaryEntry[] = data ? JSON.parse(data) : [];
    if (!userId) return allEntries.filter((e) => !e.userId);
    return allEntries.filter((e) => e.userId === userId);
  },

  saveDiaryEntries: (userEntries: DiaryEntry[], userId?: string) => {
    const data = localStorage.getItem('dear_lily_diary');
    const allEntries: DiaryEntry[] = data ? JSON.parse(data) : [];
    const targetUserId = userId || '';
    const otherUsersEntries = allEntries.filter((e) => (e.userId || '') !== targetUserId);
    const updatedUserEntries = userEntries.map((e) => ({ ...e, userId: targetUserId }));
    const merged = [...updatedUserEntries, ...otherUsersEntries];
    localStorage.setItem('dear_lily_diary', JSON.stringify(merged));
  },

  // PER-USER ALBUMS DATA ISOLATION
  getAlbums: (userId?: string): Album[] => {
    try {
      const data = localStorage.getItem('dear_lily_albums');
      const allAlbums: Album[] = data ? JSON.parse(data) : [];
      if (!userId) return allAlbums;
      const cleanId = userId.trim().toLowerCase();
      return allAlbums.filter((a) => {
        const aId = (a.userId || '').trim().toLowerCase();
        return aId === cleanId || aId === '' || aId === 'default_user';
      });
    } catch {
      return [];
    }
  },

  saveAlbums: (userAlbums: Album[], userId?: string) => {
    const data = localStorage.getItem('dear_lily_albums');
    const allAlbums: Album[] = data ? JSON.parse(data) : [];
    const targetUserId = userId || '';
    const otherUsersAlbums = allAlbums.filter((a) => (a.userId || '') !== targetUserId);
    const updatedUserAlbums = userAlbums.map((a) => ({ ...a, userId: targetUserId }));
    const merged = [...updatedUserAlbums, ...otherUsersAlbums];
    localStorage.setItem('dear_lily_albums', JSON.stringify(merged));
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem('dear_lily_settings');
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem('dear_lily_settings', JSON.stringify(settings));
  }
};
