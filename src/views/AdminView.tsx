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
  FileSpreadsheet
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

    </div>
  );
}
