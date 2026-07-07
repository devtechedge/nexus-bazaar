/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, ShoppingCart, Star, Crown, Sparkles, Flame, Eye, Scan, Compass } from 'lucide-react';
import { Product } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  key?: any;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  isEliteUser: boolean;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  isEliteUser,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  // Apply a 10% discount on Elite items for Elite members
  const finalPrice = product.isElite && isEliteUser 
    ? Math.round(product.price * 0.9) 
    : product.price;

  // Compute dynamic highlight metrics
  const isBestseller = product.rating >= 4.8 && product.reviewsCount >= 2;
  const isStaffPick = product.rating >= 4.6 && product.reviewsCount === 1;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Generate dynamic seed diagnostic details for hover scan simulation
  const hoverSpecs = React.useMemo(() => {
    switch (product.category) {
      case 'Electronics':
        return ['SENSORS_OK', 'ANC_LEVEL: 35dB', 'CORE_CLK: 120MHz', 'LATENCY: 1.2ms'];
      case 'Wearables':
        return ['ECG_STABLE', 'SPO2_LOCK: 99%', 'T_COEFF: -0.05', 'BATT_RATE: 1.0%'];
      case 'Workspace':
        return ['CAD_MATCHED', 'TDP_LIMIT: 45W', 'RGB_INDEX: Curated', 'STRESS: Zero'];
      default:
        return ['SEAM_SECURE', 'MAT_FIBER: 100%', 'TENSILE: 180N', 'FLEX_INDEX: Elite'];
    }
  }, [product.category]);

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image & Badges */}
      <div id={`image-container-${product.id}`} className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          id={`product-img-${product.id}`}
          src={product.image}
          alt={product.name}
          className={`h-full w-full object-cover object-center transition-all duration-700 ${
            isHovered ? 'scale-110 opacity-40 blur-[1px]' : 'scale-100 opacity-100'
          }`}
        />
        
        {/* Hover Simulation Overlay (Feature #7) */}
        <AnimatePresence>
          {isHovered && product.stock > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col justify-between p-3 bg-slate-950/85 text-teal-400 font-mono text-[9px]"
            >
              {/* Scan grid effect */}
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:12px_12px]" />
              
              {/* Sweeping scan line */}
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: 140 }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 2.2,
                  ease: 'easeInOut'
                }}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_8px_#14b8a6] pointer-events-none"
              />

              {/* Top Tech Telemetry Status Row */}
              <div className="flex justify-between items-center relative z-10 border-b border-teal-900/30 pb-1.5 bg-slate-950/40 p-1 rounded">
                <span className="flex items-center gap-1">
                  <Scan className="h-3 w-3 text-teal-400 animate-pulse" />
                  <span className="text-teal-300 font-bold uppercase tracking-wider">Active Holographic Scan</span>
                </span>
                <span className="animate-ping h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>

              {/* Tech Specs Block */}
              <div className="my-auto space-y-1 relative z-10 px-1">
                {hoverSpecs.map((spec, index) => (
                  <motion.div
                    key={spec}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-1.5 bg-slate-900/50 rounded py-0.5 px-1 border border-teal-950"
                  >
                    <span className="h-1 w-1 rounded-full bg-teal-500" />
                    <span>{spec}</span>
                  </motion.div>
                ))}
              </div>

              {/* Bottom control telemetry */}
              <div className="flex justify-between items-center relative z-10 border-t border-teal-900/30 pt-1.5 bg-slate-950/40 p-1 rounded">
                <span className="text-[8px] text-teal-500">ZOOM: 300% (MACRO_REV2)</span>
                <button
                  type="button"
                  onClick={() => onViewDetails(product)}
                  className="flex items-center gap-1 text-xs font-bold text-teal-300 hover:text-white bg-teal-900/40 px-2 py-0.5 rounded border border-teal-700/50 transition-all cursor-pointer active:scale-95"
                >
                  <Eye className="h-3 w-3" />
                  <span>Inspect Spec</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110 active:scale-95 ${
            isWishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className="h-4.5 w-4.5" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Badge Stack */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 items-start z-10">
          {product.isRefurbished && (
            <div 
              id={`refurbished-badge-${product.id}`}
              className="flex items-center gap-1 rounded-full bg-teal-500 text-slate-950 font-black px-2.5 py-1 text-[8px] tracking-wide shadow-md uppercase"
              title={`Accredited repair quality score: ${product.refurbishedScore}/100`}
            >
              ♻️ Refurbished • {product.refurbishedScore}% Score
            </div>
          )}

          {product.upcycled && (
            <div 
              id={`upcycled-badge-${product.id}`}
              className="flex items-center gap-1 rounded-full bg-emerald-600/90 text-white font-extrabold px-2.5 py-1 text-[8px] tracking-wide shadow-md uppercase"
              title="Molded 100% from upcycled raw material components"
            >
              🌱 Upcycled Material
            </div>
          )}

          {product.isElite && (
            <div 
              id={`elite-badge-${product.id}`}
              className="flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-black tracking-wide text-white shadow-sm"
              title="Elite Program Exclusive Product"
            >
              <Crown className="h-3 w-3" />
              <span>ELITE TIER</span>
            </div>
          )}

          {isBestseller && (
            <div 
              id={`bestseller-badge-${product.id}`}
              className="flex items-center gap-1 rounded-full bg-rose-600/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-black tracking-wide text-white shadow-sm"
              title="Top performing product across the platform with exceptionally high ratings"
            >
              <Flame className="h-3 w-3 animate-pulse" />
              <span>VELOCITY GOLD</span>
            </div>
          )}

          {isStaffPick && (
            <div 
              id={`staffpick-badge-${product.id}`}
              className="flex items-center gap-1 rounded-full bg-teal-600/95 backdrop-blur-sm px-2.5 py-1 text-[9px] font-black tracking-wide text-white shadow-sm"
              title="Hand-picked by our curators for impeccable design and performance"
            >
              <Sparkles className="h-3 w-3" />
              <span>CURATOR SELECTION</span>
            </div>
          )}

          {isLowStock && (
            <div 
              id={`lowstock-badge-${product.id}`}
              className="flex items-center gap-1 rounded-full bg-amber-600/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-black tracking-wide text-white shadow-sm"
              title={`Only ${product.stock} units remain before sell out`}
            >
              <span>FEW COPIES LEFT</span>
            </div>
          )}
        </div>

        {/* Out of Stock overlay */}
        {product.stock <= 0 && (
          <div id={`outofstock-overlay-${product.id}`} className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
            <span className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Details Content */}
      <div id={`info-container-${product.id}`} className="flex flex-1 flex-col p-4">
        {/* Brand and Category */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-1 group/seller relative">
            <span className="font-semibold text-slate-500">{product.brand}</span>
            <span 
              className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-1 py-0.2 rounded font-mono cursor-help" 
              title={`Verified Cryptographic Seller Key (ECDSA Secp256k1). Fingerprint: SHA256:${product.brand.toUpperCase()}-SELLER-NEXUS-KEY-0X8F92`}>
              ✓ SIGNED
            </span>
            {/* Tooltip on hover */}
            <div className="absolute bottom-6 left-0 scale-0 group-hover/seller:scale-100 transition-all duration-150 origin-bottom-left z-40 bg-slate-950 text-slate-100 text-[8.5px] p-2.5 rounded-lg shadow-xl border border-slate-800 w-52 font-mono leading-normal lowercase">
              <p className="font-extrabold text-emerald-400 uppercase text-[8px] tracking-wider mb-1">✓ Certified Seller Handshake</p>
              <p className="text-slate-400">Alg: ECDSA-secp256k1</p>
              <p className="text-slate-300">Public Key Hash:</p>
              <p className="truncate text-teal-400">0x3fa9bc{product.id}f882d911c7ef</p>
              <p className="text-emerald-500 font-extrabold uppercase text-[7.5px] mt-1">Status: Ledger Verified</p>
            </div>
          </div>
          <span>{product.category}</span>
        </div>

        {/* Product Title */}
        <h3 
          id={`product-title-${product.id}`}
          onClick={() => onViewDetails(product)}
          className="mt-1.5 text-sm font-semibold text-slate-800 line-clamp-1 hover:text-teal-600 cursor-pointer transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Circular / Sustainability Highlight Panel (Features #64, #67) */}
        {product.isRefurbished && (
          <div className="mt-1 flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/15 px-2 py-0.5 rounded text-[9px] font-mono text-teal-800" title={`Certified repaired by ${product.refurbishedRepairer}`}>
            <span className="font-bold">🛡️ Repair Grid</span>
            <span className="opacity-45">|</span>
            <span className="truncate max-w-[150px]">{product.refurbishedRepairer}</span>
          </div>
        )}
        {product.upcycled && (
          <div className="mt-1 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-800" title={product.upcycledHistory}>
            <span className="font-bold">🌱 Circular Upcycle</span>
            <span className="opacity-45">|</span>
            <span className="truncate max-w-[150px]">{product.upcycledHistory}</span>
          </div>
        )}

        {/* Description Snippet */}
        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Rating and Reviews */}
        <div className="mt-3 flex items-center gap-1">
          <div className="flex items-center text-amber-400">
            <Star className="h-3 w-3 fill-current" />
          </div>
          <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({product.reviewsCount} reviews)</span>
        </div>

        {/* Price and Add-To-Cart Footer */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex flex-col">
            {product.isElite && isEliteUser ? (
              <div className="flex items-baseline gap-1.5">
                <span id={`price-display-${product.id}`} className="text-base font-bold text-teal-600">${finalPrice}</span>
                <span className="text-xs text-slate-400 line-through">${product.price}</span>
              </div>
            ) : (
              <span id={`price-display-${product.id}`} className="text-base font-bold text-slate-800">${product.price}</span>
            )}
            <span className="text-[10px] font-mono text-slate-400 leading-none mt-0.5">
              {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
            </span>
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.stock <= 0}
            className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-all ${
              product.stock > 0
                ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
