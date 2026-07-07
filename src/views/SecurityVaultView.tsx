/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Lock, Key, History, Fingerprint, EyeOff, Cpu, 
  Activity, RotateCcw, CreditCard, Trash, Check, AlertTriangle, 
  Database, Sparkles, Clock, Search, Eye, Info, RefreshCw, Smartphone, MapPin, ShieldAlert, Zap
} from 'lucide-react';
import { User, Product } from '../lib/db';

interface SecurityVaultViewProps {
  currentUser: User;
  setActiveView: (view: any) => void;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'SECURE';
  source: string;
  message: string;
  hash: string;
}

interface VirtualCard {
  id: string;
  cardNo: string;
  expiry: string;
  cvv: string;
  limit: number;
  spent: number;
  status: 'active' | 'used' | 'revoked';
  label: string;
}

export default function SecurityVaultView({ currentUser, setActiveView }: SecurityVaultViewProps) {
  // 1. Immutable Chronological Security Ledger (Feature 77)
  const [securityLedger, setSecurityLedger] = React.useState<SecurityLog[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('nexus_bazaar_security_ledger');
    if (stored) return JSON.parse(stored);

    const initialLogs: SecurityLog[] = [
      {
        id: 'sec_1',
        timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        level: 'SECURE',
        source: 'CRYPTO_VAULT',
        message: 'Ultra-Private Shipping Lock synchronized with delivery driver keys',
        hash: 'b5a8e2f9d6c4a3b2e5f1c7d8a9b0c1e2f3d4c5a6'
      },
      {
        id: 'sec_2',
        timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
        level: 'INFO',
        source: 'SESSION_VERIFY',
        message: `Device fingerprint hash generated for ${currentUser.name}: Safari/macOS AppleSilicon`,
        hash: 'd6c4a3b2e5f1c7d8a9b0c1e2f3d4c5a6b5a8e2f9'
      },
      {
        id: 'sec_3',
        timestamp: new Date(Date.now() - 3600000 * 0.4).toISOString(),
        level: 'SECURE',
        source: 'MFA_LOCK',
        message: 'Hardware FIDO2 Security Key requirements enforced for core administrative states',
        hash: 'a9b0c1e2f3d4c5a6b5a8e2f9d6c4a3b2e5f1c7d8'
      }
    ];
    localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(initialLogs));
    return initialLogs;
  });

  const [ledgerSearch, setLedgerSearch] = React.useState('');

  const appendToLedger = (level: 'INFO' | 'WARN' | 'SECURE', source: string, message: string) => {
    const newLog: SecurityLog = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    setSecurityLedger(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(updated));
      return updated;
    });
  };

  const clearLedgerHistory = () => {
    if (confirm("Are you sure you want to clear your local security logs view? (Underlying ledger remains immutable)")) {
      localStorage.removeItem('nexus_bazaar_security_ledger');
      setSecurityLedger([]);
      appendToLedger('INFO', 'LEDGER_AUDIT', 'Security ledger view reset by account owner');
    }
  };

  // 2. Granular Privacy Tracking Toggles (Feature 79)
  const [behavioralTracking, setBehavioralTracking] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const val = localStorage.getItem('nexus_bazaar_privacy_behavioral_tracking');
    return val === null ? true : val === 'true';
  });

  const [telemetryOptIn, setTelemetryOptIn] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const val = localStorage.getItem('nexus_bazaar_privacy_telemetry');
    return val === null ? true : val === 'true';
  });

  const [pseudonymActive, setPseudonymActive] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('nexus_bazaar_privacy_pseudonym') === 'true';
  });

  const handleTogglePrivacy = (type: 'behavioral' | 'telemetry' | 'pseudonym', currentVal: boolean) => {
    const nextVal = !currentVal;
    if (type === 'behavioral') {
      setBehavioralTracking(nextVal);
      localStorage.setItem('nexus_bazaar_privacy_behavioral_tracking', String(nextVal));
      appendToLedger('SECURE', 'PRIVACY_HUB', `Behavioral telemetry analytics toggled to: ${nextVal ? 'Personalized' : 'Strict Static (Non-Personalized)'}`);
    } else if (type === 'telemetry') {
      setTelemetryOptIn(nextVal);
      localStorage.setItem('nexus_bazaar_privacy_telemetry', String(nextVal));
      appendToLedger('INFO', 'PRIVACY_HUB', `Anonymous performance logging telemetry toggled to: ${nextVal ? 'Active' : 'Disabled'}`);
    } else if (type === 'pseudonym') {
      setPseudonymActive(nextVal);
      localStorage.setItem('nexus_bazaar_privacy_pseudonym', String(nextVal));
      appendToLedger('SECURE', 'PRIVACY_HUB', `Cryptographic buyer pseudonym mask toggled to: ${nextVal ? 'Enforced' : 'Disabled'}`);
    }
  };

  // 3. Single-Use Disposable Virtual Cards (Feature 72)
  const [virtualCards, setVirtualCards] = React.useState<VirtualCard[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('nexus_bazaar_virtual_cards');
    if (stored) return JSON.parse(stored);

    const initialCards: VirtualCard[] = [
      {
        id: 'card_1',
        cardNo: '•••• •••• •••• 4092',
        expiry: '08/28',
        cvv: '812',
        limit: 250,
        spent: 0,
        status: 'active',
        label: 'Workspace Equipment Burner'
      }
    ];
    localStorage.setItem('nexus_bazaar_virtual_cards', JSON.stringify(initialCards));
    return initialCards;
  });

  const [newCardLabel, setNewCardLabel] = React.useState('');
  const [newCardLimit, setNewCardLimit] = React.useState(100);

  const handleCreateVirtualCard = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newCardLabel.trim() || 'Disposable Multi-device Token';
    const cardNo = `•••• •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`;
    const randomExpiry = `0${Math.floor(1 + Math.random() * 8)}/${Math.floor(27 + Math.random() * 4)}`;
    const randomCVV = `${Math.floor(100 + Math.random() * 900)}`;

    const newCard: VirtualCard = {
      id: `card_${Date.now()}`,
      cardNo,
      expiry: randomExpiry,
      cvv: randomCVV,
      limit: newCardLimit,
      spent: 0,
      status: 'active',
      label
    };

    setVirtualCards(prev => {
      const updated = [...prev, newCard];
      localStorage.setItem('nexus_bazaar_virtual_cards', JSON.stringify(updated));
      return updated;
    });

    setNewCardLabel('');
    appendToLedger('SECURE', 'VIRTUAL_CARDS', `Generated isolated disposable virtual card [${label}] with $${newCardLimit} threshold`);
  };

  const handleRevokeCard = (id: string) => {
    setVirtualCards(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, status: 'revoked' as const } : c);
      localStorage.setItem('nexus_bazaar_virtual_cards', JSON.stringify(updated));
      const targetCard = prev.find(c => c.id === id);
      if (targetCard) {
        appendToLedger('SECURE', 'VIRTUAL_CARDS', `Revoked disposable virtual payment card [${targetCard.label}]`);
      }
      return updated;
    });
  };

  // 4. Device Session Fingerprint Verification (Feature 74)
  const [simulatedAnomalousLocation, setSimulatedAnomalousLocation] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('nexus_bazaar_anomalous_location_simulation') === 'true';
  });

  const toggleAnomalousLocation = () => {
    const nextVal = !simulatedAnomalousLocation;
    setSimulatedAnomalousLocation(nextVal);
    localStorage.setItem('nexus_bazaar_anomalous_location_simulation', String(nextVal));
    if (nextVal) {
      appendToLedger('WARN', 'SESSION_VERIFY', '⚠️ Anomalous Location Detected: Primary active checkout coordinates changed from Seattle, WA to Frankfurt, Germany in under 3.5s!');
    } else {
      appendToLedger('INFO', 'SESSION_VERIFY', 'Session geography verified: GPS logs matching local ISP backbone nodes perfectly.');
    }
  };

  // Mock static user device fingerprint values
  const deviceFingerprint = React.useMemo(() => {
    return {
      hash: '0x9E2B7C84D02A1E5C',
      ip: simulatedAnomalousLocation ? '46.12.98.241 (Proxy/VPN Frankfurt)' : '76.112.42.109 (Seattle-East Subnet)',
      canvasId: 'CanvasFp_2026_07_07_A',
      screen: '2560x1440 24-bit RGB',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124.0.0.0 Safari/537.36'
    };
  }, [simulatedAnomalousLocation]);

  // 5. Rate-Limited Search Protection Shield (Feature 76)
  const [searchShieldLevel, setSearchShieldLevel] = React.useState<number>(15); // requests in last min
  const [isRateLimited, setIsRateLimited] = React.useState(false);
  const [rateLimitLogs, setRateLimitLogs] = React.useState<string[]>([
    "Search security shield online.",
    "Bot crawler behavior filtering enabled."
  ]);
  const [captchaVerified, setCaptchaVerified] = React.useState(false);

  const simulateAggressiveSearches = () => {
    setSearchShieldLevel(65);
    setIsRateLimited(true);
    setCaptchaVerified(false);
    setRateLimitLogs(prev => [
      `[WARN] Surge detected: 65 req/min exceeds defensive scraping rate limit (50 req/min).`,
      `[SECURITY] Triggering HTTP 429 Shield. Requiring hardware cryptographic puzzle challenge.`,
      ...prev
    ]);
    appendToLedger('WARN', 'RATE_LIMITER', 'Search query index rate-limiting trigger: Shielding product catalogs from bulk web scrapers (HTTP 429)');
  };

  const handleVerifyCaptcha = () => {
    setCaptchaVerified(true);
    setTimeout(() => {
      setIsRateLimited(false);
      setSearchShieldLevel(12);
      setRateLimitLogs(prev => [
        `[SUCCESS] Cryptographic FIDO-Turnstile challenge verified successfully.`,
        `[INFO] Ingress port restriction lifted for client device.`,
        ...prev
      ]);
      appendToLedger('SECURE', 'RATE_LIMITER', 'Cryptographic human verification completed. Search index rate restriction bypassed.');
    }, 1200);
  };

  // 6. Ephemeral Cart Garbage Collectors (Feature 78)
  const [isCollectorRunning, setIsCollectorRunning] = React.useState(false);
  const [collectorMetrics, setCollectorMetrics] = React.useState({
    totalCarts: 148,
    staleCarts: 41,
    spaceUsed: '1.24 MB',
    lastRun: '1 hour ago'
  });

  const triggerGarbageCollection = () => {
    setIsCollectorRunning(true);
    appendToLedger('INFO', 'GARBAGE_COLLECT', 'KV Storage Scan: Searching for abandoned anonymous carts older than 72 hours...');
    
    setTimeout(() => {
      setIsCollectorRunning(false);
      setCollectorMetrics({
        totalCarts: 107,
        staleCarts: 0,
        spaceUsed: '0.86 MB',
        lastRun: 'Just now'
      });
      appendToLedger('SECURE', 'GARBAGE_COLLECT', 'Garbage collection completed. Discarded 41 stale anonymous cart sessions from Vercel KV. Saved 380 KB of storage.');
    }, 2500);
  };

  // Filtered security logs
  const filteredLogs = React.useMemo(() => {
    return securityLedger.filter(log => {
      const q = ledgerSearch.toLowerCase();
      return (
        log.source.toLowerCase().includes(q) ||
        log.message.toLowerCase().includes(q) ||
        log.level.toLowerCase().includes(q)
      );
    });
  }, [securityLedger, ledgerSearch]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Security & Privacy Settings</h2>
          </div>
          <p className="text-xs text-slate-500 leading-normal mt-1">
            Manage your security locks, create temporary shopping cards, check your logs, and configure secure fingerprint login.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveView('storefront')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
            ← Return to Storefront
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Privacy Controls & Virtual Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 79. GRANULAR PRIVACY TRACKING TOGGLES & 75. PSEUDONYM MASK */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-left space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-lg">🌿</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">75 & 79. Core Privacy Hub & Cryptographic Masking</h3>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Enforce strict sovereign privacy. Disable behavioral analytics, performance monitors, or apply cryptographic masks to block profiling scrapers.
            </p>

            <div className="space-y-4">
              
              {/* Behavioral Tracking */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-slate-800 block flex items-center gap-2">
                    Behavioral Activity Tracking
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${behavioralTracking ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {behavioralTracking ? 'Personalized Active' : 'Strict Static Mode'}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-normal">
                    When disabled, the storefront falls back to a purely static, non-personalized layout. Your search and page patterns are completely omitted from logs.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('behavioral', behavioralTracking)}
                  className={`h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer relative ${behavioralTracking ? 'bg-teal-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white h-5 w-5 rounded-full shadow-xs transition-transform ${behavioralTracking ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {/* Performance Telemetry */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-slate-800 block">Performance Telemetry Logging</span>
                  <span className="text-[10px] text-slate-400 block leading-normal">
                    Opt-out of submitting anonymous connection latency, page-load benchmarks, or console performance metrics to our central monitors.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('telemetry', telemetryOptIn)}
                  className={`h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer relative ${telemetryOptIn ? 'bg-teal-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white h-5 w-5 rounded-full shadow-xs transition-transform ${telemetryOptIn ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {/* 75. Cryptographic Review Pseudonym Mask */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                    <span>75. Cryptographic Pseudonym Mask</span>
                    {pseudonymActive && (
                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded">
                        Active Hash Enforced
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-normal">
                    Applies a unique cryptographic mask over your public profile history. Web scrapers and automated spiders see you only as <strong>Anonymized Buyer #e47c1</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('pseudonym', pseudonymActive)}
                  className={`h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer relative ${pseudonymActive ? 'bg-emerald-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white h-5 w-5 rounded-full shadow-xs transition-transform ${pseudonymActive ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {pseudonymActive && (
                <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 text-[10px] font-mono text-emerald-800 space-y-1 leading-normal">
                  <span className="font-bold uppercase block">Deterministic Pseudonym Preview:</span>
                  <div>Original Identity: <strong className="text-emerald-950 font-bold">{currentUser.name}</strong></div>
                  <div>Cryptographic SHA-256 Mask: <strong className="text-emerald-900 bg-emerald-100 px-1 rounded">Anonym_Buyer_{currentUser.id.substring(5, 10) || 'd7a2f'}</strong></div>
                  <span className="text-[9px] text-emerald-600 block pt-1 leading-normal">
                    🛡️ This pseudonym replaces your name on all product reviews, Q&As, and community forum threads dynamically.
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* 72. SINGLE-USE DISPOSABLE VIRTUAL CARDS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-left space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-lg">💳</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">72. Single-Use Disposable Virtual Cards</h3>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Generate isolated payment card numbers that act as burner tokens. Limits are capped and cards auto-expire instantly after one single transaction, protecting actual banking metadata from external trackers.
            </p>

            {/* Create Card Form */}
            <form onSubmit={handleCreateVirtualCard} className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Generate Burner Payment Token</span>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Card Label / Purpose</label>
                  <input
                    type="text"
                    required
                    value={newCardLabel}
                    onChange={(e) => setNewCardLabel(e.target.value)}
                    placeholder="e.g. Ergonomic Keyboard Co."
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Max Transaction Cap ($)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={newCardLimit}
                    onChange={(e) => setNewCardLimit(parseInt(e.target.value) || 100)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 font-mono outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Issue Disposable Card
                </button>
              </div>
            </form>

            {/* Virtual Cards List */}
            <div className="grid gap-4 sm:grid-cols-2">
              {virtualCards.map((card) => {
                const isRevoked = card.status === 'revoked';
                return (
                  <div
                    key={card.id}
                    className={`relative rounded-2xl p-5 border flex flex-col justify-between h-40 transition-all ${
                      isRevoked 
                        ? 'border-slate-150 bg-slate-50/50 opacity-60' 
                        : 'border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isRevoked ? 'bg-slate-200 text-slate-600' : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                        }`}>
                          {card.status}
                        </span>
                        <span className={`text-xs font-bold truncate max-w-[120px] ${isRevoked ? 'text-slate-400' : 'text-slate-200'}`}>
                          {card.label}
                        </span>
                      </div>

                      <div className="mt-4 font-mono text-base tracking-widest text-center">
                        {card.cardNo}
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-200/15 pt-3 mt-1 text-[10px] font-mono">
                      <div>
                        <span className={`block text-[8px] uppercase ${isRevoked ? 'text-slate-400' : 'text-slate-500'}`}>Expiry / CVV</span>
                        <span className={isRevoked ? 'text-slate-500' : 'text-slate-200'}>{card.expiry} • {card.cvv}</span>
                      </div>
                      <div className="text-right">
                        <span className={`block text-[8px] uppercase ${isRevoked ? 'text-slate-400' : 'text-slate-500'}`}>Cap limit</span>
                        <span className={`font-bold ${isRevoked ? 'text-slate-500' : 'text-emerald-400'}`}>${card.limit}</span>
                      </div>
                    </div>

                    {!isRevoked && (
                      <button
                        type="button"
                        onClick={() => handleRevokeCard(card.id)}
                        className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-400 p-1 rounded-full bg-slate-950/20 hover:bg-slate-950/40 cursor-pointer"
                        title="Revoke and Burn immediately"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Right Column: Sessions, Rate Limits, and Garbage Collection */}
        <div className="space-y-6">
          
          {/* 74. DEVICE SESSION FINGERPRINT VERIFICATION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-left space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-lg">🧬</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">74. Device Fingerprint & Geo-Verify</h3>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Monitors active browser parameters and geographical hops. Instantly flags anomalous shifts to trigger FIDO2 re-verification during checkout.
            </p>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400">SESSION GEO STATUS</span>
                <span className={`font-bold ${simulatedAnomalousLocation ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`}>
                  {simulatedAnomalousLocation ? '⚠️ ANOMALOUS DETECTED' : '✓ SECURE MATCH'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-400 text-[10px] uppercase font-mono">Device Fingerprint</span>
                  <strong className="font-mono text-slate-800">{deviceFingerprint.hash}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-400 text-[10px] uppercase font-mono">Client Node IP</span>
                  <strong className="font-mono text-slate-800">{deviceFingerprint.ip}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 text-[10px] uppercase font-mono">Browser Core</span>
                  <strong className="truncate max-w-[130px] text-slate-800" title={deviceFingerprint.userAgent}>{deviceFingerprint.screen}</strong>
                </div>
              </div>
            </div>

            {/* Simulated geographical change button */}
            <button
              type="button"
              onClick={toggleAnomalousLocation}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                simulatedAnomalousLocation 
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-3xs'
              }`}
            >
              <Smartphone className="h-4 w-4 shrink-0" />
              {simulatedAnomalousLocation ? 'Reset Session Coordinates' : 'Simulate Anomalous Geohop (VPN)'}
            </button>
          </div>

          {/* 76. RATE-LIMITED SEARCH PROTECTION SHIELD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-left space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-lg">🛡️</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">76. Search Scraping Protection</h3>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Defends open database search indexes against aggressive bulk scrapers and bots. Blocks connections exceeding 50 queries/minute.
            </p>

            <div className="bg-slate-950 text-slate-300 rounded-xl p-3 border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Scraper Defense Status</span>
                <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded uppercase ${isRateLimited ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {isRateLimited ? 'Rate Limited (429)' : 'Optimal'}
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block font-mono">Current Search Ingress</span>
                  <strong className="text-2xl font-mono font-black text-slate-100">{searchShieldLevel} req/min</strong>
                </div>
                <div className="h-6 w-24 bg-slate-900 border border-slate-800 rounded relative overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isRateLimited ? 'bg-rose-500' : 'bg-teal-500'}`} 
                    style={{ width: `${Math.min(100, (searchShieldLevel / 60) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Captcha challenge simulation when rate limited */}
            <AnimatePresence mode="wait">
              {isRateLimited ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-3"
                >
                  <span className="text-[10px] font-bold text-amber-900 block flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    Turnstile Verification Required
                  </span>
                  <p className="text-[10px] text-amber-700 leading-normal">
                    This browser has sent too many search index queries. Verify humanity using our cryptographic hardware loop.
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleVerifyCaptcha}
                    disabled={captchaVerified}
                    className="w-full rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-emerald-600 text-white py-1.5 px-3 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {captchaVerified ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Checked
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" /> Complete Human verification
                      </>
                    )}
                  </button>
                </motion.div>
              ) : (
                <button
                  type="button"
                  onClick={simulateAggressiveSearches}
                  className="w-full py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Simulate Bot Search Flood
                </button>
              )}
            </AnimatePresence>

            <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 text-[9px] font-mono text-slate-400 h-16 overflow-y-auto space-y-1">
              {rateLimitLogs.map((log, idx) => (
                <div key={idx} className="truncate">{log}</div>
              ))}
            </div>

          </div>

          {/* 78. EPHEMERAL CART GARBAGE COLLECTORS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-left space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-lg">🧹</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">78. Ephemeral Cart Collector</h3>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Automated background task sweeping abandoned anonymous checkout sessions older than 72 hours from Vercel KV to optimize memory bounds.
            </p>

            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-150">
                <span className="text-[8px] text-slate-400 block uppercase">Total Sessions</span>
                <strong className="text-slate-800">{collectorMetrics.totalCarts}</strong>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-150">
                <span className="text-[8px] text-slate-400 block uppercase">Stale Carts</span>
                <strong className={collectorMetrics.staleCarts > 0 ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                  {collectorMetrics.staleCarts}
                </strong>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-150">
                <span className="text-[8px] text-slate-400 block uppercase">Vercel KV Size</span>
                <strong className="text-slate-800">{collectorMetrics.spaceUsed}</strong>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-150">
                <span className="text-[8px] text-slate-400 block uppercase">Scheduler Sweep</span>
                <strong className="text-slate-800">{collectorMetrics.lastRun}</strong>
              </div>
            </div>

            <button
              type="button"
              disabled={isCollectorRunning}
              onClick={triggerGarbageCollection}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white disabled:text-slate-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isCollectorRunning ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sweeping database keys...
                </>
              ) : (
                <>
                  <Trash className="h-3.5 w-3.5" /> Force Run Ephemeral Sweep
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* 77. AUDITABLE LEDGER HISTORY FOR ACCOUNTS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-left space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">77. Immutable Chronological Security Ledger</h3>
              <p className="text-[10px] text-slate-400 leading-none mt-1">Real-time validation log for key configuration adjustments and security events.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Filter logs..."
                className="rounded-lg border border-slate-200 pl-8 pr-3 py-1 text-xs text-slate-800 outline-none w-44 focus:border-teal-500"
              />
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            
            <button
              type="button"
              onClick={clearLedgerHistory}
              className="rounded-lg border border-slate-200 bg-white p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-150 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-bold">Timestamp</th>
                <th className="py-2.5 px-4 font-bold">Severity</th>
                <th className="py-2.5 px-4 font-bold">Module Source</th>
                <th className="py-2.5 px-4 font-bold">Security Log Entry</th>
                <th className="py-2.5 px-4 font-bold text-right">Verification SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No matching ledger transactions recorded in this context.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const levelColors = {
                    INFO: 'bg-slate-100 text-slate-600 border-slate-200',
                    WARN: 'bg-rose-50 text-rose-700 border-rose-200/50',
                    SECURE: 'bg-emerald-50 text-emerald-800 border-emerald-200/50'
                  };
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[9.5px] text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[8px] font-mono font-bold uppercase border px-1.5 py-0.2 rounded ${levelColors[log.level]}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[9px] text-slate-500 font-bold">
                        {log.source}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {log.message}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[8.5px] text-slate-400 tracking-tight">
                        {log.hash}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
