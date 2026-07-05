/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Trash2, ShoppingCart, ArrowLeft, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { Product } from '../lib/db';

interface WishlistViewProps {
  products: Product[];
  wishlist: string[];
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToCart: (productId: string) => void;
  onViewDetails: (product: Product) => void;
  setActiveView: (view: any) => void;
}

export default function WishlistView({
  products,
  wishlist,
  onRemoveFromWishlist,
  onMoveToCart,
  onViewDetails,
  setActiveView,
}: WishlistViewProps) {
  const wishlistedProducts = React.useMemo(() => {
    return wishlist
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);
  }, [wishlist, products]);

  const handleClearWishlist = () => {
    wishlistedProducts.forEach((p) => {
      onRemoveFromWishlist(p.id);
    });
  };

  return (
    <div id="wishlist-view-container" className="space-y-8 pb-16 animate-fade-in">
      {/* Back to Storefront Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <button
            id="wishlist-back-btn"
            onClick={() => setActiveView('storefront')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-teal-600 uppercase tracking-wider transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Storefront</span>
          </button>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
            <span>My Curated Wishlist</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Save items to purchase later. Your selections are cached locally in your session.
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <button
            id="clear-wishlist-btn"
            onClick={handleClearWishlist}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 active:scale-95 transition-all text-center self-start sm:self-center"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {wishlistedProducts.length === 0 ? (
        <div id="wishlist-empty-slate" className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 px-4 bg-white text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Browse the catalog, examine premium gear, and click the heart icon to save products to your selection list.
          </p>
          <button
            id="wishlist-empty-explore-btn"
            onClick={() => setActiveView('search')}
            className="mt-6 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div id="wishlist-grid" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistedProducts.map((product) => (
            <div
              id={`wish-card-${product.id}`}
              key={product.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Product Card Top: Image and badges */}
              <div className="space-y-3">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.isElite && (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-amber-500 px-2 py-1 text-[8px] font-black text-white shadow-sm uppercase tracking-wide">
                      Elite Perks
                    </span>
                  )}
                  <button
                    id={`wishlist-remove-icon-${product.id}`}
                    onClick={() => onRemoveFromWishlist(product.id)}
                    className="absolute right-2.5 top-2.5 rounded-full bg-white/95 p-1.5 text-rose-500 hover:text-rose-600 hover:scale-110 active:scale-95 shadow-sm transition-all"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Specs */}
                <div className="leading-tight">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                    {product.brand}
                  </span>
                  <h3
                    onClick={() => onViewDetails(product)}
                    className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-teal-600 cursor-pointer mt-0.5"
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Product Card Bottom: Price and Add-to-cart */}
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-slate-400 block uppercase">Price tag</span>
                  <span className="text-sm font-black text-slate-800 font-mono">${product.price}</span>
                </div>

                <div className="flex gap-1.5">
                  <button
                    id={`wishlist-add-cart-${product.id}`}
                    onClick={() => onMoveToCart(product.id)}
                    disabled={product.stock <= 0}
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-teal-700 active:scale-95 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    <span>{product.stock > 0 ? 'Add To Cart' : 'Sold Out'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
