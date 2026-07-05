/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Crown, Tag, ArrowRight, Layers, Heart, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Product, PromoCode, User, UserRole } from '../lib/db';
import ProductCard from '../components/ProductCard';

interface StorefrontViewProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: string[];
  currentUser: User;
  promoCodes: PromoCode[];
  setActiveView: (view: any) => void;
  setSelectedCategory: (category: string) => void;
  onToggleElite: () => void;
}

export default function StorefrontView({
  products,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  currentUser,
  promoCodes,
  setActiveView,
  setSelectedCategory,
  onToggleElite,
}: StorefrontViewProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  // List unique categories dynamically
  const categories = ['Electronics', 'Wearables', 'Workspace', 'Accessories'];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setActiveView('search');
  };

  return (
    <div id="storefront-view-container" className="space-y-12 pb-16">
      
      {/* 1. HERO BANNER */}
      <section id="storefront-hero" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 py-16 px-6 sm:px-12 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.15),transparent_50%)]"></div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-mono font-bold text-teal-400 border border-teal-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>PLATFORM ONLINE v2.1</span>
          </div>
          <h2 id="hero-heading" className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            The Multi-Role <br />
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">E-Commerce Arena</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
            Experience role-based execution as a Buyer searching and checking out, a Seller organizing custom listings, or an Admin managing global platform memberships.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              id="hero-explore-btn"
              onClick={() => { setSelectedCategory('All'); setActiveView('search'); }}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-teal-700/20 hover:bg-teal-500 active:scale-95 transition-all"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            {currentUser.role === UserRole.Buyer && (
              <button
                id="hero-toggle-elite-btn"
                onClick={() => setActiveView('search')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-md px-5 py-3 text-sm font-semibold hover:bg-white/20 active:scale-95 transition-all border border-white/15"
              >
                <Crown className="text-amber-400 h-4 w-4" />
                <span>Shop Elite Products</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SHORTCUTS */}
      <section id="storefront-categories" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Browse Premium Segments</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter the bazaar directly by curated product collections</p>
          </div>
          <button 
            id="all-categories-link" 
            onClick={() => handleCategoryClick('All')}
            className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div id="categories-grid" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat, i) => (
            <div
              id={`category-card-${cat}`}
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-teal-500/20 text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-teal-50 text-slate-600 group-hover:text-teal-600 transition-colors">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                {cat}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                {products.filter(p => p.category === cat).length} Listing(s)
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ACTIVE PROMO CODES */}
      <section id="storefront-promos" className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Active Platform Vouchers</h3>
          <p className="text-xs text-slate-400 mt-0.5">Click a coupon card to copy its promo code and apply it during checkout</p>
        </div>
        <div id="promos-grid" className="grid gap-4 sm:grid-cols-3">
          {promoCodes.map((promo) => {
            const isEligible = !promo.requiresElite || currentUser.isElite;
            return (
              <div
                id={`promo-card-${promo.code}`}
                key={promo.code}
                onClick={() => isEligible && handleCopyCode(promo.code)}
                className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
                  isEligible 
                    ? 'bg-white border-slate-100 hover:border-teal-500 hover:shadow-sm cursor-pointer' 
                    : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${promo.requiresElite ? 'bg-amber-50 text-amber-500' : 'bg-teal-5 text-teal-600'}`}>
                      <Tag className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-mono text-sm font-bold text-slate-800">{promo.code}</span>
                      {promo.requiresElite && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold text-amber-800">
                          <Crown className="h-2 w-2" />
                          <span>ELITE</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-black text-teal-600">-{promo.discountPercent}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-3 font-medium">{promo.description}</p>
                
                {promo.minSubtotal && (
                  <p className="text-[10px] font-mono text-slate-400 mt-1">Min. order: ${promo.minSubtotal}</p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    {!isEligible ? 'ELITE STATUS REQUIRED' : copiedCode === promo.code ? 'COPIED!' : 'CLICK TO COPY'}
                  </span>
                  {isEligible && (
                    <span className="text-xs font-semibold text-teal-600 group-hover:underline">Use Code</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section id="storefront-featured" className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Current Spotlight Listings</h3>
          <p className="text-xs text-slate-400 mt-0.5">High-quality, verified gear with fast priority shipping logistics</p>
        </div>
        <div id="featured-products-grid" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onViewDetails={onViewDetails}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(prod.id)}
              isEliteUser={currentUser.isElite}
            />
          ))}
        </div>
      </section>

      {/* 5. ELITE MEMBERSHIP HUB (Feature #13) */}
      <section 
        id="elite-membership-hub" 
        className={`rounded-3xl border p-6 sm:p-8 transition-all relative overflow-hidden ${
          currentUser.isElite 
            ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white border-amber-500/30 shadow-lg shadow-amber-500/5' 
            : 'bg-white border-slate-100 shadow-sm'
        }`}
      >
        {/* Glow effects for Elite members */}
        {currentUser.isElite && (
          <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
        )}
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                currentUser.isElite ? 'bg-amber-500 text-slate-950' : 'bg-amber-50 text-amber-500'
              }`}>
                <Crown className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                  currentUser.isElite ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  Nexus Premium Class
                </span>
                <h4 className={`font-black text-lg sm:text-xl tracking-tight ${
                  currentUser.isElite ? 'text-white' : 'text-slate-950'
                }`}>
                  {currentUser.isElite ? 'You are an Active Elite Member' : 'Join the Nexus Elite Premium Program'}
                </h4>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${
              currentUser.isElite ? 'text-slate-300' : 'text-slate-500'
            }`}>
              Our premium tier offers complete legal security, decentralized speed, and premium financial benefits. Elite accounts unlock flat rate discounts, exclusive coupons, and priority logistics dispatch channels automatically.
            </p>

            {/* Perks Grid */}
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className={currentUser.isElite ? 'text-slate-200' : 'text-slate-600'}>Flat 10% Off Elite Listings</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className={currentUser.isElite ? 'text-slate-200' : 'text-slate-600'}>Instant $0 Standard Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className={currentUser.isElite ? 'text-slate-200' : 'text-slate-600'}>ELITEPRO Promo Vouchers</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className={currentUser.isElite ? 'text-slate-200' : 'text-slate-600'}>Priority Express drone delivery</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              id="hub-elite-toggle-btn"
              onClick={onToggleElite}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm ${
                currentUser.isElite
                  ? 'bg-slate-800 text-amber-400 border border-amber-400/20 hover:bg-slate-750'
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/15'
              }`}
            >
              <Crown className="h-4 w-4" />
              <span>{currentUser.isElite ? 'Relinquish Elite Benefits' : 'Become an Elite Member'}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
