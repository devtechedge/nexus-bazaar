/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Crown, Tag, ArrowRight, Layers, Heart, ShoppingBag, ShieldCheck, Radio, Tv, Flame, Play, Volume2, Video, Plus, Eye } from 'lucide-react';
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
  liveAuctions?: any[];
  onPlaceAuctionBid?: (auctionId: string, bidAmount: number) => void;
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
  liveAuctions = [],
  onPlaceAuctionBid,
}: StorefrontViewProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  // BATCH 4 STATE - active slide for lookbook canvas
  const [activeLookbookScene, setActiveLookbookScene] = React.useState(0);
  const [selectedHotspot, setSelectedHotspot] = React.useState<string | null>(null);

  // BATCH 4 STATE - active playing reel index
  const [activeReelIndex, setActiveReelIndex] = React.useState(0);
  const [reelLikes, setReelLikes] = React.useState<number[]>([1420, 890, 2450]);
  const [hasLikedReel, setHasLikedReel] = React.useState<boolean[]>([false, false, false]);

  // Local state for user bidding input
  const [userBids, setUserBids] = React.useState<{ [key: string]: number }>({});

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

      {/* 31. SYNCHRONOUS LIVE AUCTION STREAMS */}
      {liveAuctions.filter(auc => !auc.isCompleted && auc.timeLeft > 0).length > 0 && (
        <section id="live-auctions-feed" className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
                <span>🎙️ Live Stream & Active Auctions</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time sub-second synced auctions transmitting directly from merchant garages</p>
            </div>
            <div className="font-mono text-[10px] text-rose-500 font-bold bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
              ● SYNC ACTIVE
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {liveAuctions.filter(auc => !auc.isCompleted && auc.timeLeft > 0).map((auc) => (
              <div key={auc.id} className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm flex flex-col md:flex-row">
                {/* Visual Video Stream Simulation */}
                <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto bg-slate-950 flex items-center justify-center overflow-hidden min-h-[160px]">
                  <img src={auc.product.image} alt={auc.product.name} className="absolute inset-0 h-full w-full object-cover opacity-35" />
                  <div className="absolute top-3 left-3 bg-rose-600 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-white animate-ping"></span>
                    <span>STREAMING</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                    👁️ {auc.bidsCount * 3 + 18} watchers
                  </div>

                  <div className="relative text-center p-4 z-10 space-y-1">
                    <Radio className="h-8 w-8 text-rose-500 mx-auto animate-pulse" />
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Host: {auc.sellerName}</p>
                    <p className="text-[11px] text-white/90 font-medium italic">"{auc.product.description.slice(0, 70)}..."</p>
                  </div>

                  {/* Sub-second Live Bids Stream Ticker */}
                  <div className="absolute bottom-2 left-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[9px] font-mono text-slate-300 flex justify-between items-center border border-slate-800">
                    <span className="truncate">Last Bidder: <strong className="text-teal-400">{auc.highestBidder}</strong></span>
                    <span className="font-extrabold text-emerald-400 shrink-0">${auc.currentBid}</span>
                  </div>
                </div>

                {/* Bidding Controls */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Current Highest Bid</span>
                      <span className="text-rose-500 font-mono text-xs font-bold animate-pulse">
                        ⌛ {Math.floor(auc.timeLeft / 60)}:{(auc.timeLeft % 60).toString().padStart(2, '0')} left
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-800 tracking-tight font-mono">${auc.currentBid}</span>
                      <span className="text-[10px] font-mono text-slate-400">({auc.bidsCount} bids submitted)</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-700 mt-2 line-clamp-1">{auc.product.name}</h4>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (onPlaceAuctionBid) {
                        const bidVal = userBids[auc.id] || (auc.currentBid + 10);
                        onPlaceAuctionBid(auc.id, Number(bidVal));
                      }
                    }} 
                    className="space-y-2 text-xs"
                  >
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold font-mono">$</span>
                        <input 
                          type="number"
                          placeholder={`${auc.currentBid + 10}`}
                          value={userBids[auc.id] || ''}
                          onChange={(e) => setUserBids(prev => ({ ...prev, [auc.id]: Number(e.target.value) }))}
                          className="w-full pl-6 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-rose-500 font-mono font-bold"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl active:scale-95 transition-all uppercase tracking-wider shadow-md shadow-rose-600/10"
                      >
                        Place Bid
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-normal font-medium">Bids are verified securely via distributed Ledger records. Wins are locked automatically.</p>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 34. IMMERSIVE LOOKBOOK CANVAS */}
      <section id="lookbook-section" className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Flame className="h-5 w-5 text-teal-600 animate-pulse" />
            <span>Immersive Lookbook Canvas</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Explore premium custom gear set pieces inside their styled high-fidelity environments</p>
        </div>

        {/* Parallax Lookbook Viewfinder */}
        {(() => {
          const lookbookScenes = [
            {
              title: "Slate-Core Workstation",
              theme: "Minimalist Slate/Charcoal setup designed for professional developers",
              image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=1200&auto=format&fit=crop&q=80",
              hotspots: [
                { id: "hotspot_1", label: "Aether-X ANC Headset", price: 249, top: "25%", left: "45%", productId: "prod_1" },
                { id: "hotspot_2", label: "CoreGrip Pro Mouse", price: 89, top: "68%", left: "70%", productId: "prod_2" }
              ]
            },
            {
              title: "Nightshade Gaming Pod",
              theme: "Immersive magenta/neon cyber room for competitive gamers",
              image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
              hotspots: [
                { id: "hotspot_3", label: "Apex Mechanical Keyboard", price: 179, top: "50%", left: "35%", productId: "prod_3" },
                { id: "hotspot_4", label: "Resonator Surround Speakers", price: 349, top: "15%", left: "80%", productId: "prod_4" }
              ]
            }
          ];

          const currentScene = lookbookScenes[activeLookbookScene];

          return (
            <div className="relative rounded-3xl border border-slate-100 overflow-hidden bg-slate-900 shadow-sm aspect-[16/9] md:aspect-[21/9] flex flex-col justify-end">
              {/* Background with custom smooth parallax slide */}
              <img 
                src={currentScene.image} 
                alt={currentScene.title} 
                className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-1000 ease-out scale-105"
              />

              {/* Hotspot Pins */}
              {currentScene.hotspots.map((spot) => {
                const targetProduct = products.find(p => p.id === spot.productId);
                const isSelected = selectedHotspot === spot.id;

                return (
                  <div 
                    key={spot.id} 
                    className="absolute z-20"
                    style={{ top: spot.top, left: spot.left }}
                  >
                    <button
                      onClick={() => setSelectedHotspot(isSelected ? null : spot.id)}
                      className="h-8 w-8 rounded-full bg-teal-500/80 backdrop-blur-md text-white border border-teal-300 flex items-center justify-center font-bold hover:scale-110 active:scale-90 transition-all shadow-lg animate-ping-subtle"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    {/* Popover Card */}
                    {isSelected && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-2xl p-4 w-48 shadow-2xl border border-slate-800 animate-scale-in text-xs space-y-2 z-50">
                        <p className="font-bold tracking-tight">{spot.label}</p>
                        <p className="font-mono text-teal-400 font-extrabold">${spot.price}</p>
                        <div className="flex gap-2 pt-1">
                          {targetProduct && (
                            <button
                              onClick={() => {
                                onAddToCart(targetProduct);
                                alert(`Added "${targetProduct.name}" to your cart directly from the Lookbook!`);
                              }}
                              className="flex-1 py-1 bg-teal-600 hover:bg-teal-500 text-[10px] font-bold rounded-lg text-center shadow transition-all active:scale-95"
                            >
                              Add to Cart
                            </button>
                          )}
                          {targetProduct && (
                            <button
                              onClick={() => onViewDetails(targetProduct)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                              title="Inspect Details"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Controls bar overlaid at bottom */}
              <div className="relative z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-teal-400 font-bold uppercase tracking-widest">Active Curated Scene</span>
                  <h4 className="font-black text-lg tracking-tight">{currentScene.title}</h4>
                  <p className="text-xs text-slate-300 max-w-md">{currentScene.theme}</p>
                </div>

                <div className="flex items-center gap-2">
                  {lookbookScenes.map((scene, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveLookbookScene(i); setSelectedHotspot(null); }}
                      className={`h-2.5 rounded-full transition-all duration-300 ${activeLookbookScene === i ? 'w-8 bg-teal-500' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
                      title={scene.title}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* 35. INSTANT VIDEO SHOPPABLE REELS FEED */}
      <section id="shoppable-reels-section" className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Video className="h-5 w-5 text-purple-600" />
            <span>Instant Video Shoppable Feed</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Scroll through short demonstrations and purchase directly with high-efficiency overlays</p>
        </div>

        {(() => {
          const shoppableReels = [
            {
              id: "reel_1",
              title: "Unboxing the special edition Silver headset!",
              creator: "@CircuitReviews",
              views: "18.4K",
              videoPlaceholder: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&auto=format&fit=crop&q=60",
              product: products.find(p => p.id === 'prod_1') || products[0]
            },
            {
              id: "reel_2",
              title: "Testing mechanical switch resistance under extreme key pressure.",
              creator: "@SwitchKing",
              views: "12.1K",
              videoPlaceholder: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=60",
              product: products.find(p => p.id === 'prod_3') || products[1] || products[0]
            },
            {
              id: "reel_3",
              title: "Minimalist workspace desk makeover step-by-step.",
              creator: "@AestheticDesks",
              views: "34.5K",
              videoPlaceholder: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&auto=format&fit=crop&q=60",
              product: products.find(p => p.id === 'prod_2') || products[0]
            }
          ];

          const currentReel = shoppableReels[activeReelIndex];

          return (
            <div className="grid gap-6 md:grid-cols-12">
              {/* Short Reel Video Box (8 cols) */}
              <div className="md:col-span-8 rounded-3xl border border-slate-100 overflow-hidden bg-slate-950 relative aspect-video flex items-center justify-center">
                <img src={currentReel.videoPlaceholder} alt={currentReel.title} className="absolute inset-0 h-full w-full object-cover opacity-50 blur-xs scale-105" />
                <div className="absolute inset-0 bg-slate-950/40"></div>

                {/* Simulated video playback controls */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25 hover:scale-110 active:scale-95 transition-all cursor-pointer">
                    <Play className="h-6 w-6 text-white fill-white translate-x-0.5" />
                  </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-5 left-5 right-5 text-white space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                    <span className="text-[10px] font-mono text-slate-300 tracking-wider">Shoppable Video Demonstration</span>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base tracking-tight leading-snug">{currentReel.title}</h4>
                  <p className="text-xs text-slate-400 font-medium">{currentReel.creator} • {currentReel.views} views</p>
                </div>
              </div>

              {/* Shoppable Product Sidebar Attachment (4 cols) */}
              <div className="md:col-span-4 rounded-3xl border border-slate-100 bg-white p-5 flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-mono text-purple-600 font-black uppercase tracking-wider">Featured in Video</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-0.5">Quick Purchase Drawer</h4>
                  </div>

                  {currentReel.product && (
                    <div className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                        <img src={currentReel.product.image} alt={currentReel.product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h5 className="font-bold text-slate-800 truncate">{currentReel.product.name}</h5>
                        <p className="font-mono text-emerald-600 font-black text-sm">${currentReel.product.price}</p>
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-extrabold text-emerald-800 uppercase">
                          Free Express Payout
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4">
                  {currentReel.product && (
                    <button
                      onClick={() => {
                        onAddToCart(currentReel.product);
                        alert(`Successfully added "${currentReel.product.name}" to your cart! You purchased directly from the Video Feed.`);
                      }}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl active:scale-95 transition-all text-xs uppercase tracking-wider shadow-md shadow-purple-600/10 flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Instant Add to Cart</span>
                    </button>
                  )}

                  {/* Feed Navigation */}
                  <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                    <span className="text-[10px] font-mono text-slate-400">Reel {activeReelIndex + 1} of 3</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setActiveReelIndex(prev => (prev === 0 ? shoppableReels.length - 1 : prev - 1))}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 font-bold"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setActiveReelIndex(prev => (prev === shoppableReels.length - 1 ? 0 : prev + 1))}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 font-bold"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
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
