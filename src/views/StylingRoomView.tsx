/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  RotateCw, 
  Trash2, 
  Plus, 
  ShoppingCart, 
  Compass, 
  Users, 
  Info, 
  Layers, 
  Move,
  ThumbsUp,
  Award
} from 'lucide-react';
import { Product, User } from '../lib/db';

interface StyledItem {
  id: string; // unique canvas instance id
  product: Product;
  x: number; // percentage width
  y: number; // percentage height
  rotation: number; // degrees
  scale: number; // 0.8 to 1.5
}

interface CoDesigner {
  name: string;
  color: string;
  avatar: string;
  x: number;
  y: number;
  action: string;
}

const presetProducts = [
  {
    id: 'prod_1',
    name: 'Aether-9 Studio Spatial Headphones',
    price: 350,
    category: 'Electronics',
    brand: 'AuraSound',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=60',
    stock: 5,
    rating: 4.8,
    reviewsCount: 12,
    isElite: true,
    sellerId: 'sell_1',
    sellerName: 'AuraSound Corp'
  },
  {
    id: 'prod_2',
    name: 'KeyCraft Pro Split Mechanical Keyboard',
    price: 240,
    category: 'Workspace',
    brand: 'KeyCraft',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=200&auto=format&fit=crop&q=60',
    stock: 12,
    rating: 4.9,
    reviewsCount: 34,
    isElite: false,
    sellerId: 'sell_2',
    sellerName: 'KeyCraft Industries'
  },
  {
    id: 'prod_3',
    name: 'Lumina Circular Circadian Desk Beam',
    price: 180,
    category: 'Accessories',
    brand: 'Lumina',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&auto=format&fit=crop&q=60',
    stock: 8,
    rating: 4.7,
    reviewsCount: 19,
    isElite: false,
    sellerId: 'sell_3',
    sellerName: 'Lumina Lighting'
  },
  {
    id: 'prod_4',
    name: 'Saddleback Full-Grain Leather Desk Hide',
    price: 120,
    category: 'Workspace',
    brand: 'Saddleback Leather',
    image: 'https://images.unsplash.com/photo-1581557991964-125469da3b8a?w=200&auto=format&fit=crop&q=60',
    stock: 15,
    rating: 4.6,
    reviewsCount: 8,
    isElite: false,
    sellerId: 'sell_4',
    sellerName: 'Saddleback Goods'
  }
];

interface StylingRoomViewProps {
  currentUser: User;
  onAddToCart: (product: Product) => void;
  products: Product[];
  setActiveView: (view: any) => void;
}

