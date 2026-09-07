'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Video,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  Trash2,
  PlusCircle,
  Shield,
  Activity,
  Zap,
  Crown,
  KeyRound,
  Filter,
  Database,
  Play,
  Download,
  Code2,
  Sparkles,
  TrendingUp,
  Clock,
  Table,
  MessageSquare,
  Star,
  ExternalLink,
} from 'lucide-react';

interface Telemetry {
  totalUsers: number;
  proUsers: number;
  agencyUsers: number;
  freeUsers: number;
  totalRenders: number;
  totalCompletedRenders: number;
  totalFailures: number;
  estimatedMRR: number;
}

interface FeedbackRecord {
  id: string;
  userId?: string;
  userName?: string;
  userEmail: string;
  userTier?: string;
  rating: number;
  ratingLabel?: string;
  comment: string;
  targetUrl?: string;
  timestamp: string;
  userAgent?: string;
}

interface FeedbackStats {
  total: number;
  averageRating: number;
  distribution: Record<number, number>;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'feedback' | 'sql'>('audit');
  const [data, setData] = useState<{
    telemetry: Telemetry;
    users: any[];
    renders: any[];
    feedbacks?: FeedbackRecord[];
    feedbackStats?: FeedbackStats;
    quotaStatus?: {
      status: 'healthy' | 'warning' | 'quota_exhausted';
      lastChecked: string;
      lastExhaustedAt?: string;
      totalAlerts: number;
      recentAlerts: any[];
      webhookConfigured: boolean;
    };
    keyPoolStatus?: {
      totalKeys: number;
      healthyKeys: number;
      cooldownKeys: number;
      invalidKeys: number;
      keys: Array<{
        maskedKey: string;
        status: 'healthy' | 'cooldown' | 'invalid';
        totalSuccess: number;
        totalErrors: number;
        cooldownRemainingSec: number;
        lastUsedAt?: string;
        lastError?: string;
      }>;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  // Security Passcode Protection
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // SQL Studio State
  const [sqlQuery, setSqlQuery] = useState(
    'SELECT rating, user_name, user_email, comment, timestamp FROM feedbacks ORDER BY timestamp DESC'
  );
  const [sqlResult, setSqlResult] = useState<{
    columns: string[];
    data: any[];
    rowCount: number;
    executionTimeMs: number;
  } | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('saasreels_admin_session');
    if (isAuth === 'true') {
      setIsAdminUnlocked(true);
    }
  }, []);

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPins = ['admin', 'admin786', 'admin2026', 'saasreels'];
    if (correctPins.includes(passcodeAttempt.trim().toLowerCase())) {
      sessionStorage.setItem('saasreels_admin_session', 'true');
      setIsAdminUnlocked(true);
      setPasscodeError(false);
      fetchAdminData();
    } else {
      setPasscodeError(true);
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch (err) {
      console.warn('Failed to load admin telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      fetchAdminData();
      handleRunQuery(sqlQuery);
      const interval = setInterval(fetchAdminData, 15000);
      return () => clearInterval(interval);
    }
  }, [isAdminUnlocked]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRunQuery = async (queryToRun = sqlQuery) => {
    setIsExecutingSql(true);
    try {
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToRun }),
      });
      const json = await res.json();
      if (json.success) {
        setSqlResult({
          columns: json.columns,
          data: json.data,
          rowCount: json.rowCount,
          executionTimeMs: json.executionTimeMs,
        });
      }
    } catch {
      showToast('❌ Query execution failed');
    } finally {
      setIsExecutingSql(false);
    }
  };

  const handleUpdateTier = async (userId: string, newTier: string) => {
    setIsActionLoading(userId);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_tier', userId, tier: newTier }),
      });
      if (res.ok) {
        showToast(`✅ Updated tier to ${newTier.toUpperCase()}`);
        fetchAdminData();
      }
    } catch (e) {
      showToast('❌ Failed to update tier');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleGrantCredits = async (userId: string, credits: number) => {
    setIsActionLoading(userId);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grant_credits', userId, credits }),
      });
      if (res.ok) {
        showToast(`🎁 Granted +${credits} credits!`);
        fetchAdminData();
      }
    } catch (e) {
      showToast('❌ Failed to grant credits');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setIsActionLoading(userId);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', userId }),
      });
      if (res.ok) {
        showToast('🗑️ User deleted successfully');
        fetchAdminData();
      }
    } catch (e) {
      showToast('❌ Failed to delete user');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Delete this feedback entry?')) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_feedback', feedbackId }),
      });
      if (res.ok) {
        showToast('🗑️ Feedback removed');
        fetchAdminData();
      }
    } catch (e) {
      showToast('❌ Failed to delete feedback');
    }
  };

  const handleExportCsv = () => {
    if (!sqlResult || sqlResult.data.length === 0) return;
    const headers = sqlResult.columns.join(',');
    const rows = sqlResult.data.map((row) =>
      sqlResult.columns.map((col) => JSON.stringify(row[col] ?? '')).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saasreels_query_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Exported query results to CSV');
  };

  const filteredUsers = (data?.users || []).filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery);
    const matchesTier = tierFilter === 'all' || u.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const filteredFeedbacks = (data?.feedbacks || []).filter((f) => {
    const matchesSearch =
      f.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.targetUrl?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating =
      feedbackRatingFilter === 'all' || String(f.rating) === feedbackRatingFilter;
    return matchesSearch && matchesRating;
  });

  if (!isAdminUnlocked) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <form
          onSubmit={handleUnlockAdmin}
          className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-300 border border-zinc-700 shadow-inner mb-4">
            <Shield className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="text-lg font-black text-white">Admin Command Center</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Restricted access. Enter your developer master passcode to authenticate.
          </p>

          <div className="w-full mt-6 space-y-3">
            <input
              type="password"
              autoFocus
              value={passcodeAttempt}
              onChange={(e) => {
                setPasscodeAttempt(e.target.value);
                setPasscodeError(false);
              }}
              placeholder="Enter admin passcode"
              className={`w-full rounded-2xl border bg-zinc-950 px-4 py-3 text-center text-sm font-mono text-white placeholder-zinc-600 focus:outline-none transition-colors ${
                passcodeError
                  ? 'border-rose-500 focus:border-rose-500 text-rose-400'
                  : 'border-zinc-800 focus:border-amber-400'
              }`}
            />

            {passcodeError && (
              <p className="text-xs text-rose-400 font-semibold animate-shake">
                Incorrect passcode. Access denied.
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-black text-black hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-400/10"
            >
              Unlock Command Center
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 font-bold text-black shadow-2xl animate-pop border border-black/10">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Developer Admin & Data Command</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time telemetry, user management, feedback inbox, and live SQL database console.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-2xl bg-zinc-900 border border-zinc-800 p-1 self-start sm:self-auto flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'audit' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Accounts & KPIs</span>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'feedback' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Feedback & Ratings</span>
            {data?.feedbacks && data.feedbacks.length > 0 && (
              <span className="rounded-full bg-amber-500/30 px-1.5 py-0.2 text-[10px] font-black text-amber-300">
                {data.feedbacks.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'sql' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Live Data & SQL Studio</span>
          </button>
        </div>
      </div>

      {activeTab === 'audit' && (
        <>
          {/* Telemetry KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Total Users</span>
                <Users className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2">
                {data?.telemetry.totalUsers ?? '...'}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {data?.telemetry.proUsers || 0} Pro • {data?.telemetry.agencyUsers || 0} Agency • {data?.telemetry.freeUsers || 0} Free
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">Estimated MRR</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-emerald-300 mt-2">
                ${data?.telemetry.estimatedMRR?.toLocaleString() ?? '...'}
              </p>
              <p className="text-[11px] text-emerald-500/80 mt-1">From active Pro ($49/mo) & Agency ($199/mo)</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Total Reel Renders</span>
                <Video className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2">
                {data?.telemetry.totalRenders ?? '...'}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {data?.telemetry.totalCompletedRenders || 0} completed successfully
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">User Satisfaction</span>
                <Star className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-amber-300 mt-2">
                {data?.feedbackStats?.averageRating ? `${data.feedbackStats.averageRating} / 5.0` : '5.0 / 5.0'}
              </p>
              <p className="text-[11px] text-amber-400 mt-1">
                Across {data?.feedbackStats?.total || (data?.feedbacks?.length ?? 3)} user ratings
              </p>
            </div>
          </div>

          {/* AI Key & Free Quota Live Monitor Card */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-black font-black">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>AI Engine & Free Quota Live Monitor</span>
                    {data?.quotaStatus?.status === 'quota_exhausted' ? (
                      <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-black text-rose-400 border border-rose-500/30 animate-pulse">
                        🔴 FREE QUOTA EXHAUSTED (FALLBACK ACTIVE)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30">
                        🟢 GROQ & LLM ENGINES HEALTHY
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Real-time Groq rate limit tracking, automatic zero-cost fallbacks, and instant alert webhook dispatch.
                  </p>
                </div>
              </div>

              {/* Webhook Status Pill */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border ${
                  data?.quotaStatus?.webhookConfigured
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-zinc-700 bg-zinc-800/80 text-zinc-400'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${data?.quotaStatus?.webhookConfigured ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
                  <span>
                    {data?.quotaStatus?.webhookConfigured
                      ? '⚡ Alert Webhook: Connected'
                      : '⚠️ Webhook: Not Set (Set ALERT_WEBHOOK_URL)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quota Details & Multi-Key Pool Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-800/80">
              <div className="rounded-2xl bg-zinc-950/60 p-3 border border-zinc-800/60">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Global Groq Multi-Key Pool</span>
                <p className="text-xs font-bold text-zinc-200 mt-1 flex items-center gap-1.5">
                  <span>{data?.keyPoolStatus?.healthyKeys ?? 1} / {data?.keyPoolStatus?.totalKeys ?? 1} Keys Healthy</span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-black text-emerald-400">AUTO-FAILOVER</span>
                </p>
                <span className="text-[10px] text-zinc-400">Round-robin load balancing & 5m cooldown</span>
              </div>
              <div className="rounded-2xl bg-zinc-950/60 p-3 border border-zinc-800/60">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Total Rate Limit Triggers</span>
                <p className="text-xs font-bold text-zinc-200 mt-1 font-mono">
                  {data?.quotaStatus?.totalAlerts ?? 0} events logged
                </p>
                <span className="text-[10px] text-zinc-400">
                  {data?.quotaStatus?.lastExhaustedAt
                    ? `Last: ${new Date(data.quotaStatus.lastExhaustedAt).toLocaleTimeString()}`
                    : 'Zero rate limit events in current run'}
                </span>
              </div>
              <div className="rounded-2xl bg-zinc-950/60 p-3 border border-zinc-800/60">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Instant Phone Notification</span>
                <p className="text-xs font-bold text-amber-300 mt-1">Discord / Slack / Telegram</p>
                <span className="text-[10px] text-zinc-400">Set Netlify env <code className="text-zinc-300 font-mono">ALERT_WEBHOOK_URL</code></span>
              </div>
            </div>

            {/* Multi-Key Pool Breakdown */}
            {data?.keyPoolStatus?.keys && data.keyPoolStatus.keys.length > 0 && (
              <div className="mt-3 rounded-2xl bg-zinc-950/40 p-3 border border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                    <span>Configured Groq Keys in Pool ({data.keyPoolStatus.keys.length})</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Add more keys separated by commas in <code className="text-zinc-400">GROQ_API_KEYS</code></span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {data.keyPoolStatus.keys.map((k, idx) => (
                    <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 flex flex-col justify-between gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-zinc-200 font-bold">Key #{idx + 1} ({k.maskedKey})</span>
                        <span className={`rounded px-1.5 py-0.2 text-[9px] font-black uppercase ${
                          k.status === 'healthy'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : k.status === 'cooldown'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {k.status === 'cooldown' ? `Cooldown (${k.cooldownRemainingSec}s)` : k.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/40">
                        <span>✓ {k.totalSuccess} ok</span>
                        <span>⚠️ {k.totalErrors} err</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Quota Logs Table if any */}
            {data?.quotaStatus?.recentAlerts && data.quotaStatus.recentAlerts.length > 0 && (
              <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3">
                <span className="text-xs font-bold text-rose-400 block mb-2">Recent Quota Depletion Events:</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {data.quotaStatus.recentAlerts.map((al: any) => (
                    <div key={al.id} className="flex items-center justify-between text-[11px] text-zinc-300 bg-zinc-900/60 p-2 rounded-xl">
                      <span className="font-mono text-rose-300">HTTP {al.statusCode} - {al.model}</span>
                      <span className="text-zinc-400 truncate max-w-xs">{al.errorMessage?.slice(0, 60)}</span>
                      <span className="font-mono text-zinc-500 text-[10px]">{new Date(al.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Management Section */}
          <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-400" />
                  <span>Registered Accounts & Tiers</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Audit user accounts, elevate plans, grant extra credits, and manage permissions.
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, phone..."
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 pl-8 text-xs text-zinc-200 placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
                  />
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-600" />
                </div>

                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Tiers</option>
                  <option value="agency">Agency</option>
                  <option value="pro">Pro</option>
                  <option value="free">Free / BYOK</option>
                </select>
              </div>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Current Tier</th>
                    <th className="p-3.5">Credits</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500">
                        No users matching search filters
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.id}
                              alt={u.name}
                              className="h-8 w-8 rounded-lg bg-zinc-800 object-cover"
                            />
                            <div>
                              <p className="font-bold text-white">{u.name}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">ID: {u.id.slice(0, 12)}...</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <p className="text-zinc-200">{u.email}</p>
                          <p className="text-[11px] text-zinc-500">{u.phone || 'No phone set'}</p>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={u.tier}
                              onChange={(e) => handleUpdateTier(u.id, e.target.value)}
                              className={`rounded-lg border px-2 py-1 text-[11px] font-bold uppercase focus:outline-none cursor-pointer ${
                                u.tier === 'agency'
                                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                  : u.tier === 'pro'
                                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                                  : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                              }`}
                            >
                              <option value="free" className="bg-zinc-900 text-zinc-200">Free / BYOK</option>
                              <option value="pro" className="bg-zinc-900 text-amber-400">Pro Tier</option>
                              <option value="agency" className="bg-zinc-900 text-emerald-400">Agency Tier</option>
                            </select>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-amber-400">{u.creditsRemaining}</span>
                          <span className="text-zinc-500"> / {u.totalCredits}</span>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleGrantCredits(u.id, 25)}
                              title="Grant +25 Credits"
                              className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-400 hover:text-black transition-colors"
                            >
                              <PlusCircle className="h-3 w-3" />
                              <span>+25 Cr</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              title="Delete User"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: USER FEEDBACKS & RATINGS */}
      {activeTab === 'feedback' && (
        <div className="flex flex-col gap-6">
          {/* Feedback Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
              <span className="text-xs font-semibold text-zinc-400">Total Submissions</span>
              <p className="text-3xl font-black text-white mt-2">
                {data?.feedbacks?.length || 0}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Logged feedback and rating entries</p>
            </div>

            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5">
              <span className="text-xs font-semibold text-amber-400">Average Rating Score</span>
              <p className="text-3xl font-black text-amber-300 mt-2 flex items-center gap-2">
                <span>{data?.feedbackStats?.averageRating ?? 4.8}</span>
                <span className="text-amber-400 text-xl">⭐⭐⭐⭐⭐</span>
              </p>
              <p className="text-[11px] text-amber-400 mt-1">Calculated across 1★ to 5★ ratings</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
              <span className="text-xs font-semibold text-zinc-400">High Satisfaction Rate (4-5★)</span>
              <p className="text-3xl font-black text-emerald-400 mt-2">
                {data?.feedbacks && data.feedbacks.length > 0
                  ? Math.round(
                      (data.feedbacks.filter((f) => f.rating >= 4).length / data.feedbacks.length) * 100
                    ) + '%'
                  : '100%'}
              </p>
              <p className="text-[11px] text-emerald-500/80 mt-1">Founders rating Great or Mindblowing</p>
            </div>
          </div>

          {/* Feedback Table Section */}
          <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-400" />
                  <span>Founder Feedback & Feature Wishlist</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Review ratings, feature requests, and product critique from users.
                </p>
              </div>

              {/* Search & Rating Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search comment, email, url..."
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 pl-8 text-xs text-zinc-200 placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
                  />
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-600" />
                </div>

                <select
                  value={feedbackRatingFilter}
                  onChange={(e) => setFeedbackRatingFilter(e.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5★ Mindblowing 🚀</option>
                  <option value="4">4★ Great 🔥</option>
                  <option value="3">3★ Good 🙂</option>
                  <option value="2">2★ Fair 😕</option>
                  <option value="1">1★ Poor 😡</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">User / Account</th>
                    <th className="p-3.5">Rating</th>
                    <th className="p-3.5 max-w-md">Feedback Message (Up to 1500 chars)</th>
                    <th className="p-3.5">Target SaaS</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredFeedbacks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        No feedback entries matching filter
                      </td>
                    </tr>
                  ) : (
                    filteredFeedbacks.map((f) => (
                      <tr key={f.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-white">{f.userName || 'Anonymous'}</p>
                          <p className="text-zinc-400 font-mono text-[11px]">{f.userEmail}</p>
                          {f.userTier && (
                            <span className="inline-block mt-0.5 rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-400">
                              {f.userTier} Tier
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-amber-300 text-sm">
                              {'⭐'.repeat(f.rating || 5)}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-semibold">
                              {f.ratingLabel || `${f.rating} / 5`}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5 max-w-md">
                          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-2.5 text-xs text-zinc-200 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                            {f.comment || <span className="text-zinc-500 italic">No text provided</span>}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                            Length: {f.comment?.length || 0} / 1500 chars
                          </span>
                        </td>

                        <td className="p-3.5">
                          {f.targetUrl ? (
                            <a
                              href={f.targetUrl.startsWith('http') ? f.targetUrl : `https://${f.targetUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                            >
                              <span>{f.targetUrl.replace(/^https?:\/\//, '').slice(0, 20)}</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          ) : (
                            <span className="text-zinc-600 text-[11px]">None</span>
                          )}
                        </td>

                        <td className="p-3.5 text-[11px] text-zinc-400 font-mono whitespace-nowrap">
                          {new Date(f.timestamp).toLocaleDateString()}{' '}
                          <span className="text-zinc-500">
                            {new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteFeedback(f.id)}
                            title="Delete Feedback"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE DATA & SQL QUERY STUDIO */}
      {activeTab === 'sql' && (
        <div className="flex flex-col gap-6">
          {/* SQL Intelligence Banner */}
          <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-zinc-900/40 to-zinc-900/60 p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-black font-black">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Fastlane-Style AI Training & Data Flywheel Studio</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400">
                    LIVE TELEMETRY & SQL ACTIVE
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Query real-time user accounts, founder feedback reviews, hook conversion signals, and video render metrics.
                </p>
              </div>
            </div>

            {/* Quick Export Button */}
            <button
              onClick={handleExportCsv}
              disabled={!sqlResult || sqlResult.data.length === 0}
              className="flex items-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-bold text-zinc-200 transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto"
            >
              <Download className="h-3.5 w-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Quick Preset Queries */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 mr-1 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Preset SQL Queries:</span>
            </span>
            <button
              onClick={() => {
                const q = 'SELECT id, rating, user_name, user_email, comment, target_url, timestamp FROM feedbacks ORDER BY timestamp DESC';
                setSqlQuery(q);
                handleRunQuery(q);
              }}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              ⭐ All User Feedbacks & Ratings
            </button>
            <button
              onClick={() => {
                const q = 'SELECT rating, rating_stars, feedback_count, comments_provided, share_percent FROM feedbacks GROUP BY rating';
                setSqlQuery(q);
                handleRunQuery(q);
              }}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              📊 Feedback Rating Distribution
            </button>
            <button
              onClick={() => {
                const q = 'SELECT id, name, email, tier, credits_remaining, billing_status FROM users';
                setSqlQuery(q);
                handleRunQuery(q);
              }}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:border-amber-400/50 hover:text-amber-300 transition-colors"
            >
              👥 User Accounts & Cohorts
            </button>
            <button
              onClick={() => {
                const q = 'SELECT brand_name, script_headline, duration_sec, status, exported_at FROM video_renders';
                setSqlQuery(q);
                handleRunQuery(q);
              }}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:border-amber-400/50 hover:text-amber-300 transition-colors"
            >
              🎬 Video Pipeline Render Logs
            </button>
            <button
              onClick={() => {
                const q = 'SELECT hook_angle, sample_count, avg_viral_score, avg_ctr_percent, total_trial_signups FROM hook_telemetry GROUP BY hook_angle';
                setSqlQuery(q);
                handleRunQuery(q);
              }}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:border-amber-400/50 hover:text-amber-300 transition-colors"
            >
              🔥 Hook Angle Conversion ROI
            </button>
          </div>

          {/* SQL Editor Box */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Code2 className="h-4 w-4 text-amber-400" />
                <span>SQL Query Console</span>
              </div>
              {sqlResult && (
                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                  <span>Rows: <strong className="text-zinc-200">{sqlResult.rowCount}</strong></span>
                  <span>Execution: <strong className="text-emerald-400">{sqlResult.executionTimeMs}ms</strong></span>
                </div>
              )}
            </div>

            <textarea
              rows={3}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="SELECT * FROM feedbacks..."
              className="w-full bg-transparent font-mono text-xs text-amber-300 placeholder-zinc-700 focus:outline-none resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
              <span className="text-[10px] text-zinc-500 font-mono">
                Tables: feedbacks, users, video_renders, search_telemetry, hook_telemetry
              </span>
              <button
                onClick={() => handleRunQuery(sqlQuery)}
                disabled={isExecutingSql || !sqlQuery.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs font-black text-black transition-all active:scale-95 shadow-md shadow-amber-400/10 disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isExecutingSql ? 'Executing...' : 'Run Query'}</span>
              </button>
            </div>
          </div>

          {/* SQL Results Grid Table */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Table className="h-3.5 w-3.5 text-amber-400" />
                <span>Query Results Table</span>
              </h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-zinc-800 bg-zinc-900 text-[11px] font-bold text-amber-300">
                  <tr>
                    {sqlResult?.columns.map((col) => (
                      <th key={col} className="p-3 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {(!sqlResult || sqlResult.data.length === 0) ? (
                    <tr>
                      <td colSpan={sqlResult?.columns.length || 1} className="p-8 text-center text-zinc-500">
                        {isExecutingSql ? 'Running query against database tables...' : 'No records returned.'}
                      </td>
                    </tr>
                  ) : (
                    sqlResult.data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                        {sqlResult.columns.map((col) => (
                          <td key={col} className="p-3 text-zinc-200">
                            {typeof row[col] === 'boolean'
                              ? row[col]
                                ? 'true'
                                : 'false'
                              : row[col] ?? 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
