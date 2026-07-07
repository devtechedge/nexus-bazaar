/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Heart, 
  Users, 
  ShieldCheck, 
  Crown,
  Sparkles,
  LogOut,
  SlidersHorizontal,
  Package
} from 'lucide-react';
import { User, UserRole } from '../lib/db';

interface HeaderProps {
  currentUser: User;
  usersList: User[];
  onSwitchUser: (userId: string) => void;
  onToggleElite: () => void;
  cartCount: number;
  wishlistCount: number;
  activeView: string;
  setActiveView: (view: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({
  currentUser,
  usersList,
  onSwitchUser,
  onToggleElite,
  cartCount,
  wishlistCount,
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
}: HeaderProps) {
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveView('search');
  };

  return (
    <header id="app-header" className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo / Brand */}
        <div 
          id="header-brand-container" 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => { setActiveView('storefront'); setSearchQuery(''); }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
            <ShoppingBag id="logo-icon" className="h-5 w-5" />
          </div>
          <div>
            <h1 id="brand-title" className="text-xl font-bold tracking-tight text-slate-900">
              Nexus<span className="text-teal-600">Bazaar</span>
            </h1>
            <p id="brand-tagline" className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">
              Role-Led Market
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <form id="header-search-form" onSubmit={handleSearchSubmit} className="hidden max-w-md flex-1 px-8 md:block">
          <div className="relative">
            <input
              id="header-search-input"
              type="text"
              placeholder="Search premium electronics, workspace gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm text-slate-800 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/15"
            />
            <button
              id="header-search-button"
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Navigation Actions */}
        <nav id="header-navigation" className="flex items-center gap-2 sm:gap-4">
          
          {/* Main Store Link */}
          <button
            id="nav-storefront-btn"
            onClick={() => setActiveView('storefront')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeView === 'storefront' ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Storefront
          </button>

          <button
            id="nav-search-btn"
            onClick={() => setActiveView('search')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors md:hidden ${
              activeView === 'search' ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Browse
          </button>

          {/* Seller view button */}
          {(currentUser.role === UserRole.Seller || currentUser.role === UserRole.Admin) && (
            <button
              id="nav-seller-btn"
              onClick={() => setActiveView('seller')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeView === 'seller' ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Seller Hub</span>
            </button>
          )}

          {/* Admin view button */}
          {currentUser.role === UserRole.Admin && (
            <button
              id="nav-admin-btn"
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeView === 'admin' ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>
          )}

          {/* Order history */}
          <button
            id="nav-orders-btn"
            onClick={() => setActiveView('orders')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeView === 'orders' ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Orders</span>
          </button>

          {/* Curations */}
          <button
            id="nav-curations-btn"
            onClick={() => setActiveView('curations')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeView === 'curations' ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            Curations
          </button>

          {/* Loyalty Hub */}
          <button
            id="nav-loyalty-btn"
            onClick={() => setActiveView('loyalty')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeView === 'loyalty' ? 'text-teal-600 bg-teal-50 font-bold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            Loyalty Hub
          </button>

          {/* Security Vault */}
          <button
            id="nav-security-btn"
            onClick={() => setActiveView('security')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeView === 'security' ? 'text-teal-600 bg-teal-50 font-bold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            Security Vault
          </button>

          {/* Guilds */}
          <button
            id="nav-guilds-btn"
            onClick={() => setActiveView('guilds')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeView === 'guilds' ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            Guilds
          </button>

          {/* Styling Lab */}
          <button
            id="nav-styling-btn"
            onClick={() => setActiveView('styling')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeView === 'styling' ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            Styling Lab
          </button>

          <div className="h-4 w-[1px] bg-slate-200"></div>

          {/* Wishlist Link */}
          <button
            id="nav-wishlist-btn"
            onClick={() => setActiveView('wishlist')}
            className={`relative rounded-lg p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
              activeView === 'wishlist' ? 'text-rose-600 bg-rose-50' : ''
            }`}
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span id="wishlist-badge" className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Link */}
          <button
            id="nav-cart-btn"
            onClick={() => setActiveView('cart')}
            className={`relative rounded-lg p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors ${
              activeView === 'cart' ? 'text-teal-600 bg-teal-50' : ''
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span id="cart-badge" className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <div className="h-4 w-[1px] bg-slate-200"></div>

          {/* Elite Tier Toggle */}
          <button
            id="elite-tier-toggle-btn"
            onClick={onToggleElite}
            className={`group relative flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
              currentUser.isElite 
                ? 'bg-amber-500 border-amber-600 text-white shadow-sm hover:bg-amber-600' 
                : 'bg-white border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500'
            }`}
            title={currentUser.isElite ? 'Elite Member Benefits Active!' : 'Upgrade to Elite Member (Mock)'}
          >
            <Crown className="h-4 w-4" />
            {currentUser.isElite && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </button>

          {/* Role/Session switcher dropdown */}
          <div className="relative">
            <button
              id="role-switcher-toggle"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 rounded-full bg-slate-100 p-1 pr-3 hover:bg-slate-200 transition-colors"
            >
              <img
                id="active-user-avatar"
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-7 w-7 rounded-full object-cover border border-white"
              />
              <div className="text-left leading-none hidden sm:block">
                <p id="active-user-name" className="text-xs font-semibold text-slate-800">{currentUser.name}</p>
                <p id="active-user-role" className="text-[9px] font-mono font-bold text-teal-600 uppercase mt-0.5">{currentUser.role}</p>
              </div>
            </button>

            {showRoleMenu && (
              <>
                <div id="role-menu-backdrop" className="fixed inset-0 z-10" onClick={() => setShowRoleMenu(false)}></div>
                <div id="role-menu-dropdown" className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 z-20">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Active Identity</p>
                    <p className="text-xs font-semibold text-slate-800">{currentUser.name}</p>
                  </div>
                  <div className="space-y-0.5">
                    {usersList.map((usr) => (
                      <button
                        id={`switch-user-${usr.id}`}
                        key={usr.id}
                        onClick={() => {
                          onSwitchUser(usr.id);
                          setShowRoleMenu(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          currentUser.id === usr.id 
                            ? 'bg-teal-50 text-teal-700 font-semibold' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <img src={usr.avatar} alt={usr.name} className="h-6 w-6 rounded-full object-cover" />
                        <div className="flex-1">
                          <p>{usr.name}</p>
                          <p className="text-[9px] font-mono text-slate-400">{usr.role} {usr.isElite && '• Elite'}</p>
                        </div>
                        {currentUser.id === usr.id && <span className="h-1.5 w-1.5 rounded-full bg-teal-600"></span>}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 px-1">
                    <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
                      <span>Mock System</span>
                      <span className="font-mono text-emerald-500">Active</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

        </nav>
      </div>
    </header>
  );
}
