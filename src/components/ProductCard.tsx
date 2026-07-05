/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, ShoppingCart, Star, Crown, Sparkles, Flame } from 'lucide-react';
import { Product } from '../lib/db';

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
  // Apply a 10% discount on Elite items for Elite members
  const finalPrice = product.isElite && isEliteUser 
    ? Math.round(product.price * 0.9) 
    : product.price;

  // Compute dynamic highlight metrics
  const isBestseller = product.rating >= 4.8 && product.reviewsCount >= 2;
  const isStaffPick = product.rating >= 4.6 && product.reviewsCount === 1;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-200"
    >
      {/* Product Image & Badges */}
      <div id={`image-container-${product.id}`} className="relative aspect-video w-full overflow-hidden bg-slate-50">
        <img
          id={`product-img-${product.id}`}
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110 active:scale-95 ${
            isWishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className="h-4.5 w-4.5" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Badge Stack */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 items-start z-10">
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
          <div id={`outofstock-overlay-${product.id}`} className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
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
          <span>{product.brand}</span>
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
