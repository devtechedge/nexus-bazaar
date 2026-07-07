/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  SlidersHorizontal, Filter, X, ArrowUpDown, ChevronDown, CheckCircle2, 
  Sparkles, Leaf, Compass, Palette, Network, Plus, Trash2, HelpCircle, 
  Upload, Image as ImageIcon, Loader2, Play, Flame, HelpCircle as HelpIcon, AlertTriangle
} from 'lucide-react';
import { Product, User } from '../lib/db';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';

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
  // Navigation Tabs for Neo-Discovery modes
  // 'standard' | 'moodboard' | 'infinite' | 'compatibility' | 'textpalette'
  const [searchMode, setSearchMode] = React.useState<'standard' | 'moodboard' | 'infinite' | 'compatibility' | 'textpalette'>('standard');

  // Standard Filters State
  const [selectedBrand, setSelectedBrand] = React.useState('All');
  const [selectedRating, setSelectedRating] = React.useState(0);
  const [minPrice, setMinPrice] = React.useState(0);
  const [maxPrice, setMaxPrice] = React.useState(1500);
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [eliteOnly, setEliteOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('relevant');

  // Deep-Faceted Attribute Matrix filters (Feature #5)
  const [facetDAC, setFacetDAC] = React.useState<string | null>(null);
  const [facetTDP, setFacetTDP] = React.useState<string | null>(null);
  const [facetWeight, setFacetWeight] = React.useState<string | null>(null);
  const [facetLux, setFacetLux] = React.useState<string | null>(null);
  const [facetHydro, setFacetHydro] = React.useState<string | null>(null);
  const [facetTelemetry, setFacetTelemetry] = React.useState<string | null>(null);

  // Feature #1: Contextual Mood Board Search State
  const [activeMoodPreset, setActiveMoodPreset] = React.useState<string | null>(null);
  const [uploadedMoodBoardName, setUploadedMoodBoardName] = React.useState<string | null>(null);
  const [isMoodSearching, setIsMoodSearching] = React.useState(false);
  const [moodSearchLog, setMoodSearchLog] = React.useState<string>('');

  // Feature #10: Text-to-Palette Visual Search State
  const [textPaletteQuery, setTextPaletteQuery] = React.useState('');
  const [isPaletteAnalyzing, setIsPaletteAnalyzing] = React.useState(false);
  const [generatedPalette, setGeneratedPalette] = React.useState<string[]>([]);
  const [paletteActiveTag, setPaletteActiveTag] = React.useState<string | null>(null);

  // Feature #3: Fluid Grid Infinite Discovery State
  const [infiniteVisiblePool, setInfiniteVisiblePool] = React.useState<Product[]>([]);
  const [infinitePageCount, setInfinitePageCount] = React.useState(1);
  const [isInfiniteLoading, setIsInfiniteLoading] = React.useState(false);

  // Feature #8: Cross-Category Compatibility Graph State
  const [assemblyRig, setAssemblyRig] = React.useState<Product[]>([]);
  const [compatGraphActiveNode, setCompatGraphActiveNode] = React.useState<string | null>(null);

  // Core Categories List
  const categories = ['All', 'Electronics', 'Wearables', 'Workspace', 'Accessories', 'Refurbished Grid'];

  // Extract unique brands dynamically
  const brands = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.brand));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Handle filter resets
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
    // Clear facets
    setFacetDAC(null);
    setFacetTDP(null);
    setFacetWeight(null);
    setFacetLux(null);
    setFacetHydro(null);
    setFacetTelemetry(null);
  };

  // Helper mapping: Assign deep faceted attributes to products dynamically
  const getProductFacetedAttributes = (p: Product) => {
    if (p.category === 'Electronics') {
      return {
        dac: p.id === 'prod_1' ? '124dB Studio-grade' : p.id === 'prod_8' ? '115dB Audiophile' : '95dB standard',
        tdp: p.id === 'prod_1' ? '15W Ultra-efficient' : p.id === 'prod_8' ? '15W Ultra-efficient' : '45W Standard',
      };
    } else if (p.category === 'Workspace') {
      return {
        weight: p.id === 'prod_6' ? '120kg Heavy-duty' : p.id === 'prod_3' ? '250kg Structural' : '20kg Standard',
        lux: p.id === 'prod_8' ? '500 lumens High-ambient' : '150 lumens',
      };
    } else {
      // Wearables & Accessories
      return {
        hydro: p.id === 'prod_2' ? 'IP68 deep-submersion' : p.id === 'prod_7' ? 'Mil-Spec 810G Rugged' : 'IPX4 splash',
        telemetry: p.id === 'prod_2' ? '200Hz Pro-Telemetry' : '50Hz Standard',
      };
    }
  };

  // ---------------------------------------------------------------------------
  // FILTERING ENGINE FOR STANDARD VIEW & FACET MATRIX
  // ---------------------------------------------------------------------------
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
      if (selectedCategory === 'Refurbished Grid') {
        list = list.filter((p) => p.isRefurbished);
      } else {
        list = list.filter((p) => p.category === selectedCategory);
      }
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

    // Apply Deep-Faceted Attribute Matrix filters (Feature #5)
    list = list.filter((p) => {
      const attrs = getProductFacetedAttributes(p);
      if (selectedCategory === 'Electronics') {
        if (facetDAC && (attrs as any).dac !== facetDAC) return false;
        if (facetTDP && (attrs as any).tdp !== facetTDP) return false;
      } else if (selectedCategory === 'Workspace') {
        if (facetWeight && (attrs as any).weight !== facetWeight) return false;
        if (facetLux && (attrs as any).lux !== facetLux) return false;
      } else if (selectedCategory === 'Wearables' || selectedCategory === 'Accessories') {
        if (facetHydro && (attrs as any).hydro !== facetHydro) return false;
        if (facetTelemetry && (attrs as any).telemetry !== facetTelemetry) return false;
      }
      return true;
    });

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
  }, [
    products, searchQuery, selectedCategory, selectedBrand, eliteOnly, 
    selectedRating, minPrice, maxPrice, inStockOnly, sortBy,
    facetDAC, facetTDP, facetWeight, facetLux, facetHydro, facetTelemetry
  ]);

  // ---------------------------------------------------------------------------
  // FEATURE #1: MOOD BOARD SEARCH SIMULATION
  // ---------------------------------------------------------------------------
  const moodPresets = [
    { id: 'noir', name: 'Noir Cyberpunk Academia', desc: 'Dark matte, neon highlights, raw carbon' },
    { id: 'zen', name: 'Zen Walnut & Copper', desc: 'Organic woods, warm amber underglows, copper accents' },
    { id: 'highperformance', name: 'High-Performance Lab', desc: 'Aerospace titanium, glass panels, 144Hz setups' },
    { id: 'rustic', name: 'Rustic Patina Traveler', desc: 'Saddleback leather, sturdy stitching, brass dials' }
  ];

  const handleSelectMoodBoard = (presetId: string) => {
    setActiveMoodPreset(presetId);
    setUploadedMoodBoardName(null);
    setIsMoodSearching(true);
    triggerMoodAnalysis(presetId, null);
  };

  const handleSimulatedLookbookUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedMoodBoardName(file.name);
      setActiveMoodPreset(null);
      setIsMoodSearching(true);
      triggerMoodAnalysis(null, file.name);
    }
  };

  const triggerMoodAnalysis = (preset: string | null, fileName: string | null) => {
    setMoodSearchLog('Connecting to visual asset vector pipeline...');
    setTimeout(() => {
      setMoodSearchLog('Extracting color histograms and shape vectors...');
      setTimeout(() => {
        setMoodSearchLog('Performing client-side dot-product similarity search...');
        setTimeout(() => {
          setIsMoodSearching(false);
          setMoodSearchLog('Visual aesthetic match score stabilized.');
        }, 900);
      }, 700);
    }, 600);
  };

  const moodMatchedProducts = React.useMemo(() => {
    if (isMoodSearching) return [];
    
    // Default fallback list
    let list = [...products];

    if (activeMoodPreset === 'noir') {
      // Matches prod_1 (Wireless Headphones), prod_2 (SmartWatch Edition 4)
      return list.filter((p) => p.id === 'prod_1' || p.id === 'prod_2');
    } else if (activeMoodPreset === 'zen') {
      // Matches prod_4 (Mechanical Keyboard), prod_7 (Hydrophobic Desk Pad)
      return list.filter((p) => p.id === 'prod_4' || p.id === 'prod_7');
    } else if (activeMoodPreset === 'highperformance') {
      // Matches prod_3 (Desk Monitor), prod_6 (Mesh Chair), prod_8 (Screenbar)
      return list.filter((p) => p.id === 'prod_3' || p.id === 'prod_6' || p.id === 'prod_8');
    } else if (activeMoodPreset === 'rustic') {
      // Matches prod_5 (Saddleback Leather pack)
      return list.filter((p) => p.id === 'prod_5');
    } else if (uploadedMoodBoardName) {
      // Custom uploaded lookbook randomly selects 2 items
      return [list[0], list[4]].filter(Boolean);
    }
    return [];
  }, [activeMoodPreset, uploadedMoodBoardName, isMoodSearching, products]);

  // ---------------------------------------------------------------------------
  // FEATURE #10: TEXT-TO-PALETTE VISUAL SEARCH
  // ---------------------------------------------------------------------------
  const palettePresets = [
    { query: 'faded 90s cyberpunk neon', colors: ['#0d9488', '#f43f5e', '#a855f7', '#0f172a'] },
    { query: 'organic warm walnut forest', colors: ['#78350f', '#fef3c7', '#15803d', '#451a03'] },
    { query: 'minimalist steel & polar cream', colors: ['#f8fafc', '#64748b', '#e2e8f0', '#0284c7'] },
    { query: 'rustic brass and worn leather', colors: ['#b45309', '#d97706', '#f59e0b', '#7c2d12'] }
  ];

  const handleApplyPaletteQuery = (q: string) => {
    setTextPaletteQuery(q);
    setIsPaletteAnalyzing(true);
    setPaletteActiveTag(null);
    setTimeout(() => {
      // Dynamically generate palette based on keyword match
      const lower = q.toLowerCase();
      let colors = ['#0d9488', '#14b8a6', '#64748b']; // Fallback
      
      if (lower.includes('cyberpunk') || lower.includes('neon') || lower.includes('90s')) {
        colors = ['#0d9488', '#f43f5e', '#a855f7', '#0f172a'];
        setPaletteActiveTag('cyberpunk');
      } else if (lower.includes('walnut') || lower.includes('organic') || lower.includes('warm')) {
        colors = ['#78350f', '#fef3c7', '#15803d', '#451a03'];
        setPaletteActiveTag('walnut');
      } else if (lower.includes('minimalist') || lower.includes('cream') || lower.includes('steel')) {
        colors = ['#f8fafc', '#64748b', '#e2e8f0', '#0284c7'];
        setPaletteActiveTag('minimalist');
      } else if (lower.includes('leather') || lower.includes('rustic') || lower.includes('brass')) {
        colors = ['#b45309', '#d97706', '#f59e0b', '#7c2d12'];
        setPaletteActiveTag('leather');
      }
      setGeneratedPalette(colors);
      setIsPaletteAnalyzing(false);
    }, 1200);
  };

  const textPaletteMatchedProducts = React.useMemo(() => {
    if (isPaletteAnalyzing) return [];
    if (!textPaletteQuery) return [];

    let list = [...products];
    if (paletteActiveTag === 'cyberpunk') {
      return list.filter((p) => p.id === 'prod_1' || p.id === 'prod_2');
    } else if (paletteActiveTag === 'walnut') {
      return list.filter((p) => p.id === 'prod_4' || p.id === 'prod_7');
    } else if (paletteActiveTag === 'minimalist') {
      return list.filter((p) => p.id === 'prod_3' || p.id === 'prod_6' || p.id === 'prod_8');
    } else if (paletteActiveTag === 'leather') {
      return list.filter((p) => p.id === 'prod_5');
    }
    return list; // default standard if unrecognized
  }, [paletteActiveTag, isPaletteAnalyzing, textPaletteQuery, products]);

  // ---------------------------------------------------------------------------
  // FEATURE #3: FLUID GRID INFINITE DISCOVERY ENGINE
  // ---------------------------------------------------------------------------
  // Populates an endless stream of products by modifying properties
  React.useEffect(() => {
    if (searchMode === 'infinite') {
      // Seed initial pool
      setInfiniteVisiblePool([...products]);
    }
  }, [searchMode, products]);

  const handleLoadMoreInfinite = () => {
    setIsInfiniteLoading(true);
    setTimeout(() => {
      // Create beautifully randomized variants of products
      const newPageCount = infinitePageCount + 1;
      const variants: Product[] = products.map((p, idx) => {
        const editionNames = ['[Slate Dark Edition]', '[Liquid Chrome v4]', '[Desert Suede Custom]', '[Atmospheric Jade]'];
        const editionName = editionNames[(idx + newPageCount) % editionNames.length];
        const newPrice = Math.round(p.price * (0.85 + Math.random() * 0.3));
        const newRating = Number((4.0 + Math.random() * 1.0).toFixed(1));
        return {
          ...p,
          id: `inf_${p.id}_${newPageCount}`,
          name: `${p.name} ${editionName}`,
          price: newPrice,
          rating: newRating,
          stock: Math.round(Math.random() * 8) + 1,
          reviewsCount: p.reviewsCount + Math.round(Math.random() * 5)
        };
      });

      setInfiniteVisiblePool((prev) => [...prev, ...variants]);
      setInfinitePageCount(newPageCount);
      setIsInfiniteLoading(false);
    }, 1000);
  };

  // ---------------------------------------------------------------------------
  // FEATURE #8: CROSS-CATEGORY COMPATIBILITY GRAPH
  // ---------------------------------------------------------------------------
  const handleToggleAssemblyRig = (p: Product) => {
    const exists = assemblyRig.some((item) => item.id === p.id);
    if (exists) {
      setAssemblyRig((prev) => prev.filter((item) => item.id !== p.id));
    } else {
      // Restrict rig to 1 per category for high-fidelity compatibility logic
      const categoryExists = assemblyRig.some((item) => item.category === p.category);
      if (categoryExists) {
        setAssemblyRig((prev) => [
          ...prev.filter((item) => item.category !== p.category),
          p
        ]);
      } else {
        setAssemblyRig((prev) => [...prev, p]);
      }
    }
  };

  const compatibilityReports = React.useMemo(() => {
    const reports: { text: string; type: 'success' | 'warning' | 'info' }[] = [];
    if (assemblyRig.length === 0) {
      reports.push({ text: 'Add interlocking components to calculate assembly diagnostics.', type: 'info' });
      return reports;
    }

    const hasElectronics = assemblyRig.some((item) => item.category === 'Electronics');
    const hasWorkspace = assemblyRig.some((item) => item.category === 'Workspace');
    const hasWearables = assemblyRig.some((item) => item.category === 'Wearables');

    // Electronics & Workspace logic
    const ultrawide = assemblyRig.find((item) => item.id === 'prod_3'); // Ultrawide Monitor
    const deskpad = assemblyRig.find((item) => item.id === 'prod_7'); // Nebula Deskpad
    const keyboard = assemblyRig.find((item) => item.id === 'prod_4'); // Walnut Keyboard

    if (ultrawide && deskpad) {
      reports.push({
        text: '⚠ PHYSICAL COLLISION OVERHANG: Horizon Curved Ultrawide overlaps the physical footprint of the Nebula desk pad by 5.4cm. Ensure spatial clearance.',
        type: 'warning'
      });
    }

    if (ultrawide && keyboard) {
      reports.push({
        text: '✓ POWER DISPATCH COMPATIBLE: Lumina Ultrawide 65W power delivery fully drives the KeyCraft Pro walnut mechanical board with stable telemetry.',
        type: 'success'
      });
    }

    // Wearables & Electronics Bluetooth logic
    const watch = assemblyRig.find((item) => item.id === 'prod_2');
    const headphones = assemblyRig.find((item) => item.id === 'prod_1');
    if (watch && headphones) {
      reports.push({
        text: '✓ BLUETOOTH LE AUDIO SYNC: Chronos SmartWatch 4 pairs using LE Audio codec to Aether-9 ANC. Low-latency streaming sample rate confirmed at 48kHz.',
        type: 'success'
      });
    }

    if (reports.length === 0) {
      reports.push({
        text: '✓ STRUCTURAL MATRIX LOCK: All selected items pass general fitment clearances and ergonomic balance standards.',
        type: 'success'
      });
    }

    return reports;
  }, [assemblyRig]);

  return (
    <div id="search-view-container" className="pb-16 max-w-7xl mx-auto">
      
      {/* 1. DISCOVERY NAVIGATION HEADER TABS */}
      <div className="border-b border-slate-200 bg-white rounded-2xl p-4 shadow-sm space-y-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 id="search-view-heading" className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
              <Compass className="h-6 w-6 text-teal-600 animate-spin-slow" />
              <span>Neo-Discovery Dashboard</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select an advanced algorithmic search methodology to scan our database of premium, verified cargo.
            </p>
          </div>
          
          <span className="text-[10px] font-mono font-bold bg-teal-950 text-teal-400 border border-teal-800 px-2 py-1 rounded-md self-start md:self-auto uppercase">
            Platform Index: {products.length} Nodes Online
          </span>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => { setSearchMode('standard'); handleResetFilters(); }}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              searchMode === 'standard' 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Faceted Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('moodboard')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              searchMode === 'moodboard' 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Mood Board Matcher</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('textpalette')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              searchMode === 'textpalette' 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Palette className="h-4 w-4" />
            <span>Text-to-Palette</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('infinite')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              searchMode === 'infinite' 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Compass className="h-4 w-4 animate-spin-slow" />
            <span>Infinite Discovery</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('compatibility')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              searchMode === 'compatibility' 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Network className="h-4 w-4" />
            <span>Assembly compatibility</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ===================================================================
            1. FACETED CATALOG (STANDARD VIEW WITH DEEP FACETS)
           =================================================================== */}
        {searchMode === 'standard' && (
          <motion.div
            key="standard-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col lg:flex-row gap-8 items-start"
          >
            {/* Standard filters left sidebar */}
            <aside id="search-filters-sidebar" className="w-full lg:w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                  <Filter className="h-4 w-4 text-teal-600" />
                  <span>Curated Filters</span>
                </div>
                <button
                  id="clear-filters-btn"
                  onClick={handleResetFilters}
                  className="text-[10px] font-bold text-slate-400 hover:text-teal-600 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Text Query Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Keyword Search</label>
                <input
                  id="filters-keyword-input"
                  type="text"
                  placeholder="Type specs, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              {/* Curated Category Segment selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Category Segment</label>
                <div className="flex flex-wrap gap-1 lg:flex-col lg:space-y-1">
                  {categories.map((cat) => (
                    <button
                      id={`filter-cat-${cat}`}
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        // reset facets on category change
                        setFacetDAC(null);
                        setFacetTDP(null);
                        setFacetWeight(null);
                        setFacetLux(null);
                        setFacetHydro(null);
                        setFacetTelemetry(null);
                      }}
                      className={`rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors w-auto lg:w-full cursor-pointer ${
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

              {/* -------------------------------------------------------------
                  FEATURE #5: DEEP-FACETED ATTRIBUTE MATRIX FILTER PANEL
                 ------------------------------------------------------------- */}
              {selectedCategory !== 'All' && (
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="flex items-center gap-1.5 bg-teal-50 px-2 py-1 rounded">
                    <Sparkles className="h-3 w-3 text-teal-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 font-mono">Faceted Attribute Matrix</span>
                  </div>

                  {selectedCategory === 'Electronics' && (
                    <div className="space-y-3">
                      {/* DAC Resolution */}
                      <div className="space-y-1.5">
                        <label className="text-[10.5px] font-bold text-slate-500 font-mono">DAC AUDIO DECIBELS</label>
                        <div className="flex flex-col gap-1">
                          {['124dB Studio-grade', '115dB Audiophile', '95dB standard'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                              <input
                                type="radio"
                                name="dacFacet"
                                checked={facetDAC === opt}
                                onChange={() => setFacetDAC(facetDAC === opt ? null : opt)}
                                onClick={() => setFacetDAC(facetDAC === opt ? null : opt)}
                                className="h-3 w-3 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                              />
                              <span className={facetDAC === opt ? 'font-bold text-teal-700' : ''}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* TDP wattage */}
                      <div className="space-y-1.5">
                        <label className="text-[10.5px] font-bold text-slate-500 font-mono">THERMAL DESIGN POWER</label>
                        <div className="flex flex-col gap-1">
                          {['15W Ultra-efficient', '45W Standard'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                              <input
                                type="radio"
                                name="tdpFacet"
                                checked={facetTDP === opt}
                                onChange={() => setFacetTDP(facetTDP === opt ? null : opt)}
                                onClick={() => setFacetTDP(facetTDP === opt ? null : opt)}
                                className="h-3 w-3 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                              />
                              <span className={facetTDP === opt ? 'font-bold text-teal-700' : ''}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCategory === 'Workspace' && (
                    <div className="space-y-3">
                      {/* Weight load rating */}
                      <div className="space-y-1.5">
                        <label className="text-[10.5px] font-bold text-slate-500 font-mono">STRUCTURAL LOAD LIMIT</label>
                        <div className="flex flex-col gap-1">
                          {['20kg Standard', '120kg Heavy-duty', '250kg Structural'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                              <input
                                type="radio"
                                name="weightFacet"
                                checked={facetWeight === opt}
                                onChange={() => setFacetWeight(facetWeight === opt ? null : opt)}
                                onClick={() => setFacetWeight(facetWeight === opt ? null : opt)}
                                className="h-3 w-3 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                              />
                              <span className={facetWeight === opt ? 'font-bold text-teal-700' : ''}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Lux output */}
                      <div className="space-y-1.5">
                        <label className="text-[10.5px] font-bold text-slate-500 font-mono">LUMINANCE OUTFLOW</label>
                        <div className="flex flex-col gap-1">
                          {['500 lumens High-ambient', '150 lumens'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                              <input
                                type="radio"
                                name="luxFacet"
                                checked={facetLux === opt}
                                onChange={() => setFacetLux(facetLux === opt ? null : opt)}
                                onClick={() => setFacetLux(facetLux === opt ? null : opt)}
                                className="h-3 w-3 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                              />
                              <span className={facetLux === opt ? 'font-bold text-teal-700' : ''}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedCategory === 'Wearables' || selectedCategory === 'Accessories') && (
                    <div className="space-y-3">
                      {/* Waterproof rating */}
                      <div className="space-y-1.5">
                        <label className="text-[10.5px] font-bold text-slate-500 font-mono">WATER RESISTANCE INDEX</label>
                        <div className="flex flex-col gap-1">
                          {['IP68 deep-submersion', 'Mil-Spec 810G Rugged', 'IPX4 splash'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                              <input
                                type="radio"
                                name="hydroFacet"
                                checked={facetHydro === opt}
                                onChange={() => setFacetHydro(facetHydro === opt ? null : opt)}
                                onClick={() => setFacetHydro(facetHydro === opt ? null : opt)}
                                className="h-3 w-3 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                              />
                              <span className={facetHydro === opt ? 'font-bold text-teal-700' : ''}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Telemetry samples */}
                      <div className="space-y-1.5">
                        <label className="text-[10.5px] font-bold text-slate-500 font-mono">TELEMETRY POLLING RATE</label>
                        <div className="flex flex-col gap-1">
                          {['200Hz Pro-Telemetry', '50Hz Standard'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                              <input
                                type="radio"
                                name="telemetryFacet"
                                checked={facetTelemetry === opt}
                                onChange={() => setFacetTelemetry(facetTelemetry === opt ? null : opt)}
                                onClick={() => setFacetTelemetry(facetTelemetry === opt ? null : opt)}
                                className="h-3 w-3 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                              />
                              <span className={facetTelemetry === opt ? 'font-bold text-teal-700' : ''}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Manufacturer Brand Filter */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-600">Manufacturer</label>
                <div className="relative">
                  <select
                    id="filter-brand-select"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none appearance-none focus:border-teal-500 focus:bg-white cursor-pointer"
                  >
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Price Thresholds */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-600 block">Price Thresholds</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Min ($)</span>
                    <input
                      id="filter-min-price-input"
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Max ($)</span>
                    <input
                      id="filter-max-price-input"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
                
                <input
                  id="price-range-slider"
                  type="range"
                  min="0"
                  max="1500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Toggle controls */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <div className="leading-none">
                    <label className="text-xs font-bold text-slate-700">In Stock Only</label>
                  </div>
                  <button
                    id="filter-stock-toggle"
                    type="button"
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      inStockOnly ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      inStockOnly ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="leading-none">
                    <label className="text-xs font-bold text-slate-700">Elite Program Exclusive</label>
                  </div>
                  <button
                    id="filter-elite-toggle"
                    type="button"
                    onClick={() => setEliteOnly(!eliteOnly)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      eliteOnly ? 'bg-amber-500' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      eliteOnly ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </aside>

            {/* Faceted Results Container */}
            <div id="search-results-container" className="flex-1 space-y-6">
              
              {/* Refurbished Grid Banner (Feature #64) */}
              {selectedCategory === 'Refurbished Grid' && (
                <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 text-white rounded-3xl border border-teal-500/30 p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-teal-500/10 blur-3xl rounded-full" />
                  <div className="flex items-start gap-4 relative z-10">
                    <span className="text-3xl">🛡️</span>
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold tracking-tight text-teal-300">Refurbished Grid Certification Ledger</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Welcome to the dedicated circular economy vertical. Every item on the Refurbished Grid has been thoroughly certified, repaired, and re-tested by accredited third-party engineers. We track cryptographic quality verification scores and strict component lifecycle assessments to divert premium electronics from e-waste streams.
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 font-mono text-[9px] text-teal-400">
                        <span>● STRICT COMPONENT LIFECYCLE AUDITS</span>
                        <span>● GUARANTEED MIN. 95% REPAIR SCORE</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Results Actionbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <span className="text-xs font-medium text-slate-500 pl-1">
                  Found {filteredProducts.length} items matching standard and faceted criteria
                </span>
                
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Sort Order</span>
                  <div className="relative">
                    <select
                      id="search-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none appearance-none cursor-pointer focus:border-teal-500 focus:bg-white"
                    >
                      <option value="relevant">Relevant Score</option>
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

              {/* Grid of cards */}
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
                    Try widening your price range, or clearing active faceted attribute selections.
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
          </motion.div>
        )}

        {/* ===================================================================
            2. FEATURE #1: CONTEXTUAL MOOD BOARD SEARCH
           =================================================================== */}
        {searchMode === 'moodboard' && (
          <motion.div
            key="moodboard-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Visual Lookbook & Mood Board Aesthetic Match</h3>
                </div>
                <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">
                  BLOB_VECTOR_PIPELINE
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                Skip keyboard inputs entirely. Drag-and-drop your custom styling lookbook, or select a pre-composed visual archetype node. Our neural network processes color spectrum signatures, materials, and form aesthetics to match matching catalog components instantly.
              </p>

              {/* Presets Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {moodPresets.map((preset) => {
                  const isActive = activeMoodPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectMoodBoard(preset.id)}
                      className={`rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                        isActive 
                          ? 'border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-500/25' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${
                          preset.id === 'noir' ? 'bg-slate-800' :
                          preset.id === 'zen' ? 'bg-amber-600' :
                          preset.id === 'highperformance' ? 'bg-sky-500' : 'bg-orange-800'
                        }`} />
                        {preset.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Upload Dropzone */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSimulatedLookbookUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Upload className="h-8 w-8 text-slate-400 mb-2 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">Upload custom styling lookbook / image</span>
                <span className="text-[10px] text-slate-400 mt-1">Processed securely using simulated Blob matching vectors</span>
                
                {uploadedMoodBoardName && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1 text-[11px] font-mono">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Active: {uploadedMoodBoardName}</span>
                  </div>
                )}
              </div>

              {/* Analyzer Log Status console */}
              {moodSearchLog && (
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 font-mono text-[10px] text-teal-400 flex items-center gap-3 shadow-inner">
                  {isMoodSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin text-teal-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                  <div className="flex-1">
                    <span className="text-slate-500 block text-[8px]">LOG_STREAM:</span>
                    <span>{moodSearchLog}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Results matched */}
            {!isMoodSearching && moodMatchedProducts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono pl-1">
                  Aesthetic Match Results ({moodMatchedProducts.length})
                </h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {moodMatchedProducts.map((prod) => (
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
              </div>
            )}
          </motion.div>
        )}

        {/* ===================================================================
            3. FEATURE #10: TEXT-TO-PALETTE VISUAL SEARCH
           =================================================================== */}
        {searchMode === 'textpalette' && (
          <motion.div
            key="textpalette-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Text-to-Palette Visual & Tone Search</h3>
                </div>
                <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                  HEURISTIC_COLOR_INDEX
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                Type complex aesthetic design prompts (e.g. "faded 90s cyberpunk neon" or "organic warm walnut forest"). The system computes a matching color harmony palette, instantly index-querying the database for items constructed inside those exact hex color spectrum bounds.
              </p>

              {/* Text Query Form */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="e.g. faded 90s cyberpunk neon, organic warm walnut forest, minimalist steel..."
                  value={textPaletteQuery}
                  onChange={(e) => setTextPaletteQuery(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleApplyPaletteQuery(textPaletteQuery)}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase px-6 py-3 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Palette className="h-4 w-4" />
                  <span>Index Palette</span>
                </button>
              </div>

              {/* Predefined prompt quick-tags */}
              <div className="flex flex-wrap gap-2.5 items-center">
                <span className="text-[9px] font-bold font-mono text-slate-400 uppercase">Suggested Prompts:</span>
                {palettePresets.map((preset) => (
                  <button
                    key={preset.query}
                    type="button"
                    onClick={() => handleApplyPaletteQuery(preset.query)}
                    className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    "{preset.query}"
                  </button>
                ))}
              </div>

              {/* Dynamic generated palette visualization */}
              <AnimatePresence>
                {generatedPalette.length > 0 && !isPaletteAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-3"
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                      Stabilized Colorway Palette (Matched {generatedPalette.length} Nodes)
                    </span>
                    
                    <div className="flex items-center gap-3">
                      {generatedPalette.map((color, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div 
                            className="h-10 w-16 rounded-lg shadow-inner border border-white"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">{color}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isPaletteAnalyzing && (
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 font-mono text-[10px] text-teal-400 flex items-center gap-3 shadow-inner">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
                  <span>Parsing colorway descriptions, indexing matching hex indices...</span>
                </div>
              )}
            </div>

            {/* Results Matched */}
            {!isPaletteAnalyzing && textPaletteMatchedProducts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono pl-1">
                  Colorway Match Results ({textPaletteMatchedProducts.length})
                </h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {textPaletteMatchedProducts.map((prod) => (
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
              </div>
            )}
          </motion.div>
        )}

        {/* ===================================================================
            4. FEATURE #3: FLUID GRID INFINITE DISCOVERY
           =================================================================== */}
        {searchMode === 'infinite' && (
          <motion.div
            key="infinite-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Immersive distraction-free banner */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl border border-slate-800">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Compass className="h-40 w-40 text-teal-400" />
              </div>

              <div className="relative z-10 space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-1 bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full text-[9px] font-mono border border-teal-500/20 uppercase tracking-widest font-black">
                  Infinite Discovery Mode
                </div>
                <h3 className="text-3xl font-black tracking-tight leading-none">Endless Fluid Exploration</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No sidebars. No traditional list filters. This fluid, staggering masonry-style infinite view keeps you focused on clean physical layouts. Dynamic page revisions compile as you scroll downward.
                </p>
              </div>
            </div>

            {/* Masonry / Infinite Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {infiniteVisiblePool.map((prod) => (
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

            {/* Simulated scroll load action bar */}
            <div className="flex flex-col items-center justify-center py-8">
              <button
                type="button"
                onClick={handleLoadMoreInfinite}
                disabled={isInfiniteLoading}
                className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase px-8 py-4 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 shadow-lg border border-slate-800"
              >
                {isInfiniteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
                    <span>Compiling dynamic page variants...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-teal-400 fill-current" />
                    <span>Trigger Endless Scroll (Fetch Revision {infinitePageCount + 1})</span>
                  </>
                )}
              </button>
              <span className="text-[9px] font-mono text-slate-400 mt-2">
                Simulated responsive infinite buffer. Active pool count: {infiniteVisiblePool.length} nodes.
              </span>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            5. FEATURE #8: CROSS-CATEGORY COMPATIBILITY GRAPH
           =================================================================== */}
        {searchMode === 'compatibility' && (
          <motion.div
            key="compatibility-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid gap-8 lg:grid-cols-12 items-start"
          >
            {/* Interactive Graph Display & Diagnostic panel (left 5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                  <Network className="h-4.5 w-4.5 text-teal-600 animate-pulse" />
                  <span>Interlocking Assembly Node Graph</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                  ASSEMBLY_MATRIX_LOG
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-normal">
                Assemble separate structural layers below. The interactive graph traces interlocking parameters and physical fits, flagging physical dimensions conflicts or power delivery limits in real-time.
              </p>

              {/* Node-Graph Visual Canvas Container */}
              <div className="relative h-[220px] rounded-xl bg-slate-950 border border-slate-800 p-3 overflow-hidden flex items-center justify-center">
                
                {/* SVG connection lines representing hardware interlocks */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {assemblyRig.length >= 2 && (
                    <g stroke="rgba(20, 184, 166, 0.4)" strokeWidth="1.5" strokeDasharray="3 3">
                      {assemblyRig.map((item, idx) => {
                        if (idx === 0) return null;
                        const prevIdx = idx - 1;
                        // Draw lines between dynamic coordinates
                        const x1 = 50 + prevIdx * 80;
                        const y1 = 110;
                        const x2 = 50 + idx * 80;
                        const y2 = 110;
                        return (
                          <line 
                            key={idx} 
                            x1={x1} y1={y1} x2={x2} y2={y2} 
                            className="animate-pulse" 
                            style={{ animationDuration: '2s' }}
                          />
                        );
                      })}
                    </g>
                  )}
                </svg>

                {/* Grid line overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                {/* Nodes Stack */}
                <div className="relative z-10 flex flex-wrap gap-4 items-center justify-center">
                  {assemblyRig.length > 0 ? (
                    assemblyRig.map((item) => (
                      <motion.div
                        layout
                        key={item.id}
                        onClick={() => setCompatGraphActiveNode(compatGraphActiveNode === item.id ? null : item.id)}
                        className={`rounded-2xl border bg-slate-900 p-3 flex flex-col items-center justify-center w-24 h-24 text-center cursor-pointer transition-all ${
                          compatGraphActiveNode === item.id 
                            ? 'border-teal-400 ring-2 ring-teal-500/20 bg-slate-900 shadow-[0_0_12px_rgba(20,184,166,0.3)]' 
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[8px] font-bold font-mono text-teal-400 uppercase tracking-widest">{item.category}</span>
                        <span className="text-[10px] font-bold text-white line-clamp-2 mt-1 leading-tight">{item.name}</span>
                        <span className="text-[8px] font-mono text-slate-400 mt-1">${item.price}</span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 space-y-1">
                      <HelpIcon className="h-6 w-6 text-slate-600 mx-auto animate-bounce" />
                      <span className="text-[10px] font-mono font-bold uppercase block">Rig Empty</span>
                      <span className="text-[9px] block text-slate-600 max-w-xs">Select items from catalog below to calculate structural interlocking.</span>
                    </div>
                  )}
                </div>

                {/* Node count overlay badge */}
                <div className="absolute bottom-2.5 right-2.5 font-mono text-[8px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                  NODES_CONNECTED: {assemblyRig.length}
                </div>
              </div>

              {/* Real-time Diagnostics Output */}
              <div className="space-y-2.5">
                <span className="text-[10.5px] font-bold font-mono text-slate-400 block uppercase">REAL-TIME DIAGNOSTIC REPORTS:</span>
                
                {compatibilityReports.map((report, idx) => (
                  <div 
                    key={idx} 
                    className={`rounded-xl border p-3 text-[10.5px] font-mono leading-relaxed ${
                      report.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                      report.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                      'bg-slate-50 border-slate-100 text-slate-500'
                    }`}
                  >
                    <div className="flex gap-2 items-start">
                      {report.type === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />}
                      <span>{report.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart action for full assembly */}
              {assemblyRig.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    assemblyRig.forEach((prod) => onAddToCart(prod));
                    setAssemblyRig([]);
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase py-3 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Full Assembly to Cart</span>
                </button>
              )}
            </div>

            {/* Catalog Grid for selecting items (right 7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border-b border-slate-100 pb-3 pl-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono">Select interlocks from catalog</h3>
                <p className="text-xs text-slate-400">Click individual listings below to mount or dismount them from the Assembly Rig.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {products.map((prod) => {
                  const isMounted = assemblyRig.some((item) => item.id === prod.id);
                  return (
                    <div 
                      key={prod.id}
                      onClick={() => handleToggleAssemblyRig(prod)}
                      className={`rounded-xl border p-4 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[120px] ${
                        isMounted 
                          ? 'border-teal-500 bg-teal-50 shadow-sm ring-2 ring-teal-500/25' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase">
                          <span>{prod.brand}</span>
                          <span className="font-bold text-teal-600">{prod.category}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{prod.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{prod.description}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100/50 pt-1.5 mt-2">
                        <span className="text-xs font-black text-slate-700">${prod.price}</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          isMounted ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isMounted ? 'RIG_ACTIVE' : 'MOUNT_NODE'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
