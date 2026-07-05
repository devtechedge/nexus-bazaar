/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  DollarSign, 
  AlertTriangle, 
  Layers,
  Sparkles,
  Save,
  X
} from 'lucide-react';
import { Product, Order, User, PromoCode } from '../lib/db';

interface SellerViewProps {
  products: Product[];
  orders: Order[];
  currentUser: User;
  onAddProduct: (prod: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviewsCount'>) => void;
  onUpdateProduct: (id: string, prod: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  promoCodes: PromoCode[];
  onAddPromoCode: (code: PromoCode) => void;
  onRemovePromoCode: (code: string) => void;
}

export default function SellerView({
  products,
  orders,
  currentUser,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  promoCodes,
  onAddPromoCode,
  onRemovePromoCode,
}: SellerViewProps) {
  // Modal/Form toggle states
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);

  // Seller Tabs & Vouchers State
  const [activeTab, setActiveTab] = React.useState<'inventory' | 'vouchers' | 'metrics'>('inventory');
  const [voucherCode, setVoucherCode] = React.useState('');
  const [voucherDiscount, setVoucherDiscount] = React.useState(15);
  const [voucherDescription, setVoucherDescription] = React.useState('');
  const [voucherEliteOnly, setVoucherEliteOnly] = React.useState(false);
  const [voucherMinSpend, setVoucherMinSpend] = React.useState(0);
  const [voucherSuccess, setVoucherSuccess] = React.useState(false);

  // Persistent payout states
  const [withdrawnAmount, setWithdrawnAmount] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`nexus_bazaar_withdrawn_${currentUser.id}`);
      return stored ? Number(stored) : 0;
    }
    return 0;
  });

  const [payoutHistory, setPayoutHistory] = React.useState<{ id: string; date: string; amount: number; status: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`nexus_bazaar_payouts_${currentUser.id}`);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [hoveredDataPoint, setHoveredDataPoint] = React.useState<{ date: string; amount: number; x: number; y: number } | null>(null);

  // Form Field State
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [brand, setBrand] = React.useState('');
  const [category, setCategory] = React.useState('Electronics');
  const [price, setPrice] = React.useState(100);
  const [stock, setStock] = React.useState(10);
  const [image, setImage] = React.useState('');
  const [isElite, setIsElite] = React.useState(false);

  // Filter listings belonging to this seller
  const sellerProducts = React.useMemo(() => {
    return products.filter((p) => p.sellerId === currentUser.id);
  }, [products, currentUser.id]);

  // Dynamic Seller Analytics
  const sellerOrders = React.useMemo(() => {
    // Collect all orders containing at least one item from this seller
    return orders.filter((o) => 
      o.items.some((item) => {
        const prod = products.find((p) => p.id === item.productId);
        return prod?.sellerId === currentUser.id;
      })
    );
  }, [orders, products, currentUser.id]);

  const totalSalesRevenue = React.useMemo(() => {
    return sellerOrders.reduce((acc, order) => {
      // Add up subtotal of only items owned by this seller
      const sellerItemsSubtotal = order.items.reduce((sum, item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (prod?.sellerId === currentUser.id) {
          return sum + item.price * item.quantity;
        }
        return sum;
      }, 0);
      return acc + sellerItemsSubtotal;
    }, 0);
  }, [sellerOrders, products, currentUser.id]);

  const lowStockItems = React.useMemo(() => {
    return sellerProducts.filter((p) => p.stock <= 3);
  }, [sellerProducts]);

  // Group seller revenue by date for metrics chart (Feature #8)
  const salesByDate = React.useMemo(() => {
    const dateMap: { [date: string]: number } = {};
    
    // Seed 7 days back to present zero-lines cleanly
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dateMap[dateStr] = 0;
    }

    // Accumulate sales revenue from actual completed orders
    sellerOrders.forEach((order) => {
      const dateStr = order.date.split('T')[0];
      const orderSubtotal = order.items.reduce((sum, item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (prod?.sellerId === currentUser.id) {
          return sum + item.price * item.quantity;
        }
        return sum;
      }, 0);

      if (dateMap[dateStr] !== undefined) {
        dateMap[dateStr] += orderSubtotal;
      } else {
        dateMap[dateStr] = orderSubtotal;
      }
    });

    return Object.keys(dateMap)
      .sort()
      .map((date) => ({
        date,
        amount: dateMap[date],
      }));
  }, [sellerOrders, products, currentUser.id]);

  const availableBalance = Math.max(0, totalSalesRevenue - withdrawnAmount);

  const handleWithdrawFunds = () => {
    if (availableBalance <= 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const newPayout = {
      id: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      date: todayStr,
      amount: availableBalance,
      status: 'Cleared'
    };
    const updatedHistory = [newPayout, ...payoutHistory];
    const updatedWithdrawn = withdrawnAmount + availableBalance;
    
    setPayoutHistory(updatedHistory);
    setWithdrawnAmount(updatedWithdrawn);
    
    localStorage.setItem(`nexus_bazaar_withdrawn_${currentUser.id}`, String(updatedWithdrawn));
    localStorage.setItem(`nexus_bazaar_payouts_${currentUser.id}`, JSON.stringify(updatedHistory));
  };

  // Handle Create listing
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !brand || !image) {
      alert('Please fill out all listing fields completely.');
      return;
    }

    onAddProduct({
      name,
      description,
      brand,
      category,
      price,
      stock,
      image,
      isElite,
    });

    // Reset Fields
    setName('');
    setDescription('');
    setBrand('');
    setImage('');
    setPrice(100);
    setStock(10);
    setIsElite(false);
    setShowAddForm(false);
  };

  // Populate fields for Editing
  const handleStartEdit = (prod: Product) => {
    setEditingProductId(prod.id);
    setName(prod.name);
    setDescription(prod.description);
    setBrand(prod.brand);
    setCategory(prod.category);
    setPrice(prod.price);
    setStock(prod.stock);
    setImage(prod.image);
    setIsElite(prod.isElite);
    setShowAddForm(true);
  };

  // Handle update
  const handleUpdateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;

    onUpdateProduct(editingProductId, {
      name,
      description,
      brand,
      category,
      price,
      stock,
      image,
      isElite,
    });

    // Reset Form
    setEditingProductId(null);
    setName('');
    setDescription('');
    setBrand('');
    setImage('');
    setPrice(100);
    setStock(10);
    setIsElite(false);
    setShowAddForm(false);
  };

  // Cancel edit/form
  const handleCancel = () => {
    setEditingProductId(null);
    setName('');
    setDescription('');
    setBrand('');
    setImage('');
    setPrice(100);
    setStock(10);
    setIsElite(false);
    setShowAddForm(false);
  };

  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim() || !voucherDescription.trim()) return;
    onAddPromoCode({
      code: voucherCode.trim().toUpperCase(),
      discountPercent: Number(voucherDiscount),
      description: voucherDescription.trim(),
      requiresElite: voucherEliteOnly,
      minSubtotal: voucherMinSpend > 0 ? Number(voucherMinSpend) : undefined,
    });
    setVoucherCode('');
    setVoucherDescription('');
    setVoucherEliteOnly(false);
    setVoucherMinSpend(0);
    setVoucherSuccess(true);
    setTimeout(() => setVoucherSuccess(false), 3000);
  };

  const handleBulkReplenish = () => {
    lowStockItems.forEach((p) => {
      onUpdateProduct(p.id, { stock: 15 });
    });
  };

  return (
    <div id="seller-hub-container" className="pb-16 space-y-10">
      
      {/* SELLER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 id="seller-heading" className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-teal-600" />
            <span>Merchant Control Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish products, modify inventory records, and track ledger payouts
          </p>
        </div>
        <button
          id="seller-add-listing-btn"
          onClick={() => { setShowAddForm(true); setEditingProductId(null); }}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Listing</span>
        </button>
      </div>

      {/* ANALYTICS WIDGETS PANEL */}
      <section id="seller-analytics" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        
        {/* Sales Revenue Card */}
        <div id="seller-stat-revenue" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Gross Ledger Earnings</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">${totalSalesRevenue}</p>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">✓ 100% Client Cleared</p>
        </div>

        {/* Total Orders Card */}
        <div id="seller-stat-orders" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Order Payout Transactions</span>
            <Package className="h-4 w-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{sellerOrders.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Sourced from unique buyers</p>
        </div>

        {/* Listings Count Card */}
        <div id="seller-stat-listings" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Active Catalog Items</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{sellerProducts.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Currently indexed by search</p>
        </div>

        {/* Low Stock Card */}
        <div id="seller-stat-lowstock" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Low Inventory Alerts</span>
            <AlertTriangle className={`h-4 w-4 ${lowStockItems.length > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{lowStockItems.length}</p>
          <p className={`text-[10px] mt-1 font-semibold ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {lowStockItems.length > 0 ? 'Requires restock' : 'All stocks healthy'}
          </p>
        </div>

      </section>

      {/* SELLER CONTROL TABS */}
      <div id="seller-tab-bar" className="flex border-b border-slate-100 gap-6">
        <button
          id="seller-tab-inventory"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Catalog Listings & Stocks
        </button>
        <button
          id="seller-tab-vouchers"
          onClick={() => setActiveTab('vouchers')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'vouchers'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Vouchers & Promo Codes
        </button>
        <button
          id="seller-tab-metrics"
          onClick={() => setActiveTab('metrics')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'metrics'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Earnings & Metrics
        </button>
      </div>

      {/* Low Stock Alert Banner (Feature #7) */}
      {lowStockItems.length > 0 && activeTab === 'inventory' && (
        <div id="seller-low-stock-alert-banner" className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in shadow-xs">
          <div>
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Low Stock Warnings Detected</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              There are {lowStockItems.length} catalog listings with 3 or fewer items remaining. Ensure proper inventory flow.
            </p>
          </div>
          <button
            id="seller-bulk-replenish-btn"
            onClick={handleBulkReplenish}
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 shadow-sm cursor-pointer transition-colors"
          >
            Bulk Replenish to 15 Units
          </button>
        </div>
      )}

      {/* INVENTORY TAB CONTENTS */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* CREATE / UPDATE MODAL FORM */}
          {showAddForm && (
            <div id="seller-listing-form-overlay" className="rounded-2xl border border-teal-500/20 bg-teal-50/10 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-teal-600" />
                  <span>{editingProductId ? 'Edit Product Catalog details' : 'Publish New Catalog Listing'}</span>
                </h3>
                <button
                  id="seller-form-cancel"
                  onClick={handleCancel}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form id="seller-listing-form" onSubmit={editingProductId ? handleUpdateListing : handleCreateListing} className="grid gap-4 sm:grid-cols-6 text-xs">
                
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-600">Product Name</label>
                  <input
                    id="seller-prod-name"
                    type="text"
                    required
                    placeholder="e.g. Aether-X ANC Headset"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-600">Brand / Manufacturer</label>
                  <input
                    id="seller-prod-brand"
                    type="text"
                    required
                    placeholder="e.g. AuraSound"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs font-bold text-slate-600">Full Description</label>
                  <textarea
                    id="seller-prod-description"
                    required
                    rows={3}
                    placeholder="Share detailed metrics, features, batteries, materials..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-600">Category segment</label>
                  <select
                    id="seller-prod-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Workspace">Workspace</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-600">Price ($ USD)</label>
                  <input
                    id="seller-prod-price"
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-600">Stock Capacity</label>
                  <input
                    id="seller-prod-stock"
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-600">Image Resource URL</label>
                  <input
                    id="seller-prod-image"
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                {/* Elite Selection checkbox */}
                <div className="sm:col-span-2 flex items-center justify-between border border-slate-100 rounded-xl bg-white px-3 mt-4">
                  <div className="leading-none">
                    <span className="font-bold text-slate-700">Elite tier exclusive</span>
                    <p className="text-[9px] text-slate-400 mt-0.5">Eligibility benefits</p>
                  </div>
                  <input
                    id="seller-prod-isElite"
                    type="checkbox"
                    checked={isElite}
                    onChange={(e) => setIsElite(e.target.checked)}
                    className="h-4.5 w-4.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                </div>

                <div className="sm:col-span-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    id="seller-form-cancel-btn"
                    type="button"
                    onClick={handleCancel}
                    className="rounded-xl border border-slate-200 hover:border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="seller-form-submit-btn"
                    type="submit"
                    className="flex items-center gap-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 text-xs font-bold shadow-sm transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingProductId ? 'Update Listing Details' : 'Publish to Catalog'}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ACTIVE INVENTORY MANAGEMENT TABLE */}
          <section id="seller-inventory" className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">Direct Catalog Inventory Payout Ledger</h3>
            </div>

            {sellerProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider font-mono">
                      <th className="px-6 py-4">Listed item</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Rate ($)</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                    {sellerProducts.map((prod) => (
                      <tr id={`seller-inventory-row-${prod.id}`} key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={prod.image} alt={prod.name} className="h-10 w-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-semibold text-slate-800 truncate max-w-[200px]" title={prod.name}>{prod.name}</p>
                            <span className="text-[10px] font-mono text-slate-400">{prod.brand}</span>
                            {prod.isElite && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold text-amber-800">
                                Elite
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">{prod.category}</td>
                        <td className="px-6 py-4 font-mono font-bold">${prod.price}</td>
                        <td className="px-6 py-4">
                          {/* Direct stock adjuster buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              id={`seller-restock-dec-${prod.id}`}
                              onClick={() => onUpdateProduct(prod.id, { stock: Math.max(0, prod.stock - 1) })}
                              className="h-6 w-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                            >
                              -
                            </button>
                            <span id={`seller-stock-qty-${prod.id}`} className="font-mono font-bold w-6 text-center">{prod.stock}</span>
                            <button
                              id={`seller-restock-inc-${prod.id}`}
                              onClick={() => onUpdateProduct(prod.id, { stock: prod.stock + 1 })}
                              className="h-6 w-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {prod.stock > 3 ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Healthy</span>
                          ) : prod.stock > 0 ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Low Stock</span>
                          ) : (
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">Sold Out</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2.5">
                          <button
                            id={`seller-edit-${prod.id}`}
                            onClick={() => handleStartEdit(prod)}
                            className="text-slate-400 hover:text-teal-600"
                            title="Edit Details"
                          >
                            <Edit3 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            id={`seller-delete-${prod.id}`}
                            onClick={() => {
                              if (confirm(`Confirm deletion of ${prod.name}? This will remove it from the searchable bazaar catalog.`)) {
                                onDeleteProduct(prod.id);
                              }
                            }}
                            className="text-slate-300 hover:text-rose-600"
                            title="Delete Listing"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-10">You have no active products listed. Click "Post New Listing" to seed products.</p>
            )}
          </section>
        </div>
      )}

      {/* VOUCHERS TAB CONTENTS (Feature #5) */}
      {activeTab === 'vouchers' && (
        <div id="seller-promotions-section" className="grid gap-8 md:grid-cols-12 animate-fade-in">
          
          {/* VOUCHER CREATOR */}
          <div id="voucher-creator-form-card" className="md:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-teal-600" />
                <span>Create Store Voucher</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Publish custom discounts applied at platform checkouts</p>
            </div>

            <form id="seller-voucher-form" onSubmit={handleVoucherSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Voucher Code</label>
                <input
                  id="voucher-code"
                  type="text"
                  required
                  placeholder="e.g. EXTRA25"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 uppercase font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Discount Percent (%)</label>
                <input
                  id="voucher-discount"
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={voucherDiscount}
                  onChange={(e) => setVoucherDiscount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Short Description</label>
                <input
                  id="voucher-description"
                  type="text"
                  required
                  placeholder="e.g. 25% off storewide workspace gadgets"
                  value={voucherDescription}
                  onChange={(e) => setVoucherDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Min Spend ($)</label>
                  <input
                    id="voucher-min-spend"
                    type="number"
                    min={0}
                    value={voucherMinSpend}
                    onChange={(e) => setVoucherMinSpend(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center justify-between border border-slate-100 rounded-xl bg-slate-50 px-3 mt-4 h-11">
                  <div className="leading-none">
                    <span className="font-bold text-slate-700 text-[10px]">Elite Only</span>
                  </div>
                  <input
                    id="voucher-elite-only"
                    type="checkbox"
                    checked={voucherEliteOnly}
                    onChange={(e) => setVoucherEliteOnly(e.target.checked)}
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                </div>
              </div>

              {voucherSuccess && (
                <p className="text-emerald-600 text-xs font-semibold animate-pulse">✓ Voucher successfully added to ledger!</p>
              )}

              <button
                id="submit-voucher-btn"
                type="submit"
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 shadow-sm transition-colors cursor-pointer"
              >
                Publish Store Voucher
              </button>
            </form>
          </div>

          {/* VOUCHERS LIST */}
          <div id="active-vouchers-card" className="md:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Active Platform Promotion Codes</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Verify active codes, spending thresholds, and elite criteria</p>
            </div>

            <div className="space-y-3.5">
              {promoCodes.length > 0 ? (
                promoCodes.map((pc) => (
                  <div id={`voucher-item-${pc.code}`} key={pc.code} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                          {pc.code}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {pc.discountPercent}% Off
                        </span>
                        {pc.requiresElite && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold text-amber-800 uppercase tracking-wider font-mono">
                            Elite
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{pc.description}</p>
                      <p className="text-[9px] text-slate-400 font-mono">
                        {pc.minSubtotal ? `Requires subtotal >= $${pc.minSubtotal}` : 'No minimum subtotal constraint'}
                      </p>
                    </div>

                    <button
                      id={`delete-voucher-${pc.code}`}
                      onClick={() => onRemovePromoCode(pc.code)}
                      className="text-slate-300 hover:text-rose-600 cursor-pointer p-1 rounded-lg hover:bg-rose-50/50 transition-colors"
                      title="Revoke Voucher"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-10">No active promotion codes found on the platform.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* METRICS & DISBURSALS TAB CONTENTS (Feature #8) */}
      {activeTab === 'metrics' && (
        <div id="seller-metrics-container" className="grid gap-6 md:grid-cols-12 animate-fade-in text-xs">
          
          {/* LEDGER EARNINGS STATUS PANEL */}
          <div className="md:col-span-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 border border-teal-100/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Payout Vault Ledger
              </span>
              <h3 className="text-sm font-bold text-slate-800 mt-4">Merchant Disbursal Account</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-relaxed">
                Funds are held in escrow until order completion and can be immediately transferred to your merchant banking endpoint.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Accumulated Gross Revenue</span>
                <span className="font-mono font-bold text-slate-800">${totalSalesRevenue}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Withdrawn to Date</span>
                <span className="font-mono font-bold text-slate-500">-${withdrawnAmount}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-800 font-bold">Liquid Disbursal Balance</span>
                <span id="liquid-payout-balance" className="font-mono text-xl font-black text-emerald-600">${availableBalance}</span>
              </div>
            </div>

            <button
              id="payout-withdraw-funds-btn"
              disabled={availableBalance <= 0}
              onClick={handleWithdrawFunds}
              className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs shadow-md disabled:shadow-none transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <DollarSign className="h-4 w-4" />
              <span>Withdraw to Verified Bank</span>
            </button>
          </div>

          {/* DYNAMIC VISUAL SALES LINE CHART (8 cols) */}
          <div className="md:col-span-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Chronological Revenue Metrics</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Live visual timeline of gross e-commerce sales (7-Day Rolling Window)</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="font-medium text-[10px] uppercase font-mono tracking-wider">Telemetry Stream</span>
              </div>
            </div>

            {/* THE CHART SVG ELEMENT */}
            <div className="relative w-full border border-slate-50 bg-slate-50/20 rounded-xl p-3 select-none">
              {salesByDate.length > 0 ? (
                <div className="w-full h-[180px]">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
                    <defs>
                      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* HORIZONTAL GRIDLINES */}
                    <line x1="45" y1="20" x2="485" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="45" y1="63" x2="485" y2="63" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="45" y1="106" x2="485" y2="106" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="45" y1="150" x2="485" y2="150" stroke="#f1f5f9" strokeWidth="1.5" />

                    {/* Y AXIS TICK TEXTS */}
                    <text x="38" y="23" textAnchor="end" className="font-mono text-[8px] fill-slate-400">
                      ${Math.max(...salesByDate.map(d => d.amount), 100)}
                    </text>
                    <text x="38" y="85" textAnchor="end" className="font-mono text-[8px] fill-slate-400">
                      ${Math.round(Math.max(...salesByDate.map(d => d.amount), 100) / 2)}
                    </text>
                    <text x="38" y="153" textAnchor="end" className="font-mono text-[8px] fill-slate-400">
                      $0
                    </text>

                    {/* RENDER THE AREA POLYGON */}
                    {salesByDate.length > 0 && (() => {
                      const maxAmount = Math.max(...salesByDate.map((d) => d.amount), 100);
                      const width = 500;
                      const height = 180;
                      const paddingLeft = 45;
                      const plotWidth = width - paddingLeft - 15;
                      const plotHeight = height - 20 - 30;

                      const pts = salesByDate.map((d, index) => {
                        const x = paddingLeft + (index / Math.max(1, salesByDate.length - 1)) * plotWidth;
                        const y = 20 + plotHeight - (d.amount / maxAmount) * plotHeight;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      });

                      const firstX = paddingLeft;
                      const lastX = paddingLeft + plotWidth;
                      const bottomY = 150;

                      const polyPoints = `${pts.join(' ')} ${lastX.toFixed(1)},${bottomY} ${firstX.toFixed(1)},${bottomY}`;
                      const linePath = `M ${pts.map(p => p.replace(',', ' ')).join(' L ')}`;

                      return (
                        <g>
                          <polygon points={polyPoints} fill="url(#chart-grad)" />
                          <path d={linePath} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {/* Circle elements & hover interaction listeners */}
                          {salesByDate.map((d, index) => {
                            const x = paddingLeft + (index / Math.max(1, salesByDate.length - 1)) * plotWidth;
                            const y = 20 + plotHeight - (d.amount / maxAmount) * plotHeight;
                            const isHovered = hoveredDataPoint?.date === d.date;

                            return (
                              <g key={d.date}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="12"
                                  fill="transparent"
                                  className="cursor-pointer"
                                  onMouseEnter={() => {
                                    setHoveredDataPoint({
                                      date: d.date,
                                      amount: d.amount,
                                      x,
                                      y
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredDataPoint(null)}
                                />
                                <circle
                                  cx={x}
                                  cy={y}
                                  r={isHovered ? "6" : "4"}
                                  fill={isHovered ? "#0d9488" : "#ffffff"}
                                  stroke="#0d9488"
                                  strokeWidth={isHovered ? "3" : "2"}
                                  className="transition-all duration-150 pointer-events-none"
                                />
                              </g>
                            );
                          })}
                        </g>
                      );
                    })()}

                  </svg>

                  {/* HOVER TOOLTIP FLOATER */}
                  {hoveredDataPoint && (
                    <div
                      id="chart-hover-tooltip"
                      className="absolute bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-mono shadow-md border border-slate-800 pointer-events-none animate-fade-in z-50 animate-scale-in"
                      style={{
                        left: `${(hoveredDataPoint.x / 500) * 100}%`,
                        top: `${(hoveredDataPoint.y / 180) * 100 - 20}%`,
                        transform: 'translateX(-50%) translateY(-100%)',
                      }}
                    >
                      <p className="font-bold text-[8px] text-teal-400 uppercase leading-none">{hoveredDataPoint.date}</p>
                      <p className="font-bold mt-1 leading-none">Sales: ${hoveredDataPoint.amount}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-slate-400 text-xs italic">
                  Accumulating telemetry... Post active listings or process customer transactions to draw metrics.
                </div>
              )}
            </div>
          </div>

          {/* PAYOUT LEDGER TRANSACTION AUDIT (12 cols) */}
          <div className="md:col-span-12 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Disbursal Ledger Audit Logs</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Verify the exact status, dates, and historical records of merchant bank pay transfers</p>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50 font-mono text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-4 font-bold">Transaction Reference ID</th>
                    <th className="p-4 font-bold">Processing Date</th>
                    <th className="p-4 font-bold">Settled Amount</th>
                    <th className="p-4 font-bold">Logistics Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600 font-medium">
                  {payoutHistory.length > 0 ? (
                    payoutHistory.map((payout) => (
                      <tr id={`payout-row-${payout.id}`} key={payout.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-800">{payout.id}</td>
                        <td className="p-4">{payout.date}</td>
                        <td className="p-4 font-extrabold text-emerald-600">${payout.amount}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span>{payout.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 italic font-sans text-xs">
                        No previous cashout records detected. Earn revenue and trigger your first transfer!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
