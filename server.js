import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const SQLITE_FILE = path.join(DATA_DIR, 'database.sqlite');
const OLD_JSON_DB = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password Hashing & Verification Utilities using node:crypto (scrypt)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword) return false;
  // Compatibility fallback for legacy unhashed/plaintext passwords
  if (!storedPassword.includes(':')) {
    return password === storedPassword;
  }
  const [salt, key] = storedPassword.split(':');
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// Initialize SQLite Database
const db = new Database(SQLITE_FILE);
db.pragma('journal_mode = WAL');

// Initialize SQL Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    avatar TEXT DEFAULT '',
    coverImage TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    birthday TEXT DEFAULT '',
    favoriteTheme TEXT DEFAULT 'Floral Journal',
    joinDate TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS photo_strips (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    userEmail TEXT DEFAULT '',
    title TEXT,
    layout TEXT,
    photos TEXT,
    filter TEXT,
    frame TEXT,
    paperBg TEXT,
    stickers TEXT DEFAULT '[]',
    textOverlays TEXT DEFAULT '[]',
    isFavorite INTEGER DEFAULT 0,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS diary_entries (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    userEmail TEXT DEFAULT '',
    title TEXT,
    content TEXT,
    date TEXT,
    mood TEXT,
    weather TEXT,
    theme TEXT,
    paperStyle TEXT,
    createdAt TEXT
  );
`);

try { db.exec("ALTER TABLE users ADD COLUMN favoriteTheme TEXT DEFAULT 'Floral Journal'"); } catch {}
try { db.exec("ALTER TABLE photo_strips ADD COLUMN userEmail TEXT DEFAULT ''"); } catch {}
try { db.exec("ALTER TABLE photo_strips ADD COLUMN stickers TEXT DEFAULT '[]'"); } catch {}
try { db.exec("ALTER TABLE photo_strips ADD COLUMN textOverlays TEXT DEFAULT '[]'"); } catch {}
try { db.exec("ALTER TABLE photo_strips ADD COLUMN isFavorite INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE diary_entries ADD COLUMN userEmail TEXT DEFAULT ''"); } catch {}

// Seed / Migrate accounts into SQLite
const insertUserStmt = db.prepare(`
  INSERT OR IGNORE INTO users (id, name, username, email, password, role, avatar, coverImage, bio, birthday, joinDate, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Helper to sync SQLite users to db.json for human readable inspection
function syncDbJson() {
  try {
    const allUsers = db.prepare('SELECT id, name, username, email, password, role, avatar, coverImage, bio, birthday, joinDate, createdAt FROM users').all();
    const jsonContent = {
      users: allUsers,
      photoStrips: [],
      diaryEntries: []
    };
    fs.writeFileSync(OLD_JSON_DB, JSON.stringify(jsonContent, null, 2), 'utf8');
  } catch (err) {
    console.error('Error syncing db.json:', err);
  }
}

// Migrate old JSON DB accounts if present
if (fs.existsSync(OLD_JSON_DB)) {
  try {
    const oldData = JSON.parse(fs.readFileSync(OLD_JSON_DB, 'utf8'));
    if (oldData.users && Array.isArray(oldData.users)) {
      for (const u of oldData.users) {
        if (!u.email) continue;
        const cleanEmail = u.email.trim().toLowerCase();
        const existing = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);
        if (!existing) {
          const role = (cleanEmail.includes('admin') || cleanEmail === 'aarohii.n.2021@gmail.com' || cleanEmail === 'admin@dearlily.com') ? 'admin' : 'user';
          const storedPass = u.password ? (u.password.includes(':') ? u.password : hashPassword(u.password)) : hashPassword('password123');
          insertUserStmt.run(
            u.id || ('user_' + Date.now()),
            u.name || 'User',
            u.username || cleanEmail.split('@')[0],
            cleanEmail,
            storedPass,
            role,
            u.avatar || '',
            u.coverImage || '',
            u.bio || '',
            u.birthday || '',
            u.joinDate || 'August 2026',
            u.createdAt || new Date().toISOString()
          );
        }
      }
    }
  } catch (err) {
    console.error('Error migrating old JSON data:', err);
  }
}

// Ensure default admin accounts exist ONLY IF database is empty
const totalUsersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (totalUsersCount === 0) {
  const adminAccounts = [
    { email: 'admin@dearlily.com', name: 'Admin', username: 'admin', pass: 'admin', role: 'admin' },
    { email: 'admin@dailylily.com', name: 'Admin', username: 'admin', pass: 'admin', role: 'admin' },
    { email: 'aarohii.n.2021@gmail.com', name: 'nishita', username: 'nishiii', pass: 'nishita', role: 'admin' }
  ];

  for (const adm of adminAccounts) {
    const cleanEmail = adm.email.toLowerCase();
    const existingAdm = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    if (!existingAdm) {
      insertUserStmt.run(
        'user_admin_' + Date.now() + Math.floor(Math.random() * 1000),
        adm.name,
        adm.username,
        cleanEmail,
        hashPassword(adm.pass),
        adm.role,
        '',
        '',
        'Dear Lily Administrator',
        '',
        'August 2026',
        new Date().toISOString()
      );
    }
  }
}

// Sync db.json on startup
syncDbJson();

// ==================== ROOT & HEALTH CHECK ENDPOINT ====================
app.get(['/', '/api'], (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  res.json({
    status: 'online',
    message: '🌸 Dear Lily SQLite API Server is active & healthy!',
    database: 'SQLite 3 (data/database.sqlite)',
    totalRegisteredUsers: totalUsers,
    availableEndpoints: {
      healthCheck: 'GET /api',
      adminUsersDirectory: 'GET /api/admin/users',
      userRegistration: 'POST /api/register',
      userLogin: 'POST /api/login',
      verifyEmail: 'POST /api/verify-email',
      resetPassword: 'POST /api/reset-password'
    }
  });
});

// ==================== SQL ENDPOINTS ====================

// 1. REGISTER NEW USER (SQL INSERT WITH HASHED PASSWORD + SYNC DB.JSON)
app.post('/api/register', (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

  if (existing) {
    return res.status(400).json({ error: 'This email is already registered. Please log in.' });
  }

  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const isAdminAccount = cleanEmail.includes('admin') || cleanEmail === 'aarohii.n.2021@gmail.com' || cleanEmail === 'admin@dearlily.com';
  const hashedPassword = hashPassword(password);

  const newUser = {
    id: 'user_' + Date.now(),
    name: name.trim(),
    username: username ? username.trim() : cleanEmail.split('@')[0],
    email: cleanEmail,
    password: hashedPassword,
    role: isAdminAccount ? 'admin' : 'user',
    avatar: '',
    coverImage: '',
    bio: '',
    birthday: '',
    joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    createdAt: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO users (id, name, username, email, password, role, avatar, coverImage, bio, birthday, joinDate, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newUser.id,
    newUser.name,
    newUser.username,
    newUser.email,
    newUser.password,
    newUser.role,
    newUser.avatar,
    newUser.coverImage,
    newUser.bio,
    newUser.birthday,
    newUser.joinDate,
    newUser.createdAt
  );

  syncDbJson();

  const { password: _, ...userProfile } = newUser;
  return res.json({ message: 'Account registered successfully', user: { ...userProfile, isAdmin: isAdminAccount, isAuth: true } });
});

// 2. LOGIN USER (SQL SELECT WITH SECURE HASH VERIFICATION & AUTO-UPGRADE)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let account = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

  if (!account) {
    return res.status(404).json({ error: 'No account found with this email. Please register first.' });
  }

  const isPasswordValid = verifyPassword(password, account.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }

  // Transparent migration: if user had legacy plaintext password, upgrade to secure hash now
  if (!account.password.includes(':')) {
    const newHash = hashPassword(password);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, account.id);
  }

  const isAdminAccount = account.role === 'admin' || cleanEmail.includes('admin') || cleanEmail === 'aarohii.n.2021@gmail.com' || cleanEmail === 'admin@dearlily.com';
  const { password: _, ...userProfile } = account;

  return res.json({
    message: 'Login successful',
    user: { ...userProfile, isAdmin: isAdminAccount, isAuth: true }
  });
});

