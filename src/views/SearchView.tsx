/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SlidersHorizontal, Filter, X, ArrowUpDown, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Product, User } from '../lib/db';
import ProductCard from '../components/ProductCard';

interface SearchViewProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: string[];
  currentUser: User;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function SearchView({
  products,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  currentUser,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: SearchViewProps) {
  // Filters State
  const [selectedBrand, setSelectedBrand] = React.useState('All');
  const [selectedRating, setSelectedRating] = React.useState(0);
  const [minPrice, setMinPrice] = React.useState(0);
  const [maxPrice, setMaxPrice] = React.useState(1500);
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [eliteOnly, setEliteOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('relevant'); // 'relevant', 'price-asc', 'price-desc', 'rating-desc', 'stock-desc', 'reviews-desc'

  const categories = ['All', 'Electronics', 'Wearables', 'Workspace', 'Accessories'];

  // Extract unique brands dynamically
  const brands = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.brand));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Handle resets
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedRating(0);
    setMinPrice(0);
    setMaxPrice(1500);
    setInStockOnly(false);
    setEliteOnly(false);
    setSortBy('relevant');
  };

  // Filter and Sort implementation
  const filteredProducts = React.useMemo(() => {
    let list = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Brand
    if (selectedBrand !== 'All') {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    // Elite Only
    if (eliteOnly) {
      list = list.filter((p) => p.isElite);
    }

    // Rating
    if (selectedRating > 0) {
      list = list.filter((p) => p.rating >= selectedRating);
    }

    // Price Filter
    list = list.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    // In Stock Only
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'stock-desc') {
      list.sort((a, b) => b.stock - a.stock);
    } else if (sortBy === 'reviews-desc') {
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedBrand, eliteOnly, selectedRating, minPrice, maxPrice, inStockOnly, sortBy]);

  return (
    <div id="search-view-container" className="pb-16">
      
      {/* Search Page Header */}
      <div className="border-b border-slate-100 pb-5 mb-8">
        <h2 id="search-view-heading" className="text-2xl font-black text-slate-900 tracking-tight">
          Explore the Bazaar
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* FILTERS COLUMN */}
        <aside id="search-filters-sidebar" className="w-full lg:w-64 shrink-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <Filter className="h-4 w-4 text-teal-600" />
              <span>Refine Catalog</span>
            </div>
            <button
              id="clear-filters-btn"
              onClick={handleResetFilters}
              className="text-[10px] font-semibold text-slate-400 hover:text-teal-600 uppercase tracking-wider transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Search Query Input (redundant for mobile/sync) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Search Keywords</label>
            <input
              id="filters-keyword-input"
              type="text"
              placeholder="e.g. Headphones"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
            />
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">Category segment</label>
            <div className="flex flex-wrap gap-1 lg:flex-col lg:space-y-0.5">
              {categories.map((cat) => (
                <button
                  id={`filter-cat-${cat}`}
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors w-auto lg:w-full ${
                    selectedCategory === cat 
                      ? 'bg-teal-50 text-teal-700 font-bold' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">Manufacturer</label>
            <div className="relative">
              <select
                id="filter-brand-select"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none appearance-none focus:border-teal-500 focus:bg-white cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Price Thresholds</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Min ($)</span>
                <input
                  id="filter-min-price-input"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Max ($)</span>
                <input
                  id="filter-max-price-input"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                />
              </div>
            </div>
            
            {/* Range slider visual */}
            <input
              id="price-range-slider"
              type="range"
              min="0"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>$0</span>
              <span>$1,500</span>
            </div>
          </div>

          {/* Rating filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">Min Rating</label>
            <div className="space-y-1.5">
              {[0, 4.4, 4.6, 4.8].map((score) => (
                <label key={score} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                  <input
                    id={`filter-rating-${score}`}
                    type="radio"
                    name="ratingFilter"
                    checked={selectedRating === score}
                    onChange={() => setSelectedRating(score)}
                    className="h-3.5 w-3.5 border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>{score === 0 ? 'All ratings' : `★ ${score.toFixed(1)} & above`}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stock Availability Toggle */}
          <div className="flex items-center justify-between border-t border-slate-50 pt-4">
            <div className="leading-none">
              <label className="text-xs font-bold text-slate-700">In Stock Only</label>
              <p className="text-[10px] text-slate-400 mt-0.5">Exclude sold out</p>
            </div>
            <button
              id="filter-stock-toggle"
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                inStockOnly ? 'bg-teal-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  inStockOnly ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Elite Toggle */}
          <div className="flex items-center justify-between border-t border-slate-50 pt-4">
            <div className="leading-none">
              <label className="text-xs font-bold text-slate-700">Elite Eligible</label>
              <p className="text-[10px] text-slate-400 mt-0.5">Show Elite items</p>
            </div>
            <button
              id="filter-elite-toggle"
              onClick={() => setEliteOnly(!eliteOnly)}
              className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                eliteOnly ? 'bg-amber-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  eliteOnly ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </aside>

        {/* PRODUCTS RESULTS */}
        <div id="search-results-container" className="flex-1 space-y-6">
          
          {/* Results Actionbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 pl-1">
              Found {filteredProducts.length} items matching your criteria
            </span>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort By</span>
              <div className="relative">
                <select
                  id="search-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 outline-none appearance-none cursor-pointer focus:border-teal-500"
                >
                  <option value="relevant">Relevant</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="stock-desc">Available Stock</option>
                  <option value="reviews-desc">Most Reviewed</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {filteredProducts.length > 0 ? (
            <div id="results-grid" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((prod) => (
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
          ) : (
            <div id="search-empty-state" className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 px-4 text-center bg-white">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <SlidersHorizontal className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Listings Match Filters</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                Try widening your price range, typing broader search terms, or resetting the filter panel on the sidebar.
              </p>
              <button
                id="empty-state-reset-btn"
                onClick={handleResetFilters}
                className="mt-5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
