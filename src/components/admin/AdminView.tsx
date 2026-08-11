import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Users, Database, RefreshCw, Mail, Calendar, HardDrive, Sparkles, UserPlus, Edit3, Trash2, X } from 'lucide-react';
import { StorageService } from '../../services/storage';

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals & Toast State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    const data = await StorageService.getAdminUsersAPI();
    setUsers(data.users || []);
    setTotalUsers(data.totalUsers || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const resetForm = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('user');
    setEditingUser(null);
  };

  // CREATE USER HANDLER
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Name, Email, and Password are required! ⚠️');
      return;
    }
    const res = await StorageService.createAdminUserAPI({ name, username, email, password, role });
    if (res.success) {
      showToast('User created successfully in database! ✨');
      setIsCreateOpen(false);
      resetForm();
      fetchAdminData();
    } else {
      showToast(res.error || 'Failed to create user.');
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (user: any) => {
    setEditingUser(user);
    setName(user.name || '');
    setUsername(user.username || '');
    setEmail(user.email || '');
    setPassword('');
    setRole(user.role === 'admin' ? 'admin' : 'user');
  };

  // UPDATE USER HANDLER
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const res = await StorageService.updateAdminUserAPI(editingUser.id, { name, username, email, password, role });
    if (res.success) {
      showToast('User record updated in database! ✏️');
      setEditingUser(null);
      resetForm();
      fetchAdminData();
    } else {
      showToast(res.error || 'Failed to update user.');
    }
  };

  // DELETE USER HANDLER (ENFORCE AT LEAST 1 ADMIN RULE)
  const handleDeleteUser = async (user: any) => {
    if (user.role === 'admin') {
      const adminUsers = users.filter((u) => u.role === 'admin' || u.email.includes('admin') || u.email === 'aarohii.n.2021@gmail.com');
      if (adminUsers.length <= 1) {
        showToast('Cannot delete the last remaining Admin! The system must maintain at least 1 administrator. 🛡️');
        return;
      }
    }

    if (window.confirm(`Are you sure you want to delete user "${user.name}" (${user.email}) from SQLite database?`)) {
      const res = await StorageService.deleteAdminUserAPI(user.id);
      if (res.success) {
        showToast('User deleted from database! 🗑️');
        fetchAdminData();
      } else {
        showToast(res.error || 'Failed to delete user.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-purple-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-purple-400"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* Admin Title Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>SQLite Relational Database Portal & CRUD Manager</span>
        </div>
        <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-purple-950">
          Dear Lily SQLite Server & User Database 🛡️
        </h1>
        <p className="text-xs sm:text-sm text-purple-700/80 mt-1 font-medium max-w-xl mx-auto">
          Perform full CRUD operations (Create, Edit, Update, Delete) directly on your SQLite database (`data/database.sqlite`).
        </p>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-3xl bg-white/90 border-2 border-purple-100 shadow-xl paper-lined flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl shadow-inner">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="font-['Caveat',cursive] text-4xl font-bold text-purple-900">{totalUsers}</div>
            <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">Registered Accounts</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/90 border-2 border-purple-100 shadow-xl paper-lined flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <div className="font-['Caveat',cursive] text-3xl font-bold text-emerald-900">SQLite 3</div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">SQL Relational DB Engine</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/90 border-2 border-purple-100 shadow-xl paper-lined flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow-inner">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <div className="font-bold text-xs text-amber-900 truncate max-w-[160px]">database.sqlite</div>
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">data/database.sqlite</div>
          </div>
        </div>
      </div>

      {/* Database Viewer Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-4 border-purple-100 shadow-2xl paper-lined">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-purple-100">
          <div>
            <h3 className="font-['Caveat',cursive] text-3xl font-bold text-purple-900 flex items-center gap-2">
              <span>SQL Registered Users Directory (`users` table)</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h3>
            <p className="text-xs text-purple-700 font-medium">Real-time SQL records from `data/database.sqlite`</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
              className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add New User</span>
            </button>

            <button
              type="button"
              onClick={fetchAdminData}
              className="px-4 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh DB</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-purple-100 text-xs font-bold text-purple-900 uppercase tracking-wider bg-purple-50/50">
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Registered Email</th>
                <th className="py-3 px-4">Join Date</th>
                <th className="py-3 px-4 text-center">SQL Role</th>
                <th className="py-3 px-4 text-center">CRUD Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/60 text-xs">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-purple-400 font-medium">
                    No registered user accounts in SQLite database yet.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <motion.tr
                    key={u.id}
                    whileHover={{ backgroundColor: 'rgba(243, 232, 255, 0.4)' }}
                    className="transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-purple-950 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs shadow-xs">
                        {u.name ? u.name.charAt(0).toUpperCase() : '🌸'}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-purple-700">@{u.username}</td>
                    <td className="py-3.5 px-4 font-medium text-purple-900">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-purple-400" />
                        {u.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-purple-700 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        {u.joinDate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}>
                        {u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            openEditModal(u);
                          }}
                          className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteUser(u);
                          }}
                          className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-purple-100 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-purple-100 mb-4">
                <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-500" />
                  <span>Add New Account to Database</span>
                </h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-purple-400 hover:text-purple-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lily Miller"
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. lily2026"
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">Account SQL Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="user">👤 Normal User</option>
                    <option value="admin">🛡️ Administrator</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT USER MODAL */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-purple-100 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-purple-100 mb-4">
                <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-500" />
                  <span>Edit Account ({editingUser.email})</span>
                </h3>
                <button onClick={() => setEditingUser(null)} className="text-purple-400 hover:text-purple-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep existing password"
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">Account SQL Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="user">👤 Normal User</option>
                    <option value="admin">🛡️ Administrator</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
