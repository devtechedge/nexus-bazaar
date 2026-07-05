/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  FolderPlus, 
  Percent, 
  Crown, 
  UserX, 
  UserCheck,
  TrendingUp,
  X,
  FileSpreadsheet,
  Terminal,
  Search,
  Database,
  Activity,
  Play,
  Pause,
  Trash
} from 'lucide-react';
import { User, UserRole, DatabaseState } from '../lib/db';

interface AdminViewProps {
  dbState: DatabaseState;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onAddCategory: (categoryName: string) => void;
  onAddPromoCode: (promo: any) => void;
  onRemovePromoCode: (code: string) => void;
}

export default function AdminView({
  dbState,
  onUpdateUser,
  onAddCategory,
  onAddPromoCode,
  onRemovePromoCode,
}: AdminViewProps) {
  // New category state
  const [newCatName, setNewCatName] = React.useState('');
  const [catSuccess, setCatSuccess] = React.useState(false);

  // Ledger search and filtering state (Feature #10)
  const [ledgerSearch, setLedgerSearch] = React.useState('');
  const [selectedLedgerOrder, setSelectedLedgerOrder] = React.useState<any>(null);

  // Security logs terminal states (Feature #10)
  const [isTelemetryPaused, setIsTelemetryPaused] = React.useState(false);
  const [securityLogs, setSecurityLogs] = React.useState<{
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'SECURE';
    source: string;
    message: string;
  }[]>([]);

  // Seed default logs
  React.useEffect(() => {
    setSecurityLogs([
      { id: '1', timestamp: '15:42:01', level: 'SECURE', source: 'AUTH_GATE', message: 'RSA TLS 1.3 handshakes established on node 18' },
      { id: '2', timestamp: '15:42:04', level: 'INFO', source: 'SQL_SIM', message: 'Platform transaction ledger indexed successfully' },
      { id: '3', timestamp: '15:42:15', level: 'INFO', source: 'MEM_POOL', message: 'In-memory state ledger synchronized with client-side storage' },
      { id: '4', timestamp: '15:43:00', level: 'SECURE', source: 'FIREWALL', message: 'Anti-DDOS ingress filters active and tracking telemetry streams' },
    ]);
  }, []);

  // Interval to add logs
  React.useEffect(() => {
    if (isTelemetryPaused) return;

    const events = [
      { level: 'INFO', source: 'LOGISTICS', message: 'Simulated courier drone delivery tracking coordinates synchronized' },
      { level: 'SECURE', source: 'AUTH_GATE', message: 'User authorization credentials successfully checked' },
      { level: 'INFO', source: 'CATALOG', message: 'Re-indexing stock inventory thresholds' },
      { level: 'WARN', source: 'ESCROW', message: 'Pending payouts escrow balance calculated on master wallet' },
      { level: 'SECURE', source: 'DB_AUDIT', message: 'System integrity hash checked and validated: 0x8F92A' },
      { level: 'INFO', source: 'PROMO_LEDGER', message: 'ACTIVE platform discount campaign vouchers loaded' },
      { level: 'INFO', source: 'GATEWAY', message: 'Stripe transaction proxy simulated without actual financial ledger' },
    ];

    const interval = setInterval(() => {
      const event = events[Math.floor(Math.random() * events.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setSecurityLogs((prev) => [
        ...prev.slice(-12), // hold up to 12 rows
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: timeStr,
          level: event.level as any,
          source: event.source,
          message: event.message
        }
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isTelemetryPaused]);

  // Filtered orders list for the auditor
  const filteredOrders = React.useMemo(() => {
    if (!ledgerSearch.trim()) return dbState.orders;
    const s = ledgerSearch.toLowerCase();
    return dbState.orders.filter(o => 
      o.id.toLowerCase().includes(s) || 
      o.userName.toLowerCase().includes(s)
    );
  }, [dbState.orders, ledgerSearch]);

  // New voucher state
  const [newCode, setNewCode] = React.useState('');
  const [newDiscount, setNewDiscount] = React.useState(15);
  const [newDesc, setNewDesc] = React.useState('');
  const [newRequiresElite, setNewRequiresElite] = React.useState(false);
  const [newMinSubtotal, setNewMinSubtotal] = React.useState(0);
  const [voucherSuccess, setVoucherSuccess] = React.useState(false);

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
    setCatSuccess(true);
    setTimeout(() => setCatSuccess(false), 2500);
  };

  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newDesc.trim()) return;
    onAddPromoCode({
      code: newCode.trim().toUpperCase(),
      discountPercent: newDiscount,
      description: newDesc.trim(),
      requiresElite: newRequiresElite,
      minSubtotal: newMinSubtotal > 0 ? newMinSubtotal : undefined,
    });
    setNewCode('');
    setNewDesc('');
    setNewDiscount(15);
    setNewRequiresElite(false);
    setNewMinSubtotal(0);
    setVoucherSuccess(true);
    setTimeout(() => setVoucherSuccess(false), 2500);
  };

  // Aggregated system parameters
  const globalRevenue = React.useMemo(() => {
    return dbState.orders.reduce((acc, order) => acc + order.total, 0);
  }, [dbState.orders]);

  const activeSellersCount = React.useMemo(() => {
    return dbState.users.filter((u) => u.role === UserRole.Seller).length;
  }, [dbState.users]);

  return (
    <div id="admin-view-container" className="pb-16 space-y-10">
      
      {/* ADMIN HEADER */}
      <div className="border-b border-slate-100 pb-5">
        <h2 id="admin-heading" className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-teal-600" />
          <span>Platform Administration Workspace</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform administrative database audits, adjust member restrictions, and register campaign vouchers
        </p>
      </div>

      {/* PLATFORM OVERVIEW STATISTICS */}
      <section id="admin-stats" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div id="admin-stat-revenue" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider mb-2">Total Managed Payouts</span>
          <p className="text-2xl font-black text-slate-800 tracking-tight">${globalRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-teal-600 mt-1">Sourced from all checkout logs</p>
        </div>

        <div id="admin-stat-users" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider mb-2">Registered Accounts</span>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{dbState.users.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Buyers, Sellers, and Administrators</p>
        </div>

        <div id="admin-stat-listings" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider mb-2">Active Catalog Listings</span>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{dbState.products.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Live active indexed stock items</p>
        </div>

        <div id="admin-stat-orders" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider mb-2">Finished Checkouts</span>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{dbState.orders.length}</p>
          <p className="text-[10px] text-indigo-600 mt-1 font-semibold">100% Client-Side Logged</p>
        </div>
      </section>

      {/* USER MANAGEMENT TABLE */}
      <section id="admin-users-panel" className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-teal-600" />
            <span>Audited Platform User Registry</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider font-mono">
                <th className="px-6 py-4">Full Identity</th>
                <th className="px-6 py-4">Auth Email</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Membership Tier</th>
                <th className="px-6 py-4">Access Status</th>
                <th className="px-6 py-4 text-right">Administrative Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
              {dbState.users.map((usr) => (
                <tr id={`admin-user-row-${usr.id}`} key={usr.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={usr.avatar} alt={usr.name} className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-slate-800">{usr.name}</p>
                      <p className="text-[9px] font-mono text-slate-400">UID: {usr.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">{usr.email}</td>
                  <td className="px-6 py-4">
                    {/* Role switcher override */}
                    <select
                      id={`admin-role-select-${usr.id}`}
                      value={usr.role}
                      onChange={(e) => onUpdateUser(usr.id, { role: e.target.value as UserRole })}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer outline-none focus:border-teal-500"
                    >
                      <option value={UserRole.Buyer}>Buyer</option>
                      <option value={UserRole.Seller}>Seller</option>
                      <option value={UserRole.Admin}>Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      id={`admin-toggle-elite-${usr.id}`}
                      onClick={() => onUpdateUser(usr.id, { isElite: !usr.isElite })}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        usr.isElite 
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <Crown className="h-3 w-3" />
                      <span>{usr.isElite ? 'ELITE MEMBER' : 'STANDARD'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {usr.isBanned ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">Suspended</span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Active Access</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      id={`admin-ban-btn-${usr.id}`}
                      onClick={() => onUpdateUser(usr.id, { isBanned: !usr.isBanned })}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                        usr.isBanned 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {usr.isBanned ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Reinstate Access</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-3.5 w-3.5" />
                          <span>Suspend Account</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* LOWER GRID: PROMOS AND CATEGORIES (split 2 columns) */}
      <div id="admin-lower-grid" className="grid gap-6 md:grid-cols-2">
        
        {/* VOUCHERS CREATION AND MANAGEMENT */}
        <div id="admin-promo-manager" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-50 pb-2 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Percent className="h-4.5 w-4.5 text-teal-600" />
              <span>Platform Voucher Campaigns</span>
            </h3>
          </div>

          {voucherSuccess && (
            <p id="admin-voucher-success" className="text-xs text-emerald-700 bg-emerald-50 rounded-xl p-2.5 font-semibold">
              ✓ Campaign voucher registered and live!
            </p>
          )}

          {/* Create Coupon Form */}
          <form id="admin-voucher-form" onSubmit={handleVoucherSubmit} className="grid gap-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Promo Code</label>
                <input
                  id="admin-promo-code"
                  type="text"
                  required
                  placeholder="e.g. FLASH25"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2 text-xs outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Discount (%)</label>
                <input
                  id="admin-promo-discount"
                  type="number"
                  required
                  min={5}
                  max={95}
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2 text-xs outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600">Campaign Description</label>
              <input
                id="admin-promo-desc"
                type="text"
                required
                placeholder="Save 25% on tech items!"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2 text-xs outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Min Order ($)</label>
                <input
                  id="admin-promo-minsubtotal"
                  type="number"
                  min={0}
                  value={newMinSubtotal}
                  onChange={(e) => setNewMinSubtotal(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2 text-xs outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-between border border-slate-100 rounded-xl bg-slate-50 px-3 mt-4">
                <span className="font-bold text-slate-600">Elite Only</span>
                <input
                  id="admin-promo-requireselite"
                  type="checkbox"
                  checked={newRequiresElite}
                  onChange={(e) => setNewRequiresElite(e.target.checked)}
                  className="h-4 w-4 text-teal-600"
                />
              </div>
            </div>

            <button
              id="admin-voucher-submit-btn"
              type="submit"
              className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold transition-colors"
            >
              Add Campaign Voucher
            </button>
          </form>

          {/* Active Promo Codes List */}
          <div className="pt-3 border-t border-slate-50 space-y-2">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Active Campaign Index</p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {dbState.promoCodes.map((p) => (
                <div id={`admin-code-row-${p.code}`} key={p.code} className="flex justify-between items-center text-xs bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div>
                    <span className="font-mono font-bold text-slate-800">{p.code}</span>
                    <span className="text-[10px] text-slate-400 ml-2">(-{p.discountPercent}%)</span>
                  </div>
                  <button
                    id={`admin-delete-promo-${p.code}`}
                    onClick={() => onRemovePromoCode(p.code)}
                    className="text-slate-300 hover:text-rose-600"
                    title="Remove Campaign"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DYNAMIC CATEGORIES CREATOR */}
        <div id="admin-category-manager" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-50 pb-2 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FolderPlus className="h-4.5 w-4.5 text-teal-600" />
                <span>Global Category Indexer</span>
              </h3>
            </div>

            {catSuccess && (
              <p id="admin-cat-success" className="text-xs text-emerald-700 bg-emerald-50 rounded-xl p-2.5 font-semibold">
                ✓ Segment successfully committed to the catalog.
              </p>
            )}

            <form id="admin-category-form" onSubmit={handleCategorySubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">New Category Title</label>
                <input
                  id="admin-cat-name-input"
                  type="text"
                  required
                  placeholder="e.g. Ergonomics"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs outline-none focus:border-teal-500"
                />
              </div>
              <button
                id="admin-category-submit-btn"
                type="submit"
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 text-xs font-bold transition-colors"
              >
                Register Category Segment
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <FileSpreadsheet className="h-4 w-4 text-slate-300 shrink-0" />
            <p>Active segments can immediately index new products uploaded by sellers.</p>
          </div>
        </div>

      </div>

      {/* GLOBAL LEDGER AUDITOR WORKSPACE (Feature #10) */}
      <section id="admin-ledger-auditor" className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden space-y-6">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Database className="h-4.5 w-4.5 text-teal-600" />
              <span>Platform Financial Ledger Auditor</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Track, review, and detail checkout receipts and applied merchant promo voucher margins</p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID or buyer email..."
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-100 focus:border-teal-500 focus:bg-white text-xs rounded-xl outline-none transition-all font-medium text-slate-600"
            />
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50 font-mono text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="p-4 font-bold">Checkout ID</th>
                  <th className="p-4 font-bold">Buyer Name</th>
                  <th className="p-4 font-bold">Settled Date</th>
                  <th className="p-4 font-bold">Promo Applied</th>
                  <th className="p-4 font-bold">Final Settlement</th>
                  <th className="p-4 font-bold text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr id={`ledger-row-${order.id}`} key={order.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-800">{order.id}</td>
                      <td className="p-4 font-mono text-slate-500">{order.userName}</td>
                      <td className="p-4 font-mono text-[11px]">{order.date}</td>
                      <td className="p-4">
                        {order.promoCodeApplied ? (
                          <span className="inline-flex items-center rounded-md bg-teal-50 border border-teal-100/50 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-700">
                            {order.promoCodeApplied}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-sans text-[11px] italic">None</span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-extrabold text-emerald-600">${order.total.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <button
                          id={`audit-detail-btn-${order.id}`}
                          onClick={() => setSelectedLedgerOrder(order)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 rounded-lg text-[11px] font-bold text-slate-600 cursor-pointer transition-colors"
                        >
                          Audit Items
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 italic font-sans">
                      No transactional receipts matching query detected in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* REAL-TIME SECURITY LOGS TERMINAL DECK (Feature #10) */}
      <section id="admin-security-terminal" className="rounded-2xl border border-slate-900 bg-slate-950 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Terminal className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-xs text-slate-200 flex items-center gap-1.5">
                <span>Secure-Sys telemetry console v2.01</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              </h3>
              <p className="text-[10px] font-mono text-slate-500">Node ingress logs streaming from live decentralized client frames</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 self-start sm:self-center font-mono">
            <button
              id="terminal-toggle-pause-btn"
              onClick={() => setIsTelemetryPaused(!isTelemetryPaused)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white text-[10px] font-bold cursor-pointer transition-all"
            >
              {isTelemetryPaused ? (
                <>
                  <Play className="h-3 w-3 text-emerald-400" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3 text-amber-400" />
                  <span>Pause</span>
                </>
              )}
            </button>
            <button
              id="terminal-clear-btn"
              onClick={() => setSecurityLogs([])}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-rose-950/20 hover:border-rose-900/50 hover:text-rose-400 text-slate-400 text-[10px] font-bold cursor-pointer transition-all"
            >
              <Trash className="h-3 w-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Live Terminal logs feed */}
        <div className="h-56 overflow-y-auto font-mono text-[10.5px] p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2 select-text selection:bg-teal-500/30">
          {securityLogs.length > 0 ? (
            securityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 hover:bg-white/5 p-1 rounded transition-colors leading-relaxed">
                <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={`shrink-0 font-bold select-none px-1.5 py-0.5 rounded text-[9px] ${
                  log.level === 'SECURE' 
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' 
                    : log.level === 'WARN'
                      ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {log.level}
                </span>
                <span className="text-teal-400 font-bold shrink-0">@{log.source}</span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 italic text-[11px]">
              Console quiet... telemetry paused or history cleared.
            </div>
          )}
        </div>
      </section>

      {/* LEDGER DETAILS AUDIT MODAL DIALOG */}
      {selectedLedgerOrder && (
        <div id="ledger-audit-modal" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 w-full max-w-lg space-y-4 animate-scale-in text-xs">
            
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Receipt Ledger Settlement</h4>
                <p className="text-[10px] text-slate-400 font-medium">Checkout transaction detailed audit sheet</p>
              </div>
              <button
                id="close-audit-modal-btn"
                onClick={() => setSelectedLedgerOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-[11px] text-slate-600">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                <div>
                  <span className="text-slate-400 block font-sans">Reference Voucher ID:</span>
                  <span className="font-bold text-slate-800">{selectedLedgerOrder.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">Buyer Identity:</span>
                  <span className="font-bold text-slate-800">{selectedLedgerOrder.userName}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-1.5">
                <span className="text-slate-400 font-sans">Itemized Settlements:</span>
                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50 bg-slate-50/20">
                  {selectedLedgerOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800 block leading-tight">{item.title}</span>
                        <span className="text-slate-400 text-[10px]">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                      </div>
                      <span className="font-extrabold text-slate-700">${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Voucher Deduction Breakdowns if present */}
              <div className="space-y-1.5 pt-1.5">
                <div className="flex justify-between border-b border-slate-50 pb-1.5 text-[11px]">
                  <span className="text-slate-400 font-sans">Subtotal Gross</span>
                  <span className="font-bold text-slate-800">
                    ${selectedLedgerOrder.items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0).toFixed(2)}
                  </span>
                </div>
                {selectedLedgerOrder.promoCodeApplied && (
                  <div className="flex justify-between border-b border-slate-50 pb-1.5 text-[11px] text-teal-600">
                    <span className="font-sans">Applied Promotion ({selectedLedgerOrder.promoCodeApplied})</span>
                    <span className="font-bold">
                      -${(selectedLedgerOrder.items.reduce((sum: number, i: any) => sum + i.quantity * i.price, 0) - selectedLedgerOrder.total).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-xs">
                  <span className="font-sans font-bold text-slate-800">Final Settled Ledger Payout</span>
                  <span className="font-black text-emerald-600 font-mono text-sm">${selectedLedgerOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              id="confirm-audit-signature-btn"
              onClick={() => setSelectedLedgerOrder(null)}
              className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Sign & Approve Transaction Integrity
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