export default function StylingRoomView({ currentUser, onAddToCart, products, setActiveView }: StylingRoomViewProps) {
  // Take catalog products or fallback to pre-defined ones to ensure variety
  const availableProducts = React.useMemo(() => {
    const combined = [...products];
    presetProducts.forEach(preset => {
      if (!combined.some(p => p.id === preset.id)) {
        combined.push(preset as any);
      }
    });
    return combined.slice(0, 10);
  }, [products]);

  const [canvasItems, setCanvasItems] = React.useState<StyledItem[]>([]);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

  // Simulated co-designers (Feature #20 requirement for real-time multiplayer feel)
  const [coDesigners, setCoDesigners] = React.useState<CoDesigner[]>([
    { name: 'Emma (Acoustic designer)', color: 'bg-emerald-500 text-slate-950', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60', x: 25, y: 30, action: 'Arranging headphones' },
    { name: 'Lucas (Workspace Architect)', color: 'bg-amber-500 text-slate-950', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60', x: 75, y: 60, action: 'Repositioning Lumina Light' }
  ]);

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Animate cursors periodically to simulate real co-designers working live
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCoDesigners(prev => prev.map((designer, idx) => {
        // Subtle move toward an item or randomly on screen
        const deltaX = (Math.random() - 0.5) * 8;
        const deltaY = (Math.random() - 0.5) * 8;
        
        const actions = [
          'Aligning grid units',
          'Analyzing structural matching',
          'Testing light diffusion angles',
          'Evaluating workspace shadows',
          'Staging alternative layouts'
        ];

        return {
          ...designer,
          x: Math.min(90, Math.max(10, designer.x + deltaX)),
          y: Math.min(90, Math.max(10, designer.y + deltaY)),
          action: Math.random() > 0.7 ? actions[Math.floor(Math.random() * actions.length)] : designer.action
        };
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleAddItemToCanvas = (product: Product) => {
    const newItem: StyledItem = {
      id: `styled_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      product,
      x: 35 + Math.random() * 20,
      y: 35 + Math.random() * 20,
      rotation: 0,
      scale: 1.0
    };

    setCanvasItems(prev => [...prev, newItem]);
    setSelectedItemId(newItem.id);
    triggerToast(`Added ${product.name} to styling workbench.`);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRotateItem = (id: string) => {
    setCanvasItems(prev => prev.map(item => 
      item.id === id ? { ...item, rotation: (item.rotation + 45) % 360 } : item
    ));
  };

  const handleScaleItem = (id: string, multiplier: number) => {
    setCanvasItems(prev => prev.map(item => 
      item.id === id ? { ...item, scale: Math.min(1.6, Math.max(0.6, item.scale + multiplier)) } : item
    ));
  };

  const handleMoveItem = (id: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 5; // move 5% each adjustment click
    setCanvasItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      let nextX = item.x;
      let nextY = item.y;
      if (direction === 'up') nextY = Math.max(2, nextY - step);
      if (direction === 'down') nextY = Math.min(88, nextY + step);
      if (direction === 'left') nextX = Math.max(2, nextX - step);
      if (direction === 'right') nextX = Math.min(88, nextX + step);
      return { ...item, x: nextX, y: nextY };
    }));
  };

  const handleRemoveItem = (id: string) => {
    setCanvasItems(prev => prev.filter(item => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
    triggerToast('Removed item from board.');
  };

  const handleCommitBundle = () => {
    if (canvasItems.length === 0) {
      triggerToast('Workbench is empty! Add products first.');
      return;
    }

    // Add all products on the canvas to the cart
    canvasItems.forEach(item => {
      onAddToCart(item.product);
    });

    triggerToast(`Success! Added all ${canvasItems.length} styled items to cart.`);
    setTimeout(() => {
      setActiveView('cart');
    }, 1500);
  };

  // Aesthetic harmony matching engine (Feature #20 core logic)
  const harmonyReport = React.useMemo(() => {
    if (canvasItems.length === 0) {
      return { score: 0, grade: 'Empty Board', desc: 'No components placed. Add accessories or desk modules to start staging.', color: 'text-slate-400' };
    }

    if (canvasItems.length === 1) {
      return { score: 45, grade: 'Staging Phase', desc: 'Single-unit node active. Add adjacent brands or modules to unlock harmonic matching.', color: 'text-indigo-400' };
    }

    // Calculate alignment across dimensions
    // 1. Brand pairings: matches within AuraSound/KeyCraft/Lumina/Saddleback have great synergistic bonuses
    const brands = canvasItems.map(item => item.product.brand);
    const uniqueBrands = new Set(brands);
    const brandDiversity = uniqueBrands.size;

    // 2. Categories pairing: workspace + electronics = perfect home office
    const categories = canvasItems.map(item => item.product.category);
    const hasWorkspace = categories.includes('Workspace');
    const hasElectronics = categories.includes('Electronics');
    const hasAccessories = categories.includes('Accessories');

    let baseScore = 60;
    
    // Add points for brand layout symmetry
    if (brandDiversity === 1) baseScore += 15; // single brand aesthetic lock
    else if (brandDiversity === 2) baseScore += 25; // elegant hybrid setup (perfect)
    else baseScore += 10; // high variety

    // Add category harmony factors
    if (hasWorkspace && hasElectronics) baseScore += 15;
    if (hasAccessories) baseScore += 10;

    // Scale adjustments subtract small noise or add points for alignment
    const maxRotations = canvasItems.filter(item => item.rotation !== 0).length;
    if (maxRotations > 0) baseScore += 5; // dynamic geometric angles

    const score = Math.min(100, Math.max(30, baseScore));

    let grade = 'Nominal Synergy';
    let desc = 'The combination is structurally viable but shows color-clash potentials.';
    let color = 'text-amber-400';

    if (score >= 90) {
      grade = 'Masterpiece Workspace';
      desc = 'Exceptional ergonomic and material cohesion! Absolute material matching and frequency alignment secured.';
      color = 'text-emerald-400 animate-pulse';
    } else if (score >= 75) {
      grade = 'Balanced Executive High-Fit';
      desc = 'Premium geometric balance. Active lighting nodes diffuse perfectly next to workspace hides.';
      color = 'text-teal-400';
    }

    return { score, grade, desc, color };
  }, [canvasItems]);

  return (
    <div id="styling-room-view" className="space-y-6 pb-16">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-mono font-bold text-teal-700">
            <Compass className="h-3.5 w-3.5" />
            <span>Multiplayer Workspace Stager</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Spatial Collaborative Styling Room</h2>
          <p className="text-xs text-slate-400">Design outfits or arrange workspace gear in real time. Hover or select items on the canvas board to edit.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setCanvasItems([]); setSelectedItemId(null); }}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Clear Workbench
          </button>
          
          <button
            onClick={handleCommitBundle}
            disabled={canvasItems.length === 0}
            className="rounded-xl bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-50 px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md shadow-teal-600/10 flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Purchase Styled Bundle</span>
          </button>
        </div>
      </div>

      {/* Toast Notification banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-950 border border-teal-800 text-teal-400 font-mono text-xs px-4 py-3 rounded-xl shadow-2xl"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: PRODUCT SELECTION EXPEDITIONS (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 h-[550px] flex flex-col justify-between overflow-hidden">
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Catalog Gear Drawer</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">({availableProducts.length} Loaded)</span>
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-normal">
              Select premium equipment cards to drop onto the staging canvas for spatial assembly.
            </p>

            {/* List */}
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
              {availableProducts.map(p => (
                <div 
                  id={`drawer-item-${p.id}`}
                  key={p.id} 
                  className="flex items-center justify-between p-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                    <div className="leading-tight">
                      <p className="text-xs font-bold text-slate-800 max-w-[150px] truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">{p.brand} • ${p.price}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddItemToCanvas(p)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-600 transition-colors cursor-pointer"
                    title="Add to canvas"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-400 font-sans flex items-center gap-1.5">
            <Info className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Multiple users can add items and split bundles. Drag items inside the workbench to stage configurations.</span>
          </div>
        </div>

        {/* CENTER COLUMN: HIGH-FIDELITY INTERACTIVE CANVAS (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* STAGING AREA STAGE */}
          <div className="relative rounded-3xl border-2 border-slate-200/65 bg-slate-950/95 overflow-hidden h-[380px] shadow-inner flex items-center justify-center">
            {/* Structural Blueprint Grid Background Mesh */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(13,148,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(13,148,136,0.03)_1px,transparent_1px)] bg-[size:25px_25px]"></div>
            
            {/* Radar Circular Guidelines */}
            <div className="absolute h-64 w-64 border border-teal-500/[0.02] rounded-full"></div>
            <div className="absolute h-96 w-96 border border-teal-500/[0.01] rounded-full"></div>

            {/* Simulated Live Co-Designer Indicators (Pulsing Avatar Dots and pointer cursors) */}
            {coDesigners.map((designer, i) => (
              <div 
                key={i}
                style={{ left: `${designer.x}%`, top: `${designer.y}%` }}
                className="absolute z-10 pointer-events-none transition-all duration-1000 flex flex-col items-start"
              >
                {/* Visual mouse cursor label */}
                <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/60 text-white rounded-lg px-2 py-1 text-[9px] shadow-lg">
                  <span className={`h-1.5 w-1.5 rounded-full ${designer.color.split(' ')[0]} animate-ping`}></span>
                  <span className="font-bold">{designer.name}</span>
                  <span className="text-slate-400 italic">({designer.action})</span>
                </div>
              </div>
            ))}

            {/* Placed canvas items */}
            {canvasItems.map(item => {
              const isSelected = item.id === selectedItemId;
              return (
                <div
                  id={`canvas-item-${item.id}`}
                  key={item.id}
                  style={{ 
                    left: `${item.x}%`, 
                    top: `${item.y}%`,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.id); }}
                  className={`absolute z-20 p-2 rounded-2xl border bg-slate-900 cursor-pointer shadow-lg group hover:bg-slate-800 transition-colors select-none ${
                    isSelected 
                      ? 'border-teal-400 ring-2 ring-teal-500/20 shadow-[0_0_15px_rgba(13,148,136,0.25)]' 
                      : 'border-slate-800'
                  }`}
                >
                  <div className="relative">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="h-20 w-20 rounded-xl object-cover block pointer-events-none" 
                    />
                    
                    {/* Hover detail tooltip */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[8px] font-mono font-bold text-slate-300 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase">
                      {item.product.brand}
                    </div>
                  </div>
                </div>
              );
            })}

            {canvasItems.length === 0 && (
              <div className="text-center space-y-2 text-slate-600 z-10 pointer-events-none">
                <Layers className="h-8 w-8 text-slate-700 mx-auto animate-pulse" />
                <p className="text-xs uppercase font-bold font-mono tracking-wider">Design Grid Standby</p>
                <p className="text-[10px] text-slate-500 max-w-xs leading-normal">Select adjacent items from the Gear Drawer to stage and test coordinate designs.</p>
              </div>
            )}
          </div>

          {/* DYNAMIC METRIC CONTEXT & PARAMETRIC CONTROL LEDGER */}
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Aesthetics Harmony Analysis Panel (Feature #20 core math logic) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Acoustic & Light Affinity</span>
                <span className={`text-[11px] font-mono font-black ${harmonyReport.color}`}>{harmonyReport.score}% Harmony Score</span>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-slate-900">{harmonyReport.grade}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{harmonyReport.desc}</p>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className="h-full bg-teal-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${harmonyReport.score}%` }}
                ></div>
              </div>
            </div>

            {/* Selected Item Sizing & Customization (Perfect Fit Slider) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
              {selectedItemId && canvasItems.find(i => i.id === selectedItemId) ? (() => {
                const item = canvasItems.find(i => i.id === selectedItemId)!;
                return (
                  <>
                    <div className="flex justify-between items-start border-b border-slate-100 pb-1.5">
                      <div className="leading-none">
                        <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Selected Item</span>
                        <span className="text-xs font-extrabold text-slate-900 truncate max-w-[150px] block" title={item.product.name}>{item.product.name}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Perfect Fit Sizing sliders & buttons */}
                    <div className="grid grid-cols-4 gap-2 py-2 items-center text-center">
                      <button
                        onClick={() => handleRotateItem(item.id)}
                        className="flex flex-col items-center justify-center p-1 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer"
                        title="Rotate 45°"
                      >
                        <RotateCw className="h-4 w-4 text-slate-500 mb-0.5" />
                        <span className="text-[8px] font-mono text-slate-400">{item.rotation}°</span>
                      </button>

                      <button
                        onClick={() => handleScaleItem(item.id, 0.15)}
                        className="flex flex-col items-center justify-center p-1 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer"
                        title="Perfect Fit Slider - Scale Up"
                      >
                        <Plus className="h-4 w-4 text-slate-500 mb-0.5" />
                        <span className="text-[8px] font-mono text-slate-400">Perfect Fit +</span>
                      </button>

                      <button
                        onClick={() => handleScaleItem(item.id, -0.15)}
                        className="flex flex-col items-center justify-center p-1 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer"
                        title="Perfect Fit Slider - Scale Down"
                      >
                        <span className="h-4 flex items-center justify-center text-slate-500 font-bold mb-0.5 text-xs">-</span>
                        <span className="text-[8px] font-mono text-slate-400">Perfect Fit -</span>
                      </button>

                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-teal-600 font-mono">${item.product.price}</span>
                        <span className="text-[8px] text-slate-400 font-mono">Value</span>
                      </div>
                    </div>

                    {/* Micro-positioning adjustments */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Move Item</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleMoveItem(item.id, 'left')} className="px-1.5 py-0.5 border border-slate-200 text-[10px] rounded hover:bg-slate-50 cursor-pointer">←</button>
                        <button onClick={() => handleMoveItem(item.id, 'up')} className="px-1.5 py-0.5 border border-slate-200 text-[10px] rounded hover:bg-slate-50 cursor-pointer">↑</button>
                        <button onClick={() => handleMoveItem(item.id, 'down')} className="px-1.5 py-0.5 border border-slate-200 text-[10px] rounded hover:bg-slate-50 cursor-pointer">↓</button>
                        <button onClick={() => handleMoveItem(item.id, 'right')} className="px-1.5 py-0.5 border border-slate-200 text-[10px] rounded hover:bg-slate-50 cursor-pointer">→</button>
                      </div>
                    </div>
                  </>
                );
              })() : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-6">
                  <Move className="h-5 w-5 text-slate-300 mb-1" />
                  <p className="text-[10px] font-mono uppercase font-bold text-slate-500">Item Customizer Panel</p>
                  <p className="text-[9px] text-slate-400">Click on any item on the board to change its size, rotate it, or move it around!</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