// 3. VERIFY EMAIL (SQL SELECT)
app.post('/api/verify-email', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const account = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

  if (!account) {
    return res.status(404).json({ error: 'No account found with this email.' });
  }

  return res.json({ message: 'Account verified successfully.', exists: true });
});

// 4. RESET PASSWORD (SQL UPDATE WITH SECURE PASSWORD HASH)
app.post('/api/reset-password', (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const hashedPassword = hashPassword(newPassword);
  const result = db.prepare('UPDATE users SET password = ? WHERE LOWER(email) = ?').run(hashedPassword, cleanEmail);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'No account found with this email.' });
  }

  syncDbJson();
  return res.json({ message: 'Password updated successfully in database.' });
});

// 5. GET ALL REGISTERED USERS FOR ADMIN VIEWER (SQL SELECT)
app.get('/api/admin/users', (req, res) => {
  const users = db.prepare('SELECT id, name, username, email, role, joinDate, createdAt FROM users').all();
  return res.json({ users, totalUsers: users.length, dbType: 'SQLite Relational Database (database.sqlite)' });
});

// ==================== ADMIN CRUD ENDPOINTS ====================

// 6. ADMIN CREATE USER
app.post('/api/admin/users', (req, res) => {
  const { name, username, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }
  const newUser = {
    id: 'user_' + Date.now(),
    name: name.trim(),
    username: username ? username.trim() : cleanEmail.split('@')[0],
    email: cleanEmail,
    password: hashPassword(password),
    role: role || 'user',
    avatar: '',
    coverImage: '',
    bio: '',
    birthday: '',
    joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    createdAt: new Date().toISOString()
  };
  db.prepare(`
    INSERT INTO users (id, name, username, email, password, role, avatar, coverImage, bio, birthday, joinDate, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newUser.id, newUser.name, newUser.username, newUser.email, newUser.password, newUser.role,
    newUser.avatar, newUser.coverImage, newUser.bio, newUser.birthday, newUser.joinDate, newUser.createdAt
  );
  syncDbJson();
  return res.json({ message: 'User created successfully', user: newUser });
});

// 7. ADMIN UPDATE USER
app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, username, email, password, role } = req.body;

  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'User not found in database.' });
  }

  const updatedName = name !== undefined ? name.trim() : existing.name;
  const updatedUsername = username !== undefined ? username.trim() : existing.username;
  const updatedEmail = email !== undefined ? email.trim().toLowerCase() : existing.email;
  const updatedRole = role !== undefined ? role : existing.role;
  const updatedPassword = password && password.trim() ? hashPassword(password) : existing.password;

  db.prepare(`
    UPDATE users SET name = ?, username = ?, email = ?, password = ?, role = ? WHERE id = ?
  `).run(updatedName, updatedUsername, updatedEmail, updatedPassword, updatedRole, id);

  syncDbJson();
  return res.json({ message: 'User updated successfully in SQLite database.' });
});

// 8. ADMIN DELETE USER (ENFORCE AT LEAST 1 ADMIN RULE)
app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;

  const targetUser = db.prepare('SELECT * FROM users WHERE id = ? OR LOWER(email) = ?').get(id, id.toLowerCase());
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found or already deleted.' });
  }

  if (targetUser.role === 'admin') {
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get().count;
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last remaining Admin account! The system must maintain at least one administrator.' });
    }
  }

  db.prepare('DELETE FROM users WHERE id = ? OR LOWER(email) = ?').run(targetUser.id, targetUser.email);
  syncDbJson();
  return res.json({ message: 'User deleted successfully from SQLite database.' });
});

// ==================== USER PROFILE UPDATE ENDPOINT ====================
app.put('/api/user/profile', (req, res) => {
  const { id, email, name, username, bio, birthday, avatar, coverImage, favoriteTheme } = req.body;

  if (!id && !email) {
    return res.status(400).json({ error: 'User ID or Email required.' });
  }

  const userEmail = email ? email.trim().toLowerCase() : '';
  const existing = db.prepare('SELECT * FROM users WHERE id = ? OR LOWER(email) = ?').get(id || '', userEmail);

  if (!existing) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  db.prepare(`
    UPDATE users
    SET name = COALESCE(?, name),
        username = COALESCE(?, username),
        bio = COALESCE(?, bio),
        birthday = COALESCE(?, birthday),
        avatar = COALESCE(?, avatar),
        coverImage = COALESCE(?, coverImage),
        favoriteTheme = COALESCE(?, favoriteTheme)
    WHERE id = ? OR LOWER(email) = ?
  `).run(
    name || null,
    username || null,
    bio !== undefined ? bio : null,
    birthday !== undefined ? birthday : null,
    avatar !== undefined ? avatar : null,
    coverImage !== undefined ? coverImage : null,
    favoriteTheme !== undefined ? favoriteTheme : null,
    existing.id,
    existing.email
  );

  syncDbJson();
  const updatedUser = db.prepare('SELECT id, name, username, email, role, avatar, coverImage, bio, birthday, favoriteTheme, joinDate, createdAt FROM users WHERE id = ?').get(existing.id);
  return res.json({ message: 'Profile updated in database', user: updatedUser });
});

// ==================== PHOTO STRIPS SQL ENDPOINTS ====================
app.get('/api/photo-strips/:userId', (req, res) => {
  const { userId } = req.params;
  const emailQuery = (req.query.email || '').toString().trim().toLowerCase();

  const rows = db.prepare('SELECT * FROM photo_strips WHERE userId = ? OR LOWER(userEmail) = ? OR userId = "default_user"').all(userId, emailQuery);
  const strips = rows.map((r) => ({
    ...r,
    photos: r.photos ? JSON.parse(r.photos) : [],
    stickers: r.stickers ? JSON.parse(r.stickers) : [],
    textOverlays: r.textOverlays ? JSON.parse(r.textOverlays) : [],
    isFavorite: Boolean(r.isFavorite),
  }));

  return res.json({ strips });
});

app.post('/api/photo-strips', (req, res) => {
  const { id, userId, userEmail, title, layout, photos, filter, frame, paperBg, stickers, textOverlays, isFavorite, createdAt } = req.body;

  if (!id || !photos) {
    return res.status(400).json({ error: 'Strip ID and photos array required.' });
  }

  const existing = db.prepare('SELECT * FROM photo_strips WHERE id = ?').get(id);
  const photosJson = JSON.stringify(photos || []);
  const stickersJson = JSON.stringify(stickers || []);
  const textOverlaysJson = JSON.stringify(textOverlays || []);
  const favVal = isFavorite ? 1 : 0;
  const dateStr = createdAt || new Date().toISOString().split('T')[0];

  if (existing) {
    db.prepare(`
      UPDATE photo_strips
      SET title = ?, layout = ?, photos = ?, filter = ?, frame = ?, paperBg = ?, stickers = ?, textOverlays = ?, isFavorite = ?, userEmail = ?
      WHERE id = ?
    `).run(title, layout, photosJson, filter, frame, paperBg, stickersJson, textOverlaysJson, favVal, userEmail || '', id);
  } else {
    db.prepare(`
      INSERT INTO photo_strips (id, userId, userEmail, title, layout, photos, filter, frame, paperBg, stickers, textOverlays, isFavorite, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId || 'default_user', userEmail || '', title, layout, photosJson, filter, frame, paperBg, stickersJson, textOverlaysJson, favVal, dateStr);
  }

  return res.json({ message: 'Photo strip saved to database.', id });
});

app.delete('/api/photo-strips/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM photo_strips WHERE id = ?').run(id);
  return res.json({ message: 'Photo strip deleted.' });
});

// Serve production build static files from dist directory if available
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🌸 Dear Lily SQLite API Server running on port ${PORT}`);
  console.log(`🗄️ SQLite Database File: ${SQLITE_FILE}`);
});
