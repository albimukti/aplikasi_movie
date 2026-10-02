import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  ShieldCheck, Users, Film, HardDrive, Megaphone, HeartHandshake, 
  Settings, Activity, Plus, Search, Trash2, Edit3, CheckCircle2, 
  XCircle, RefreshCw, AlertTriangle, Eye, Sparkles, Server, Lock
} from 'lucide-react';

export const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, ads, qris, audit, settings
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', role: 'ADMIN' });

  // Ads State
  const [campaigns, setCampaigns] = useState([]);
  const [adStats, setAdStats] = useState(null);
  const [showCreateAdModal, setShowCreateAdModal] = useState(false);
  const [newAdData, setNewAdData] = useState({
    name: '', priority: 10, frequency_rule: 1, duration_seconds: 15,
    skip_after_seconds: 5, title: '', media_url: '', target_url: '',
  });

  // QRIS State
  const [qrisList, setQrisList] = useState([]);
  const [showCreateQRISModal, setShowCreateQRISModal] = useState(false);
  const [newQRISData, setNewQRISData] = useState({ title: '', description: '', qris_url: '', is_active: true });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);

  // Configs
  const [configs, setConfigs] = useState([]);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes, adsRes, adStatsRes, qrisRes, auditRes, cfgRes] = await Promise.all([
        api.getSuperAdminDashboard().catch(() => null),
        api.getUsers({ limit: 50 }).catch(() => null),
        api.getAdCampaigns().catch(() => null),
        api.getAdStats().catch(() => null),
        api.getAllQRIS().catch(() => null),
        api.getAuditLogs(1).catch(() => null),
        api.getConfigs().catch(() => null),
      ]);

      if (dashRes?.data) setDashboardData(dashRes.data);
      if (usersRes?.data) setUsers(usersRes.data);
      if (adsRes?.data) setCampaigns(adsRes.data);
      if (adStatsRes?.data) setAdStats(adStatsRes.data);
      if (qrisRes?.data) setQrisList(qrisRes.data);
      if (auditRes?.data) setAuditLogs(auditRes.data);
      if (cfgRes?.data) setConfigs(cfgRes.data);
    } catch (err) {
      console.error("SuperAdmin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for User
  const handleUpdateUser = async (id, role, status) => {
    await api.updateUser(id, { role, status });
    loadData();
  };

  const handleDeleteUser = async (id) => {
    if (confirm("Hapus pengguna ini secara permanen?")) {
      await api.deleteUser(id);
      loadData();
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    await api.createUser(newUserData);
    setShowCreateUserModal(false);
    setNewUserData({ name: '', email: '', password: '', role: 'ADMIN' });
    loadData();
  };

  // Handlers for Ads
  const handleToggleCampaign = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await api.updateAdCampaignStatus(id, nextStatus);
    loadData();
  };

  const handleDeleteCampaign = async (id) => {
    if (confirm("Hapus campaign iklan ini?")) {
      await api.deleteAdCampaign(id);
      loadData();
    }
  };

  const handleCreateAd = async (e) => {
    e.preventDefault();
    await api.createAdCampaign(newAdData);
    setShowCreateAdModal(false);
    setNewAdData({
      name: '', priority: 10, frequency_rule: 1, duration_seconds: 15,
      skip_after_seconds: 5, title: '', media_url: '', target_url: '',
    });
    loadData();
  };

  // Handlers for QRIS
  const handleActivateQRIS = async (id) => {
    await api.activateQRIS(id);
    loadData();
  };

  const handleDeleteQRIS = async (id) => {
    if (confirm("Hapus QRIS ini?")) {
      await api.deleteQRIS(id);
      loadData();
    }
  };

  const handleCreateQRIS = async (e) => {
    e.preventDefault();
    await api.createQRIS(newQRISData);
    setShowCreateQRISModal(false);
    setNewQRISData({ title: '', description: '', qris_url: '', is_active: true });
    loadData();
  };

  // Config Update
  const handleUpdateConfig = async (key, val) => {
    await api.updateConfig(key, val);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-16 animate-in fade-in duration-300">
      
      {/* Header Banner - Distinct Super Admin Crimson Aesthetics */}
      <div className="relative rounded-3xl p-4 sm:p-8 overflow-hidden bg-gradient-to-r from-cinema-900 via-cinema-850 to-cinema-red-deep/40 border-2 border-cinema-red/40 shadow-3d-red">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
          <ShieldCheck className="w-64 h-64 text-cinema-red" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cinema-red/20 border border-cinema-red/50 text-cinema-red-light text-[10px] sm:text-xs font-black tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cinema-red-light animate-pulse" />
              SUPER ADMIN CONSOLE • FULL CONTROL
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-wide">
              Pusat Kendali Utama <span className="text-cinema-red text-glow-red">MovieHub</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Hak akses tertinggi: kelola seluruh akun pengguna, peran otorisasi, monetisasi iklan pre-roll, kanal QRIS komunitas, serta audit trail keamanan menyeluruh.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-cinema-850 hover:bg-cinema-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-cinema-border/60 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
        {[
          { id: 'overview', label: 'Ringkasan Sistem', icon: Activity },
          { id: 'users', label: 'Manajemen Akun & Role', icon: Users },
          { id: 'ads', label: 'Iklan & Monetisasi', icon: Megaphone },
          { id: 'qris', label: 'Donasi & QRIS', icon: HeartHandshake },
          { id: 'audit', label: 'Audit Trail Keamanan', icon: Lock },
          { id: 'settings', label: 'Pengaturan Platform', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-cinema-red text-white shadow-3d-red'
                  : 'bg-cinema-850 text-zinc-400 hover:text-white hover:bg-cinema-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Key Metric 3D Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel p-5 rounded-2xl border border-cinema-red/20 shadow-3d-card space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Pengguna</span>
                <Users className="w-5 h-5 text-cinema-red" />
              </div>
              <div className="font-heading font-black text-3xl text-white">
                {dashboardData?.total_users || 0}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="text-emerald-400 font-bold">{dashboardData?.viewers_count || 0} Viewers</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{dashboardData?.admins_count || 0} Admins</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-cinema-red/20 shadow-3d-card space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Katalog Movie</span>
                <Film className="w-5 h-5 text-cinema-gold" />
              </div>
              <div className="font-heading font-black text-3xl text-white">
                {dashboardData?.total_movies || 0}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="text-emerald-400 font-bold">{dashboardData?.published_movies || 0} Published</span>
                <span>•</span>
                <span className="text-blue-400 font-bold">{dashboardData?.ready_movies || 0} Ready</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-cinema-red/20 shadow-3d-card space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Estimasi Storage Media</span>
                <HardDrive className="w-5 h-5 text-blue-400" />
              </div>
              <div className="font-heading font-black text-3xl text-white">
                {((dashboardData?.estimated_storage_mb || 0) / 1024).toFixed(1)} <span className="text-sm font-semibold text-zinc-400">GB</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Multi-quality assets (4K, 1080p, 720p)
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-cinema-red/20 shadow-3d-card space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Monetisasi Iklan</span>
                <Megaphone className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="font-heading font-black text-3xl text-white">
                {dashboardData?.active_campaigns || 0} <span className="text-sm font-semibold text-zinc-400">Campaigns</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-bold">
                {adStats?.impressions || 0} Total Tayangan Pre-roll
              </div>
            </div>

          </div>

          {/* System Health Status */}
          <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-cinema-red" />
              Status Kesehatan Arsitektur Sistem
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(dashboardData?.system_health || {}).map(([key, val]) => (
                <div key={key} className="p-4 rounded-xl bg-cinema-850/60 border border-zinc-800 space-y-1">
                  <div className="text-xs text-zinc-400 capitalize font-medium">{key.replace('_', ' ')}</div>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Security & Audit Events Preview */}
          <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cinema-red" />
                Aktivitas Audit Keamanan Terkini
              </h3>
              <button
                onClick={() => setActiveTab('audit')}
                className="text-xs text-cinema-red hover:underline font-semibold"
              >
                Lihat Semua Log
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cinema-850 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Pelaku / Aktor</th>
                    <th className="p-3">Peran</th>
                    <th className="p-3">Aksi</th>
                    <th className="p-3">Target Entitas</th>
                    <th className="p-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {dashboardData?.recent_audit_logs?.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-cinema-850/40">
                      <td className="p-3 text-zinc-400">{new Date(log.created_at).toLocaleTimeString('id-ID')}</td>
                      <td className="p-3 font-semibold text-white">{log.actor_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.actor_role === 'SUPERADMIN' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {log.actor_role}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-cinema-red-light">{log.action}</td>
                      <td className="p-3 text-zinc-300">{log.resource}</td>
                      <td className="p-3 font-mono text-zinc-500">{log.ip_address || '127.0.0.1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 2: USER MANAGEMENT ================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl text-white">
                Manajemen Akun & Otorisasi Role
              </h2>
              <p className="text-xs text-zinc-400">
                Kelola hak akses pengguna, angkat Content Admin, atau tangguhkan (suspend) akun yang melanggar ketentuan.
              </p>
            </div>

            <button
              onClick={() => setShowCreateUserModal(true)}
              className="px-4 py-2.5 rounded-xl red-gradient-btn text-white text-xs font-bold flex items-center gap-2 shadow-3d-red cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Baru</span>
            </button>
          </div>

          {/* User Table */}
          <div className="glass-panel rounded-3xl border border-zinc-800 overflow-hidden shadow-3d-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-cinema-850 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800 text-[11px]">
                  <tr>
                    <th className="p-4">Pengguna</th>
                    <th className="p-4">Role Akses</th>
                    <th className="p-4">Status Akun</th>
                    <th className="p-4">Login Terakhir</th>
                    <th className="p-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-cinema-850/40">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                        />
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-xs text-zinc-400">{u.email}</div>
                        </div>
                      </td>

                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUser(u.id, e.target.value, u.status)}
                          className="bg-cinema-850 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-cinema-red"
                        >
                          <option value="VIEWER">VIEWER (Penonton)</option>
                          <option value="ADMIN">ADMIN (Studio Konten)</option>
                          <option value="SUPERADMIN">SUPERADMIN (Master)</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                          u.status === 'ACTIVE' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}>
                          {u.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {u.status}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-zinc-400">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleString('id-ID') : 'Belum pernah'}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleUpdateUser(u.id, u.role, u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            u.status === 'ACTIVE' 
                              ? 'bg-rose-950/40 hover:bg-rose-900 border-rose-500/50 text-rose-300' 
                              : 'bg-emerald-950/40 hover:bg-emerald-900 border-emerald-500/50 text-emerald-300'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors cursor-pointer"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ADVERTISEMENTS ================= */}
      {activeTab === 'ads' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl text-white">
                Manajemen Iklan Pre-Roll
              </h2>
              <p className="text-xs text-zinc-400">
                Atur campaign iklan sebelum pemutaran film, tautan promosi, dan durasi hitung mundur lewati iklan.
              </p>
            </div>

            <button
              onClick={() => setShowCreateAdModal(true)}
              className="px-4 py-2.5 rounded-xl red-gradient-btn text-white text-xs font-bold flex items-center gap-2 shadow-3d-red cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Campaign Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((camp) => (
              <div key={camp.id} className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      camp.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {camp.status}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-white mt-1">
                      {camp.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleCampaign(camp.id, camp.status)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-cinema-850 hover:bg-cinema-800 border border-zinc-700 text-zinc-200"
                    >
                      {camp.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(camp.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-zinc-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {camp.creatives?.map((cr) => (
                  <div key={cr.id} className="p-3.5 rounded-xl bg-cinema-850/60 border border-zinc-800 space-y-2 text-xs">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Megaphone className="w-3.5 h-3.5 text-cinema-red" />
                      <span>{cr.title}</span>
                    </div>
                    <div className="text-zinc-400 truncate">
                      Video: <span className="font-mono text-zinc-300">{cr.media_url}</span>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
                      <span>Durasi: <strong className="text-white">{cr.duration_seconds}s</strong></span>
                      <span>Skip timer: <strong className="text-cinema-red">{cr.skip_after_seconds}s</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: QRIS SUPPORT ================= */}
      {activeTab === 'qris' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl text-white">
                Kanal QRIS Donasi Komunitas
              </h2>
              <p className="text-xs text-zinc-400">
                Pilih atau unggah barcode QRIS aktif yang akan ditampilkan pada halaman dukungan Viewer.
              </p>
            </div>

            <button
              onClick={() => setShowCreateQRISModal(true)}
              className="px-4 py-2.5 rounded-xl red-gradient-btn text-white text-xs font-bold flex items-center gap-2 shadow-3d-red cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah QRIS Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrisList.map((q) => (
              <div 
                key={q.id} 
                className={`glass-panel p-6 rounded-3xl border transition-all space-y-4 ${
                  q.is_active ? 'border-emerald-500/60 shadow-3d-red' : 'border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    q.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {q.is_active ? 'QRIS AKTIF' : 'Arsip'}
                  </span>

                  {!q.is_active && (
                    <button
                      onClick={() => handleActivateQRIS(q.id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300"
                    >
                      Aktifkan
                    </button>
                  )}
                </div>

                <div className="w-48 h-48 mx-auto p-2 rounded-xl bg-white flex items-center justify-center shadow-lg">
                  <img src={q.qris_url} alt={q.title} className="w-full h-full object-contain" />
                </div>

                <div className="space-y-1 text-center">
                  <h4 className="font-heading font-bold text-white text-base">{q.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">{q.description}</p>
                </div>

                {!q.is_active && (
                  <button
                    onClick={() => handleDeleteQRIS(q.id)}
                    className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-rose-950/60 border border-zinc-700 text-rose-300 text-xs font-semibold"
                  >
                    Hapus QRIS Ini
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: AUDIT LOGS ================= */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4 animate-in fade-in duration-200">
          <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-cinema-red" />
            Audit Trail Keamanan & Operasional (Full Access)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cinema-850 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5">Aktor</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Aksi</th>
                  <th className="p-3.5">Resource</th>
                  <th className="p-3.5">Target ID</th>
                  <th className="p-3.5">Metadata</th>
                  <th className="p-3.5">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-cinema-850/40 font-sans">
                    <td className="p-3.5 text-zinc-400 font-mono text-[11px]">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                    <td className="p-3.5 font-bold text-white">{log.actor_name}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cinema-800 text-zinc-200">
                        {log.actor_role}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-cinema-red-light font-mono">{log.action}</td>
                    <td className="p-3.5 text-zinc-300 font-semibold">{log.resource}</td>
                    <td className="p-3.5 font-mono text-zinc-400 text-[11px] truncate max-w-[120px]">{log.resource_id || '-'}</td>
                    <td className="p-3.5 text-zinc-400 text-[11px] truncate max-w-[180px]">{log.metadata}</td>
                    <td className="p-3.5 text-zinc-500 font-mono text-[11px]">{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 6: SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-800 space-y-6 max-w-3xl animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-xl text-white">
              Konfigurasi Sistem MovieHub
            </h2>
            <p className="text-xs text-zinc-400">
              Pengaturan operasional server, batasan upload, dan mode aplikasi.
            </p>
          </div>

          <div className="space-y-4">
            {configs.map((cfg) => (
              <div key={cfg.key} className="p-4 rounded-2xl bg-cinema-850/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-white text-sm">{cfg.key}</div>
                  <div className="text-xs text-zinc-400">{cfg.description}</div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={cfg.value}
                    onBlur={(e) => {
                      if (e.target.value !== cfg.value) {
                        handleUpdateConfig(cfg.key, e.target.value);
                      }
                    }}
                    className="bg-cinema-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cinema-red"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-3xl border border-cinema-red/40 shadow-3d-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white">Buat Akun Pengguna</h3>
              <button onClick={() => setShowCreateUserModal(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nama</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="VIEWER">VIEWER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPERADMIN">SUPERADMIN</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl red-gradient-btn text-white font-bold shadow-3d-red mt-2">
                Simpan Akun
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Ad Modal */}
      {showCreateAdModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 rounded-3xl border border-cinema-red/40 shadow-3d-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white">Buat Campaign Iklan Pre-Roll</h3>
              <button onClick={() => setShowCreateAdModal(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <form onSubmit={handleCreateAd} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nama Campaign</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Soundbar 4K Promo"
                  value={newAdData.name}
                  onChange={(e) => setNewAdData({ ...newAdData, name: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Judul Kreatif / Tagline Iklan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dapatkan Pengalaman Audio Sinematik"
                  value={newAdData.title}
                  onChange={(e) => setNewAdData({ ...newAdData, title: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">URL Video Iklan (MP4)</label>
                <input
                  type="url"
                  required
                  placeholder="https://.../video_ad.mp4"
                  value={newAdData.media_url}
                  onChange={(e) => setNewAdData({ ...newAdData, media_url: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Durasi Total (detik)</label>
                  <input
                    type="number"
                    value={newAdData.duration_seconds}
                    onChange={(e) => setNewAdData({ ...newAdData, duration_seconds: Number(e.target.value) })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Dapat Dilewati Setelah (detik)</label>
                  <input
                    type="number"
                    value={newAdData.skip_after_seconds}
                    onChange={(e) => setNewAdData({ ...newAdData, skip_after_seconds: Number(e.target.value) })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl red-gradient-btn text-white font-bold shadow-3d-red mt-2">
                Simpan & Luncurkan Iklan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create QRIS Modal */}
      {showCreateQRISModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-3xl border border-cinema-red/40 shadow-3d-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white">Unggah Barcode QRIS</h3>
              <button onClick={() => setShowCreateQRISModal(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <form onSubmit={handleCreateQRIS} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Judul Kanal Donasi</label>
                <input
                  type="text"
                  required
                  placeholder="Dukung Server MovieHub"
                  value={newQRISData.title}
                  onChange={(e) => setNewQRISData({ ...newQRISData, title: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">URL Barcode QRIS (Image)</label>
                <input
                  type="url"
                  required
                  placeholder="https://.../qris.png"
                  value={newQRISData.qris_url}
                  onChange={(e) => setNewQRISData({ ...newQRISData, qris_url: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Pesan / Deskripsi Apresiasi</label>
                <textarea
                  rows={3}
                  value={newQRISData.description}
                  onChange={(e) => setNewQRISData({ ...newQRISData, description: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl red-gradient-btn text-white font-bold shadow-3d-red mt-2">
                Simpan & Aktifkan QRIS
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
