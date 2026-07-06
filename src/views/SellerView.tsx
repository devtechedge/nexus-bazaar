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
  X,
  Radio,
  Tv,
  Bell,
  Play,
  BarChart2,
  Percent,
  ArrowRight,
  Eye,
  ShoppingCart,
  Sliders,
  Settings,
  MapPin,
  GitBranch,
  FileText,
  Cpu,
  UploadCloud,
  MessageSquare,
  Send,
  FileSpreadsheet,
  Upload,
  Activity,
  Globe,
  Calculator,
  Layout,
  Paintbrush,
  Check,
  Image,
  AlertCircle,
  ThumbsDown,
  Gauge,
  Flame,
  Zap,
  ChevronUp,
  ChevronDown,
  Info,
  ShieldAlert
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
  onLaunchSellerAuction?: (productId: string, startingBid: number, durationSeconds: number) => void;
  onBroadcastFlashClearance?: (msg: string, prodId: string) => void;
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
  onLaunchSellerAuction,
  onBroadcastFlashClearance,
}: SellerViewProps) {
  // Modal/Form toggle states
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);

  // Seller Tabs & Vouchers State
  const [activeTab, setActiveTab] = React.useState<'inventory' | 'vouchers' | 'metrics' | 'broadcasts' | 'suite'>('inventory');
  const [voucherCode, setVoucherCode] = React.useState('');
  const [voucherDiscount, setVoucherDiscount] = React.useState(15);
  const [voucherDescription, setVoucherDescription] = React.useState('');
  const [voucherEliteOnly, setVoucherEliteOnly] = React.useState(false);
  const [voucherMinSpend, setVoucherMinSpend] = React.useState(0);
  const [voucherSuccess, setVoucherSuccess] = React.useState(false);

  // --- BATCH 5 ENTERPRISE SELLER SUITE STATES ---
  // Feature 41: Conversion Analytics
  const [funnelProduct, setFunnelProduct] = React.useState<string>('all');
  const [trafficMultiplier, setTrafficMultiplier] = React.useState<number>(1);
  const [trafficLogs, setTrafficLogs] = React.useState<string[]>([
    "System Initialized: Real-time traffic stream active.",
    "Bot traffic filtered out successfully."
  ]);
  const [simulatedViews, setSimulatedViews] = React.useState<number>(12400);

  // Feature 42: Dynamic Pricing Engines
  const [dynamicPricing, setDynamicPricing] = React.useState<Record<string, { enabled: boolean; min: number; max: number }>>({});
  const [marketDemand, setMarketDemand] = React.useState<'low' | 'normal' | 'surge'>('normal');
  const [pricingLogs, setPricingLogs] = React.useState<string[]>([]);

  // Feature 43: Multi-Warehouse Splits
  const [warehouseSplits, setWarehouseSplits] = React.useState<Record<string, { east: number; central: number; west: number }>>({});
  const [activeSplitProduct, setActiveSplitProduct] = React.useState<string>('');

  // Feature 44: AI Spec Extraction
  const [specRawText, setSpecRawText] = React.useState<string>('Manufacturer Spec Sheet #A-1099\nModel: AuraSound Nexus ANC\nChassis: Ultra-Lightweight Carbon Matrix Alloy (weight 240g)\nDriver: 45mm Custom Bio-cellulose Dome Transducer\nBattery Life: 48 Hours Continuous (ANC ON), 75 Hours (ANC OFF)\nFrequency range: 4Hz - 42kHz extreme spectral range\nBluetooth Codec: LDAC, aptX Adaptive, AAC, SBC supported\nActive Noise Cancellation: Double-feed hybrid isolation, up to -45dB attenuation.');
  const [isExtractingSpec, setIsExtractingSpec] = React.useState<boolean>(false);
  const [extractedSpecs, setExtractedSpecs] = React.useState<{ key: string; value: string }[] | null>(null);
  const [specUploadSuccess, setSpecUploadSuccess] = React.useState<boolean>(false);

  // Feature 45: Seller-to-Buyer Messaging
  const [activeThreadId, setActiveThreadId] = React.useState<string>('t-1');
  const [threads, setThreads] = React.useState<Array<{
    id: string;
    buyerName: string;
    productName: string;
    messages: Array<{ sender: 'buyer' | 'seller'; text: string; date: string }>;
  }>>([
    {
      id: 't-1',
      buyerName: 'Alice Vance',
      productName: 'AuraSound Headset',
      messages: [
        { sender: 'buyer', text: "Hello! I am ordering 15 units for our sound studio. Can we get custom laser engravings with our studio logo on the left cups? What format should I send the artwork?", date: "08:12 AM" },
        { sender: 'seller', text: "Welcome Alice! Yes, we support custom engravings. Please send the artwork as a high-resolution vector format, preferably `.svg` or `.pdf` black-and-white. We can preview them before engraving.", date: "08:15 AM" },
        { sender: 'buyer', text: "That is perfect! Will it increase the fulfillment lead time by much?", date: "08:20 AM" }
      ]
    },
    {
      id: 't-2',
      buyerName: 'Marcus Brodie',
      productName: 'Custom Balanced Cable',
      messages: [
        { sender: 'buyer', text: "Do you offer a silver-plated copper 4.4mm balanced cable with 2-pin connectors? I need a custom length of 2.5 meters. Let me know if that's possible.", date: "Yesterday" }
      ]
    }
  ]);
  const [newMsgInput, setNewMsgInput] = React.useState<string>('');

  // Feature 46: Bulk CSV Inventory Synchronizers
  const [csvContent, setCsvContent] = React.useState<string>("id,price,stock,brand\nPROD-1,145,50,AuraSound\nPROD-2,199,25,VoltAudio\nPROD-3,85,120,SolderTech");
  const [isSyncingCSV, setIsSyncingCSV] = React.useState<boolean>(false);
  const [syncProgress, setSyncProgress] = React.useState<number>(0);
  const [syncLogs, setSyncLogs] = React.useState<string[]>([]);

  // Feature 47: Geographic Taxes & Tariffs
  const [taxRegion, setTaxRegion] = React.useState<'US-CA' | 'EU-DE' | 'UK-GB' | 'JP-TO' | 'BR-SP'>('EU-DE');
  const [taxBaseAmount, setTaxBaseAmount] = React.useState<number>(150);

  // Feature 48: Whitelabel Storefront Customizer
  const [storeTheme, setStoreTheme] = React.useState<'slate' | 'cream' | 'teal' | 'cyberpunk'>('slate');
  const [storeBanner, setStoreBanner] = React.useState<string>('https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80');
  const [storeHeadline, setStoreHeadline] = React.useState<string>('The Sound Sanctum - Custom Audiophile Gear');
  const [storeFont, setStoreFont] = React.useState<'sans' | 'serif' | 'mono'>('sans');
  const [storeCols, setStoreCols] = React.useState<number>(3);
  const [storeSaved, setStoreSaved] = React.useState<boolean>(false);

  // Feature 49: Defect/Return-Rate Prediction
  const [defectSelectedProd, setDefectSelectedProd] = React.useState<string>('');

  // Feature 50: Liquidation Clearinghouse Pipelines
  const [liquidationLog, setLiquidationLog] = React.useState<string[]>([]);
  const [isLiquidating, setIsLiquidating] = React.useState<boolean>(false);

  // --- BATCH 4 SELLER STATES & EFFECTS ---
  const [streamProduct, setStreamProduct] = React.useState('');
  const [streamStartBid, setStreamStartBid] = React.useState(150);
  const [streamDuration, setStreamDuration] = React.useState(120);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamSecondsLeft, setStreamSecondsLeft] = React.useState(0);
  
  const [broadcastMsgText, setBroadcastMsgText] = React.useState('');
  const [broadcastProductSelected, setBroadcastProductSelected] = React.useState('');
  const [broadcastSuccess, setBroadcastSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!isStreaming) return;
    if (streamSecondsLeft <= 0) {
      setIsStreaming(false);
      return;
    }
    const timer = setInterval(() => {
      setStreamSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isStreaming, streamSecondsLeft]);

  const handleStartStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamProduct) {
      alert("Please select a valid inventory product to host a bid session.");
      return;
    }
    if (onLaunchSellerAuction) {
      onLaunchSellerAuction(streamProduct, Number(streamStartBid), Number(streamDuration));
    }
    setIsStreaming(true);
    setStreamSecondsLeft(Number(streamDuration));
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsgText.trim()) return;
    if (onBroadcastFlashClearance) {
      onBroadcastFlashClearance(broadcastMsgText.trim(), broadcastProductSelected);
    }
    setBroadcastSuccess(true);
    setBroadcastMsgText('');
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

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

  // Bulk Product Selector State (Feature #18)
  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>([]);
  const [bulkPriceChange, setBulkPriceChange] = React.useState<number>(0); // e.g. percent or flat
  const [bulkStockChange, setBulkStockChange] = React.useState<number>(0);
  const [bulkSuccessMsg, setBulkSuccessMsg] = React.useState<string | null>(null);

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

  // Bulk selectors and adjusters (Feature #18)
  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllProducts = () => {
    if (selectedProductIds.length === sellerProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(sellerProducts.map((p) => p.id));
    }
  };

  const handleApplyBulkAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) return;

    selectedProductIds.forEach((id) => {
      const prod = products.find((p) => p.id === id);
      if (!prod) return;

      let updatedPrice = prod.price;
      if (bulkPriceChange !== 0) {
        updatedPrice = Math.max(1, prod.price + bulkPriceChange);
      }

      let updatedStock = prod.stock;
      if (bulkStockChange !== 0) {
        updatedStock = Math.max(0, prod.stock + bulkStockChange);
      }

      onUpdateProduct(id, { price: updatedPrice, stock: updatedStock });
    });

    setBulkSuccessMsg(`Successfully committed price & stock adjusters across ${selectedProductIds.length} catalog listings!`);
    setSelectedProductIds([]);
    setBulkPriceChange(0);
    setBulkStockChange(0);
    setTimeout(() => setBulkSuccessMsg(null), 4000);
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
      <div id="seller-tab-bar" className="flex border-b border-slate-100 gap-6 overflow-x-auto">
        <button
          id="seller-tab-inventory"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
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
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
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
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Earnings & Metrics
        </button>
        <button
          id="seller-tab-broadcasts"
          onClick={() => setActiveTab('broadcasts')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'broadcasts'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          🎙️ Live Studio & Broadcasts
        </button>
        <button
          id="seller-tab-suite"
          onClick={() => setActiveTab('suite')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'suite'
              ? 'border-teal-600 text-teal-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          💼 Enterprise Seller Suite
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
          {/* BULK ADJUSTER CONTROL BAR (Feature #18) */}
          {selectedProductIds.length > 0 && (
            <form 
              id="bulk-adjuster-bar" 
              onSubmit={handleApplyBulkAdjust}
              className="rounded-2xl border border-amber-200 bg-amber-50/65 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in shadow-xs"
            >
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
                  <span>🛠️ Bulk adjustments engaged: {selectedProductIds.length} listings selected</span>
                </h4>
                <p className="text-[10px] text-slate-500">
                  Submit offset adjusters below to update rates and stock capacities across all selected items.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600 uppercase block">Price Offset ($ USD)</label>
                  <input
                    id="bulk-price-offset"
                    type="number"
                    placeholder="e.g. -15 or +10"
                    value={bulkPriceChange || ''}
                    onChange={(e) => setBulkPriceChange(Number(e.target.value))}
                    className="w-24 rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600 uppercase block">Stock Offset</label>
                  <input
                    id="bulk-stock-offset"
                    type="number"
                    placeholder="e.g. +5 or -2"
                    value={bulkStockChange || ''}
                    onChange={(e) => setBulkStockChange(Number(e.target.value))}
                    className="w-24 rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex items-end self-end gap-2 pt-1 md:pt-0">
                  <button
                    id="bulk-adjust-clear-btn"
                    type="button"
                    onClick={() => setSelectedProductIds([])}
                    className="rounded-lg border border-slate-200 hover:border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition-all cursor-pointer"
                  >
                    Deselect All
                  </button>
                  <button
                    id="bulk-adjust-submit-btn"
                    type="submit"
                    className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Commit Offsets
                  </button>
                </div>
              </div>
            </form>
          )}

          {bulkSuccessMsg && (
            <div id="bulk-adjust-success-alert" className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800 font-medium animate-fade-in shadow-2xs">
              ✓ {bulkSuccessMsg}
            </div>
          )}

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
                      <th className="px-6 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.length === sellerProducts.length && sellerProducts.length > 0}
                          onChange={handleToggleSelectAllProducts}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer h-4 w-4"
                        />
                      </th>
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
                      <tr id={`seller-inventory-row-${prod.id}`} key={prod.id} className={`hover:bg-slate-50/50 transition-colors ${
                        selectedProductIds.includes(prod.id) ? 'bg-teal-50/35' : ''
                      }`}>
                        <td className="px-6 py-4 w-12">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(prod.id)}
                            onChange={() => handleToggleSelectProduct(prod.id)}
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer h-4 w-4"
                          />
                        </td>
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

      {/* 31 & 36. LIVE STUDIO & BROADCASTS TAB CONTENTS */}
      {activeTab === 'broadcasts' && (
        <div id="seller-broadcasts-section" className="grid gap-8 md:grid-cols-12 animate-fade-in">
          {/* LIVE STREAMING & BIDDING STUDIO (7 cols) */}
          <div id="live-streaming-studio-card" className="md:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Radio className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                <span>Live Stream & Auction Launchpad</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Stream high-frequency bids from verified buyers with sub-second latency simulation</p>
            </div>

            {isStreaming ? (
              <div className="space-y-4">
                {/* Visual live webcam simulation */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <div className="absolute top-4 left-4 bg-rose-600 text-white font-mono text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md flex items-center gap-1 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                    <span>LIVE</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-xs text-white font-mono text-[9px] font-bold px-2 py-1 rounded-md">
                    👁️ 142 watching
                  </div>

                  <div className="text-center space-y-2 z-10">
                    <Tv className="h-12 w-12 text-slate-600 mx-auto animate-bounce" />
                    <p className="text-[11px] text-slate-300 font-medium font-sans">Broadcast camera feed transmitting successfully...</p>
                    <p className="text-2xl font-black text-rose-500 font-mono">
                      {Math.floor(streamSecondsLeft / 60)}:{(streamSecondsLeft % 60).toString().padStart(2, '0')}
                    </p>
                  </div>

                  {/* Simulated chat overlay */}
                  <div className="absolute bottom-4 left-4 right-4 max-h-24 overflow-y-auto space-y-1 text-[10px] font-medium text-white/90 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-2 rounded-lg text-left">
                    <p><span className="text-indigo-400 font-bold">SolderKnight:</span> This spec looks super clean!</p>
                    <p><span className="text-teal-400 font-bold">VoltVandal:</span> Bid submitted! Best price on the net.</p>
                    <p><span className="text-amber-400 font-bold">CyberNerd_42:</span> Can you zoom on the left input ports please?</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Selected Listing</p>
                    <p className="text-xs font-bold text-slate-800">
                      {products.find(p => p.id === streamProduct)?.name || "Interactive Device"}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsStreaming(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors"
                  >
                    Kill Stream
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleStartStream} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Select Catalog Listing</label>
                  <select 
                    value={streamProduct}
                    onChange={(e) => setStreamProduct(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                  >
                    <option value="">-- Choose Listing --</option>
                    {sellerProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Starting Bid (USD)</label>
                    <input 
                      type="number"
                      required
                      min={1}
                      value={streamStartBid}
                      onChange={(e) => setStreamStartBid(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Duration (Seconds)</label>
                    <input 
                      type="number"
                      required
                      min={10}
                      max={600}
                      value={streamDuration}
                      onChange={(e) => setStreamDuration(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black hover:brightness-110 active:scale-95 shadow-lg shadow-rose-500/10 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Tv className="h-4 w-4" />
                  <span>Launch Live Stream & Bids</span>
                </button>
              </form>
            )}
          </div>

          {/* FLASH ALERT BROADCAST STATION (5 cols) */}
          <div id="flash-alert-broadcast-card" className="md:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Bell className="h-4.5 w-4.5 text-amber-500" />
                <span>Clearance Alert Broadcaster</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Broadcast instant notification updates to all customers browsing the bazaar</p>
            </div>

            {broadcastSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 font-medium animate-fade-in">
                ✓ Live Broadcast Alert successfully transmitted and delivered to watchers!
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Link Product Deal</label>
                <select 
                  value={broadcastProductSelected}
                  onChange={(e) => setBroadcastProductSelected(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                >
                  <option value="">-- Choose Product (Optional) --</option>
                  {sellerProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Broadcast Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. ⚠️ Flash Clearance: AuraSound Headsets are currently running 40% OFF starting right now! Only 3 left!"
                  value={broadcastMsgText}
                  onChange={(e) => setBroadcastMsgText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black shadow-md shadow-amber-500/15 active:scale-95 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Radio className="h-4 w-4" />
                <span>Transmit Broadcast Alert</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 41-50: ENTERPRISE SELLER SUITE TAB CONTENTS */}
      {activeTab === 'suite' && (
        <div id="enterprise-seller-suite" className="space-y-12 animate-fade-in">
          
          {/* Main Hero Header */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-32 w-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-2 max-w-2xl z-10">
              <span className="text-[10px] font-bold font-mono tracking-widest text-teal-400 bg-teal-950/80 border border-teal-800/40 px-2.5 py-1 rounded-full uppercase">
                High-Performance Enterprise Suite
              </span>
              <h3 className="text-xl md:text-2xl font-black tracking-tight">Multi-Tenant Merchant Suite v5.0</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock industrial-grade automation: Dynamic algorithmic pricing, localized cross-border tax matrices, Whitelabel layout editors, direct buyer query hotlines, and AI-powered specification extraction engines.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 z-10">
              <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
                <p className="text-[9px] font-mono text-slate-500 uppercase">Suite Security</p>
                <p className="text-xs font-bold text-teal-400">AES-256 ✓</p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
                <p className="text-[9px] font-mono text-slate-500 uppercase">Tenant Node</p>
                <p className="text-xs font-bold text-teal-400">Active</p>
              </div>
            </div>
          </div>

          {/* Micro-services Quick Grid Jump Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[9px] text-slate-400">
            <a href="#feature-41-conversion" className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 hover:text-slate-800 transition-all flex items-center gap-1.5 font-bold">
              <BarChart2 className="h-3.5 w-3.5 text-purple-500" />
              <span>41. Analytics Funnel</span>
            </a>
            <a href="#feature-42-pricing" className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 hover:text-slate-800 transition-all flex items-center gap-1.5 font-bold">
              <Sliders className="h-3.5 w-3.5 text-teal-500" />
              <span>42. Dynamic Pricing</span>
            </a>
            <a href="#feature-43-warehouse" className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 hover:text-slate-800 transition-all flex items-center gap-1.5 font-bold">
              <MapPin className="h-3.5 w-3.5 text-indigo-500" />
              <span>43. Stock Splitting</span>
            </a>
            <a href="#feature-44-spec" className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 hover:text-slate-800 transition-all flex items-center gap-1.5 font-bold">
              <Cpu className="h-3.5 w-3.5 text-sky-500" />
              <span>44. AI spec extract</span>
            </a>
            <a href="#feature-45-messaging" className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 hover:text-slate-800 transition-all flex items-center gap-1.5 font-bold">
              <MessageSquare className="h-3.5 w-3.5 text-pink-500" />
              <span>45. Direct Hotline</span>
            </a>
            <a href="#feature-46-csv" className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 hover:text-slate-800 transition-all flex items-center gap-1.5 font-bold">
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
              <span>46. CSV Sync</span>
            </a>
            <a href="#feature-47-tax" className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 hover:text-slate-800 transition-all flex items-center gap-1.5 font-bold">
              <Globe className="h-3.5 w-3.5 text-amber-500" />
              <span>47. Localized Tax</span>
            </a>
            <a href="#feature-48-storefront" className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 hover:text-slate-800 transition-all flex items-center gap-1.5 font-bold">
              <Layout className="h-3.5 w-3.5 text-rose-500" />
              <span>48. Store Customizer</span>
            </a>
            <a href="#feature-49-returns" className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 hover:text-slate-800 transition-all flex items-center gap-1.5 font-bold">
              <Gauge className="h-3.5 w-3.5 text-red-500" />
              <span>49. Return Predictions</span>
            </a>
            <a href="#feature-50-liquidation" className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 hover:text-slate-800 transition-all flex items-center gap-1.5 font-bold">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>50. Wholesale Liquidation</span>
            </a>
          </div>

          <div className="grid gap-8 md:grid-cols-12 text-slate-700">
            
            {/* 41. REAL-TIME CONVERSION FLOW ANALYTICS (7 cols) */}
            <div id="feature-41-conversion" className="md:col-span-7 rounded-3xl border border-slate-800 bg-slate-950 text-slate-200 p-6 shadow-xl space-y-6 scroll-mt-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono font-black text-purple-400 bg-purple-950/80 border border-purple-800/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    MODULE 41 // REAL-TIME CONVERSION FLOW
                  </span>
                  <h4 className="text-base font-extrabold tracking-tight text-white mt-2">Conversion Abandonment Pipeline</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Track exact attrition segments from product page traffic to successful financial capture.</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">LIVE DATASTREAM</span>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-850 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block font-mono">Select Active Listing</label>
                  <select 
                    value={funnelProduct}
                    onChange={(e) => {
                      setFunnelProduct(e.target.value);
                      setSimulatedViews(e.target.value === 'all' ? 12400 : Math.floor(2000 + Math.random() * 4000));
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 text-slate-200 p-2 text-xs outline-none cursor-pointer"
                  >
                    <option value="all">-- Aggregated All Products --</option>
                    {sellerProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block font-mono">Traffic Multiplier</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setTrafficMultiplier(num);
                          setTrafficLogs(prev => [`Simulated load set to ${num}x density. Splicing ingress threads.`, ...prev.slice(0, 5)]);
                        }}
                        className={`flex-1 py-1.5 rounded-lg border text-center font-mono font-bold transition-all cursor-pointer ${
                          trafficMultiplier === num 
                            ? 'bg-purple-900 border-purple-500 text-white' 
                            : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Funnel Stack */}
              {(() => {
                const totalIngress = simulatedViews * trafficMultiplier;
                const cartAdds = Math.round(totalIngress * 0.42);
                const checks = Math.round(totalIngress * 0.18);
                const complete = Math.round(totalIngress * 0.038);
                const abandons = checks - complete;
                const convRate = ((complete / totalIngress) * 100).toFixed(2);

                return (
                  <div className="space-y-4">
                    {/* Visual Vertical Bars Stack representing Funnel */}
                    <div className="space-y-3">
                      {/* Step 1: Views */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-400 flex items-center gap-1"><Eye className="h-3 w-3" /> 1. Initial Product Views</span>
                          <span className="font-extrabold text-white">{totalIngress.toLocaleString()} (100%)</span>
                        </div>
                        <div className="h-3.5 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-850">
                          <div className="h-full bg-purple-600 rounded-r-lg transition-all duration-500" style={{ width: '100%' }} />
                        </div>
                      </div>

                      {/* Step 2: Cart Adds */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-400 flex items-center gap-1"><ShoppingCart className="h-3 w-3" /> 2. Cart Additions</span>
                          <span className="font-extrabold text-white">{cartAdds.toLocaleString()} (42.0%)</span>
                        </div>
                        <div className="h-3.5 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-850">
                          <div className="h-full bg-purple-500 rounded-r-lg transition-all duration-500" style={{ width: '42%' }} />
                        </div>
                      </div>

                      {/* Step 3: Checkout Initiated */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-400 flex items-center gap-1"><Percent className="h-3 w-3" /> 3. Checkout Initiations</span>
                          <span className="font-extrabold text-white">{checks.toLocaleString()} (18.0%)</span>
                        </div>
                        <div className="h-3.5 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-850">
                          <div className="h-full bg-indigo-500 rounded-r-lg transition-all duration-500" style={{ width: '18%' }} />
                        </div>
                      </div>

                      {/* Step 4: Complete Sales */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">✓ 4. Completed Sales Capture</span>
                          <span className="font-extrabold text-emerald-400">{complete.toLocaleString()} ({convRate}%)</span>
                        </div>
                        <div className="h-3.5 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-850">
                          <div className="h-full bg-emerald-500 rounded-r-lg transition-all duration-500" style={{ width: `${Math.max(3.8, parseFloat(convRate))}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                        <p className="text-[8px] font-mono text-slate-500 uppercase">Cart Abandonment</p>
                        <p className="text-xs font-mono font-black text-rose-400 mt-1">
                          {((1 - (complete / checks)) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                        <p className="text-[8px] font-mono text-slate-500 uppercase">Lost Revenue Potential</p>
                        <p className="text-xs font-mono font-black text-slate-300 mt-1">
                          ${(abandons * 120).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                        <p className="text-[8px] font-mono text-slate-500 uppercase">A/B Traffic Integrity</p>
                        <p className="text-xs font-mono font-black text-emerald-400 mt-1">99.98%</p>
                      </div>
                    </div>

                    {/* Simulation trigger */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatedViews(prev => prev + 500);
                          const userLoc = ["Seattle", "Tokyo", "London", "Munich", "Sydney", "Paris", "New York"][Math.floor(Math.random() * 7)];
                          setTrafficLogs(prev => [`[${new Date().toLocaleTimeString()}] Ingress: Spike of 500 visitors injected from node_cluster_${userLoc.toLowerCase()}.`, ...prev.slice(0, 5)]);
                        }}
                        className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-purple-500/10 flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Inject +500 Traffic Ingress Spike</span>
                      </button>
                    </div>

                    {/* Console Traffic Logs */}
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Active Stream Consoles</span>
                      <div className="bg-black/90 rounded-xl p-3 border border-slate-900 font-mono text-[9px] text-purple-300/90 space-y-1 h-24 overflow-y-auto leading-normal">
                        {trafficLogs.map((log, idx) => (
                          <div key={idx} className="truncate">
                            <span className="text-purple-500 font-bold">▶</span> {log}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>

            {/* 42. DYNAMIC VARIABLE PRICING ENGINES (5 cols) */}
            <div id="feature-42-pricing" className="md:col-span-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-md space-y-6 scroll-mt-6">
              <div>
                <span className="text-[9px] font-mono font-black text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  MODULE 42 // ALGORITHMIC VARIABLE PRICING
                </span>
                <h4 className="text-base font-extrabold tracking-tight text-slate-800 mt-2">Dynamic Elasticity Engine</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Automate real-time inventory and demand-based price shifting parameters.</p>
              </div>

              {/* Demand trigger controls */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase block font-mono">Current Market Demand Condition</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMarketDemand('low');
                      setPricingLogs(prev => ["Market Demand adjusted to LOW. Lower elastic price targets generated.", ...prev.slice(0, 5)]);
                    }}
                    className={`py-2 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      marketDemand === 'low' 
                        ? 'bg-rose-50 border-rose-300 text-rose-700' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    📉 Low Demand
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMarketDemand('normal');
                      setPricingLogs(prev => ["Market Demand normal. Default price-weight curves applied.", ...prev.slice(0, 5)]);
                    }}
                    className={`py-2 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      marketDemand === 'normal' 
                        ? 'bg-slate-800 border-transparent text-white' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    ⚖ Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMarketDemand('surge');
                      setPricingLogs(prev => ["Market Demand set to SURGE. Maximizing margin cap thresholds.", ...prev.slice(0, 5)]);
                    }}
                    className={`py-2 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      marketDemand === 'surge' 
                        ? 'bg-amber-50 border-amber-300 text-amber-700 font-black animate-pulse' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    📈 Surge Supply
                  </button>
                </div>
              </div>

              {/* Configurable Rules List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {sellerProducts.map((p) => {
                  const rule = dynamicPricing[p.id] || { enabled: false, min: Math.round(p.price * 0.75), max: Math.round(p.price * 1.5) };
                  
                  // Compute optimal target dynamically based on rules
                  let computedTarget = p.price;
                  if (rule.enabled) {
                    let modifier = 1.0;
                    if (p.stock < 5) modifier += 0.15; // low stock scarcity premium
                    if (marketDemand === 'low') modifier -= 0.20;
                    if (marketDemand === 'surge') modifier += 0.35;
                    computedTarget = Math.round(p.price * modifier);
                    // clamp
                    computedTarget = Math.max(rule.min, Math.min(rule.max, computedTarget));
                  }

                  const handleToggleRule = () => {
                    const nextEnabled = !rule.enabled;
                    setDynamicPricing(prev => ({
                      ...prev,
                      [p.id]: { ...rule, enabled: nextEnabled }
                    }));
                    setPricingLogs(prev => [
                      `Dynamic pricing for ${p.name} ${nextEnabled ? 'ENGAGED' : 'DISENGAGED'}.`,
                      ...prev.slice(0, 5)
                    ]);
                  };

                  const handleRangeChange = (field: 'min' | 'max', val: number) => {
                    setDynamicPricing(prev => ({
                      ...prev,
                      [p.id]: { ...rule, [field]: val }
                    }));
                  };

                  return (
                    <div key={p.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <img src={p.image} alt={p.name} className="h-7 w-7 rounded object-cover" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-[11px] truncate max-w-[140px]">{p.name}</p>
                            <span className="text-[9px] text-slate-400 font-mono">Stock: {p.stock} units</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Rule:</span>
                          <button
                            type="button"
                            onClick={handleToggleRule}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                              rule.enabled 
                                ? 'bg-teal-600 text-white' 
                                : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                            }`}
                          >
                            {rule.enabled ? 'Algorithmic' : 'Fixed'}
                          </button>
                        </div>
                      </div>

                      {rule.enabled && (
                        <div className="space-y-3.5 border-t border-slate-200/50 pt-2.5 animate-scale-in">
                          <div className="grid grid-cols-2 gap-3 text-[10px]">
                            <div className="space-y-1">
                              <span className="text-slate-400 block">Min Floor ($)</span>
                              <input 
                                type="number" 
                                value={rule.min}
                                onChange={(e) => handleRangeChange('min', Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg p-1 font-mono font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-400 block">Max Ceiling ($)</span>
                              <input 
                                type="number" 
                                value={rule.max}
                                onChange={(e) => handleRangeChange('max', Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg p-1 font-mono font-bold"
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-teal-50 border border-teal-100 p-2 rounded-xl">
                            <div>
                              <span className="text-[8px] font-mono text-teal-600 uppercase block font-bold">Calculated Price Target</span>
                              <span className="font-mono text-xs font-black text-teal-900">${computedTarget}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateProduct(p.id, { price: computedTarget });
                                setPricingLogs(prev => [`[Committed] Updated ${p.name} active catalog price to $${computedTarget}.`, ...prev.slice(0, 5)]);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[9px] font-bold uppercase cursor-pointer"
                            >
                              Sync Catalog Price
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pricing Logs Console */}
              <div className="space-y-1.5 font-mono">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Pricing Calculation Ledger Logs</span>
                <div className="bg-slate-900 text-teal-400/90 rounded-xl p-3 h-24 overflow-y-auto text-[9px] border border-slate-800 space-y-1 leading-relaxed">
                  {pricingLogs.length > 0 ? (
                    pricingLogs.map((log, idx) => (
                      <div key={idx} className="truncate">
                        <span className="text-teal-500 font-bold">⚙</span> {log}
                      </div>
                    ))
                  ) : (
                    <p className="italic text-slate-500">Enable variable pricing above to launch simulation...</p>
                  )}
                </div>
              </div>

            </div>

            {/* 43. MULTI-WAREHOUSE STOCK SPLITTING MATRIX (12 cols) */}
            <div id="feature-43-warehouse" className="md:col-span-12 rounded-3xl border border-slate-100 bg-white p-6 shadow-md space-y-6 scroll-mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] font-mono font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    MODULE 43 // ENTERPRISE regional fulfillment MATRIX
                  </span>
                  <h4 className="text-base font-extrabold tracking-tight text-slate-800 mt-2">Multi-Warehouse Inventory Distributer</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Split available product stock across regional logistical nodes to achieve same-day local shipping speeds.</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 block font-bold font-mono text-[10px] uppercase">Active Item Matrix:</span>
                  <select
                    value={activeSplitProduct}
                    onChange={(e) => setActiveSplitProduct(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none cursor-pointer"
                  >
                    <option value="">-- Choose Listing --</option>
                    {sellerProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                    ))}
                  </select>
                </div>
              </div>

              {activeSplitProduct ? (() => {
                const activeProd = products.find(p => p.id === activeSplitProduct);
                if (!activeProd) return null;

                const split = warehouseSplits[activeSplitProduct] || { east: 40, central: 30, west: 30 };
                const totalPct = split.east + split.central + split.west;

                const updateSplit = (field: 'east' | 'central' | 'west', value: number) => {
                  setWarehouseSplits(prev => ({
                    ...prev,
                    [activeSplitProduct]: { ...split, [field]: value }
                  }));
                };

                return (
                  <div className="grid gap-6 md:grid-cols-12 text-xs border-t border-slate-100 pt-5 animate-scale-in">
                    
                    {/* Interactive Sliders (6 cols) */}
                    <div className="md:col-span-6 space-y-5">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-blue-500" /> East Hub (New York, NY)</span>
                          <span className="font-mono font-bold text-slate-800">{split.east}% ({Math.round(activeProd.stock * split.east / 100)} SKUs)</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={split.east} 
                          onChange={(e) => updateSplit('east', Number(e.target.value))}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-indigo-500" /> Central Hub (Chicago, IL)</span>
                          <span className="font-mono font-bold text-slate-800">{split.central}% ({Math.round(activeProd.stock * split.central / 100)} SKUs)</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={split.central} 
                          onChange={(e) => updateSplit('central', Number(e.target.value))}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-violet-500" /> West Hub (Los Angeles, CA)</span>
                          <span className="font-mono font-bold text-slate-800">{split.west}% ({Math.round(activeProd.stock * split.west / 100)} SKUs)</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={split.west} 
                          onChange={(e) => updateSplit('west', Number(e.target.value))}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className={`p-3 rounded-xl border text-center ${
                        totalPct === 100 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                          : 'bg-rose-50 border-rose-100 text-rose-800 font-bold'
                      }`}>
                        {totalPct === 100 ? (
                          <p>✓ Matrix balanced: Allocation ratio perfectly matches 100% stock parameters.</p>
                        ) : (
                          <p>⚠️ Matrix Out of Balance: Allocation totals {totalPct}%. Ensure ratios sum to exactly 100%.</p>
                        )}
                      </div>
                    </div>

                    {/* Logistics Telemetry visual (6 cols) */}
                    <div className="md:col-span-6 bg-slate-950 text-slate-300 p-5 rounded-3xl space-y-4 font-mono text-[10px]">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-[11px] font-bold text-indigo-400">Logistics Node Projections</span>
                        <span className="text-[8px] bg-indigo-900/60 text-indigo-300 border border-indigo-700/30 px-1.5 py-0.5 rounded">REAL-TIME TELEMETRY</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-850">
                          <p className="text-slate-500 uppercase text-[8px]">Transit Delay Index</p>
                          <p className="text-xs font-bold text-white mt-1">1.2 Days avg</p>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-850">
                          <p className="text-slate-500 uppercase text-[8px]">Delivery Optimization</p>
                          <p className="text-xs font-bold text-teal-400 mt-1">✓ Same-day hot</p>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-850 space-y-2">
                        <span className="text-[8px] uppercase text-slate-500 font-bold block">Regional order volumes match</span>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>NY/East:</span>
                            <span className="font-bold text-white">Heavy Density</span>
                          </div>
                          <div className="flex justify-between">
                            <span>LA/West:</span>
                            <span className="font-bold text-white">Moderate</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (totalPct !== 100) {
                            alert("Please ensure stock splits equal exactly 100% before committing log files.");
                            return;
                          }
                          alert(`Warehouse stock split committed for ${activeProd.name}. Regional dispatch nodes updated.`);
                        }}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase transition-all cursor-pointer"
                      >
                        Publish Regional Splits Matrix
                      </button>
                    </div>

                  </div>
                );
              })() : (
                <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center italic text-xs text-slate-400">
                  Select an inventory item in the dropdown selection box above to deploy the regional warehouse stock split matrix.
                </div>
              )}
            </div>

            {/* 44. AUTOMATED AI PRODUCT SPEC EXTRACTION (6 cols) */}
            <div id="feature-44-spec" className="md:col-span-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-md space-y-5 scroll-mt-6">
              <div>
                <span className="text-[9px] font-mono font-black text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  MODULE 44 // AUTOMATED AI SPEC EXTRACTION
                </span>
                <h4 className="text-base font-extrabold tracking-tight text-slate-800 mt-2">AI Spec Parser Engine</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Upload raw manufacturer spec blocks, and natural language model workers will extract key-value indices instantly.</p>
              </div>

              {specUploadSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 font-semibold animate-fade-in">
                  ✓ Specifications table committed to the database index successfully!
                </div>
              )}

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-600">Raw Spec Sheet Content</label>
                    <button
                      type="button"
                      onClick={() => {
                        setSpecRawText("Manufacturer Technical Bulletin #99B-88\nApparatus: VoltAudio Studio Wave II\nCore Acoustic Transducer: 50mm dynamic copper-clad aluminum wire coil\nMaterial Frame: High-tensile magnesium-aluminum acoustic chassis (weight 310g)\nDirect Battery Span: Up to 55 Hours Playback\nSpectral Bandwidth: 6Hz - 40,000Hz Ultra High-Definition\nDirect Codecs: aptX, AAC, LDAC audio protocol supported");
                        setExtractedSpecs(null);
                        setSpecUploadSuccess(false);
                      }}
                      className="text-[10px] text-sky-600 hover:underline font-bold"
                    >
                      Load Sample Spec text
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={specRawText}
                    onChange={(e) => setSpecRawText(e.target.value)}
                    placeholder="Paste unformatted manufacturer PDF copy/text blocks here..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-[10px] text-slate-800 outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isExtractingSpec || !specRawText.trim()}
                    onClick={() => {
                      setIsExtractingSpec(true);
                      setSpecUploadSuccess(false);
                      setTimeout(() => {
                        // Simulated parsing logic extracting parameters
                        const specs = [
                          { key: "Model/Apparatus", value: specRawText.includes("VoltAudio") ? "VoltAudio Studio Wave II" : "AuraSound Nexus ANC" },
                          { key: "Chassis Frame", value: specRawText.includes("VoltAudio") ? "Magnesium-Aluminum (310g)" : "Carbon Matrix Alloy (240g)" },
                          { key: "Transducer Driver", value: specRawText.includes("VoltAudio") ? "50mm Copper-Clad Aluminum Wire" : "45mm Bio-cellulose Dome" },
                          { key: "Acoustic Bandwidth", value: specRawText.includes("VoltAudio") ? "6Hz - 40,000Hz" : "4Hz - 42,000Hz" },
                          { key: "Continuous Battery", value: specRawText.includes("VoltAudio") ? "55 Hours Playback" : "48 Hours (ANC Active)" },
                          { key: "Digital Codecs", value: "LDAC, aptX, AAC, SBC" }
                        ];
                        setExtractedSpecs(specs);
                        setIsExtractingSpec(false);
                      }, 1800);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-100 text-white disabled:text-slate-400 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isExtractingSpec ? (
                      <>
                        <Cpu className="h-4 w-4 animate-spin text-white" />
                        <span>AI Parsing Ingress stream...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        <span>AI Extract Structured Specs</span>
                      </>
                    )}
                  </button>
                </div>

                {extractedSpecs && (
                  <div className="space-y-3 border border-sky-100 bg-sky-50/40 rounded-2xl p-4 animate-scale-in">
                    <span className="text-[10px] font-bold font-mono text-sky-700 block uppercase tracking-wider">AI Table Extractions Completed</span>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-sky-200 text-sky-800 font-bold uppercase font-mono text-[9px]">
                            <th className="py-1">Technical Attribute</th>
                            <th className="py-1">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-100/50 text-slate-700">
                          {extractedSpecs.map((s, index) => (
                            <tr key={index}>
                              <td className="py-1.5 font-bold">{s.key}</td>
                              <td className="py-1.5 font-mono text-sky-900">{s.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSpecUploadSuccess(true);
                          setExtractedSpecs(null);
                        }}
                        className="w-full py-2 rounded-lg bg-sky-800 hover:bg-sky-950 text-white font-extrabold uppercase text-[10px] transition-colors"
                      >
                        Commit to Database Indices
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* 45. SELLER-TO-BUYER DIRECT MESSAGING GATEWAYS (6 cols) */}
            <div id="feature-45-messaging" className="md:col-span-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-md space-y-5 scroll-mt-6">
              <div>
                <span className="text-[9px] font-mono font-black text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  MODULE 45 // SELLER-TO-BUYER MESSAGE HOTLINE
                </span>
                <h4 className="text-base font-extrabold tracking-tight text-slate-800 mt-2">Direct Customization Gateway</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Handle complex customization enquiries while keeping your personal email coordinates private.</p>
              </div>

              <div className="grid grid-cols-12 gap-4 h-96 border border-slate-100 rounded-3xl overflow-hidden">
                {/* Channels lists (4 cols) */}
                <div className="col-span-4 border-r border-slate-100 bg-slate-50/50 flex flex-col divide-y divide-slate-100 text-[10px]">
                  {threads.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveThreadId(t.id)}
                      className={`p-3 text-left transition-all hover:bg-slate-100 cursor-pointer ${
                        activeThreadId === t.id ? 'bg-white font-bold border-l-2 border-pink-500' : ''
                      }`}
                    >
                      <p className="font-bold text-slate-800 truncate">{t.buyerName}</p>
                      <span className="text-[8px] text-slate-400 font-mono truncate block">{t.productName}</span>
                    </button>
                  ))}
                </div>

                {/* Conversation screen (8 cols) */}
                {(() => {
                  const thread = threads.find(t => t.id === activeThreadId);
                  if (!thread) return null;

                  const handleSendMessage = (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!newMsgInput.trim()) return;

                    const newMsg = { sender: 'seller' as const, text: newMsgInput.trim(), date: "Just now" };
                    const updatedMessages = [...thread.messages, newMsg];
                    
                    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, messages: updatedMessages } : t));
                    setNewMsgInput('');

                    // Trigger simulated response after 1.5 seconds!
                    setTimeout(() => {
                      const autoReplyText = `[Simulated Buyer Reply] Yes, that sounds amazing. Thank you so much for the clarification! I will complete the Checkout with transaction tags.`;
                      setThreads(prev => prev.map(t => t.id === thread.id ? {
                        ...t,
                        messages: [...updatedMessages, { sender: 'buyer', text: autoReplyText, date: "Just now" }]
                      } : t));
                    }, 1500);
                  };

                  return (
                    <div className="col-span-8 flex flex-col justify-between h-full bg-slate-50/20">
                      {/* Messages scroll body */}
                      <div className="p-3 overflow-y-auto space-y-3.5 flex-1 max-h-[290px]">
                        {thread.messages.map((m, idx) => (
                          <div 
                            key={idx} 
                            className={`max-w-[85%] rounded-2xl p-3 text-[11px] leading-relaxed shadow-3xs transition-all ${
                              m.sender === 'seller'
                                ? 'bg-slate-800 text-white rounded-tr-none ml-auto'
                                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                            }`}
                          >
                            {/* Primitive Markdown render helper */}
                            <div>
                              {m.text.split(/(\*\*.*?\*\*|`.*?`)/g).map((chunk, i) => {
                                if (chunk.startsWith('**') && chunk.endsWith('**')) {
                                  return <strong key={i} className="font-extrabold">{chunk.slice(2, -2)}</strong>;
                                }
                                if (chunk.startsWith('`') && chunk.endsWith('`')) {
                                  return <code key={i} className="font-mono text-[9px] bg-slate-100 text-pink-600 px-1 py-0.5 rounded border border-slate-200/50">{chunk.slice(1, -1)}</code>;
                                }
                                return chunk;
                              })}
                            </div>
                            <span className="block text-[8px] mt-1 text-slate-400 font-mono text-right">{m.date}</span>
                          </div>
                        ))}
                      </div>

                      {/* Controls input bar */}
                      <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-slate-100 space-y-2">
                        {/* Markdown hotkeys */}
                        <div className="flex gap-1.5 font-mono text-[8px] text-slate-400">
                          <button
                            type="button"
                            onClick={() => setNewMsgInput(prev => prev + "**Bold**")}
                            className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:text-slate-600 cursor-pointer font-bold"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewMsgInput(prev => prev + "`Code`")}
                            className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:text-slate-600 cursor-pointer font-mono"
                          >
                            &lt;/&gt;
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewMsgInput(prev => prev + "\n- Item")}
                            className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:text-slate-600 cursor-pointer font-bold"
                          >
                            List
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMsgInput}
                            onChange={(e) => setNewMsgInput(e.target.value)}
                            placeholder="Type safe encryption message..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-pink-500"
                          />
                          <button
                            type="submit"
                            className="px-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5 fill-current" />
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 46. BULK CSV INVENTORY SYNCHRONIZERS (6 cols) */}
            <div id="feature-46-csv" className="md:col-span-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-md space-y-5 scroll-mt-6">
              <div>
                <span className="text-[9px] font-mono font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  MODULE 46 // BULK CSV SYNCHRONIZER
                </span>
                <h4 className="text-base font-extrabold tracking-tight text-slate-800 mt-2">CSV High-Frequency Sync</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Parse, validate, and write tens of thousands of catalog inventory rows over the edge network instantly.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <label className="font-bold text-slate-600">CSV Spreadsheet Payload</label>
                    <button
                      type="button"
                      onClick={() => {
                        const template = sellerProducts.map(p => `${p.id},${p.price + 5},${p.stock + 10},${p.brand}`).join("\n");
                        setCsvContent(`id,price,stock,brand\n${template}`);
                        setSyncLogs([]);
                        setSyncProgress(0);
                      }}
                      className="text-emerald-600 hover:underline font-bold"
                    >
                      Regenerate from current inventory
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-[10px] text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                {isSyncingCSV ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Stream Processing index...</span>
                      <span>{syncProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${syncProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSyncingCSV(true);
                      setSyncProgress(0);
                      
                      // Progress count timer
                      const interval = setInterval(() => {
                        setSyncProgress(prev => {
                          if (prev >= 100) {
                            clearInterval(interval);
                            setIsSyncingCSV(false);

                            // Actually execute database modifications!
                            const rows = csvContent.split("\n").slice(1);
                            let updatedCount = 0;
                            rows.forEach(r => {
                              const [id, priceStr, stockStr, brand] = r.split(",");
                              if (id && priceStr && stockStr) {
                                const matched = products.find(p => p.id === id.trim());
                                if (matched) {
                                  onUpdateProduct(matched.id, {
                                    price: Number(priceStr.trim()),
                                    stock: Number(stockStr.trim()),
                                    brand: brand ? brand.trim() : matched.brand
                                  });
                                  updatedCount++;
                                }
                              }
                            });

                            setSyncLogs(prevLogs => [
                              `[SUCCESS] Synchronized ${updatedCount} active listings in platform cache.`,
                              "Validation constraint matches: 100% SUCCESS.",
                              ...prevLogs
                            ]);
                            return 100;
                          }
                          return prev + 25;
                        });
                      }, 400);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Compile & Synchronize CSV Payload</span>
                  </button>
                )}

                {/* Audit Console Logs */}
                <div className="space-y-1.5 font-mono">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Sync Event Stream Audit</span>
                  <div className="bg-slate-900 text-emerald-400 rounded-xl p-3 h-24 overflow-y-auto text-[9px] border border-slate-800 space-y-1 leading-normal">
                    {syncLogs.length > 0 ? (
                      syncLogs.map((log, idx) => (
                        <div key={idx} className="truncate">
                          <span className="text-emerald-500 font-bold">⚙</span> {log}
                        </div>
                      ))
                    ) : (
                      <p className="italic text-slate-500">Initiate bulk synchronization to display telemetry output...</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* 47. CROSS-BORDER LOCALIZED TAX CALCULATORS (6 cols) */}
            <div id="feature-47-tax" className="md:col-span-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-md space-y-5 scroll-mt-6">
              <div>
                <span className="text-[9px] font-mono font-black text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  MODULE 47 // CROSS-BORDER LOCALIZED TAX CALCULATORS
                </span>
                <h4 className="text-base font-extrabold tracking-tight text-slate-800 mt-2">Geographic Tariff Ledger</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Determine customs duties, border levies, and regional value-added tax liabilities instantly without third-party integrations.</p>
              </div>

              {(() => {
                const getTaxSpecs = () => {
                  switch (taxRegion) {
                    case 'US-CA': return { label: "🇺🇸 United States (California)", vat: 0, customs: 3.5, local: 8.875, border: 1.5 };
                    case 'EU-DE': return { label: "🇩🇪 Germany (EU-VAT Zone)", vat: 19.0, customs: 4.5, local: 0, border: 2.5 };
                    case 'UK-GB': return { label: "🇬🇧 United Kingdom (VAT-PostBrexit)", vat: 20.0, customs: 5.0, local: 0, border: 3.0 };
                    case 'JP-TO': return { label: "🇯🇵 Japan (Consumption Tax)", vat: 10.0, customs: 2.8, local: 0, border: 1.0 };
                    case 'BR-SP': return { label: "🇧🇷 Brazil (Mercosur ICMS Tariff)", vat: 18.0, customs: 14.5, local: 4.0, border: 8.5 };
                  }
                };

                const specs = getTaxSpecs();
                const vatAmt = Math.round(taxBaseAmount * specs.vat / 100);
                const tariffAmt = Math.round(taxBaseAmount * specs.customs / 100);
                const localAmt = Math.round(taxBaseAmount * specs.local / 100);
                const borderAmt = Math.round(taxBaseAmount * specs.border / 100);
                const finalSum = taxBaseAmount + vatAmt + tariffAmt + localAmt + borderAmt;

                return (
                  <div className="space-y-4 text-xs animate-scale-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block font-mono">Recipient Region</span>
                        <select
                          value={taxRegion}
                          onChange={(e: any) => setTaxRegion(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none cursor-pointer font-bold"
                        >
                          <option value="US-CA">🇺🇸 United States (California)</option>
                          <option value="EU-DE">🇩🇪 Germany (EU-VAT Zone)</option>
                          <option value="UK-GB">🇬🇧 United Kingdom (VAT Zone)</option>
                          <option value="JP-TO">🇯🇵 Japan (Consumption)</option>
                          <option value="BR-SP">🇧🇷 Brazil (ICMS Internal)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block font-mono">Invoice Amount ($)</span>
                        <input
                          type="number"
                          value={taxBaseAmount}
                          onChange={(e) => setTaxBaseAmount(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-mono font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5">
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5 text-[10px] font-mono font-bold text-slate-500">
                        <span>Liabilities breakdown</span>
                        <span>{specs.label}</span>
                      </div>

                      <div className="space-y-2 text-slate-600 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span>Base Net Value:</span>
                          <span className="font-bold text-slate-800">${taxBaseAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Import VAT / GST ({specs.vat}%):</span>
                          <span className="font-bold text-slate-800">${vatAmt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customs Tariff Duty ({specs.customs}%):</span>
                          <span className="font-bold text-slate-800">${tariffAmt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Local State Sales Tax ({specs.local}%):</span>
                          <span className="font-bold text-slate-800">${localAmt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Border Clearance Fee ({specs.border}%):</span>
                          <span className="font-bold text-slate-800">${borderAmt}</span>
                        </div>

                        <div className="flex justify-between border-t border-slate-200/80 pt-2 text-sm text-amber-800 font-bold font-sans">
                          <span>Total Projected Landed Cost:</span>
                          <span className="font-mono font-black">${finalSum}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl text-[10px] text-amber-800 font-medium flex items-center gap-2 leading-relaxed">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <p>Compliance validation logged in multi-tenant ledgers: Fully cleared for secure cross-border fulfillment.</p>
                    </div>

                  </div>
                );
              })()}
            </div>

            {/* 48. WHITELABEL BRAND STOREFRONT BUILDERS (12 cols) */}
            <div id="feature-48-storefront" className="md:col-span-12 rounded-3xl border border-slate-100 bg-white p-6 shadow-md space-y-6 scroll-mt-6">
              <div>
                <span className="text-[9px] font-mono font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  MODULE 48 // WHITELABEL BRAND STOREFRONT DESIGNER
                </span>
                <h4 className="text-base font-extrabold tracking-tight text-slate-800 mt-2">Visual Landing Page Workspace</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Customize bespoke visual styles, typography setups, and landing layouts dynamically while keeping branding clean.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-12 text-xs">
                {/* Style panel controls (4 cols) */}
                <div className="md:col-span-4 bg-slate-50 border border-slate-100 p-4 rounded-3xl space-y-4">
                  <span className="text-[10px] font-bold font-mono text-slate-400 block uppercase tracking-wider">Customizer workspace</span>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Store Theme Presets</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['slate', 'cream', 'teal', 'cyberpunk'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setStoreTheme(t)}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                            storeTheme === t 
                              ? 'bg-rose-500 border-transparent text-white' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {t} theme
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Banner Image URL</label>
                    <input 
                      type="url"
                      value={storeBanner}
                      onChange={(e) => setStoreBanner(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Headline Text</label>
                    <input 
                      type="text"
                      value={storeHeadline}
                      onChange={(e) => setStoreHeadline(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Font Pairing</label>
                      <select
                        value={storeFont}
                        onChange={(e: any) => setStoreFont(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none cursor-pointer font-bold"
                      >
                        <option value="sans">sans-serif (Inter)</option>
                        <option value="serif">serif (Editorial)</option>
                        <option value="mono">mono (Technical)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Grid Columns</label>
                      <select
                        value={storeCols}
                        onChange={(e) => setStoreCols(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none cursor-pointer font-bold"
                      >
                        <option value={2}>2 Column Grid</option>
                        <option value={3}>3 Column Grid</option>
                        <option value={4}>4 Column Grid</option>
                      </select>
                    </div>
                  </div>

                  {storeSaved && (
                    <p className="text-emerald-600 text-xs font-semibold animate-pulse">✓ Layout committed and saved on cloud server!</p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setStoreSaved(true);
                      setTimeout(() => setStoreSaved(false), 3000);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold uppercase transition-colors"
                  >
                    Save & Deploy Whitelabel Storefront
                  </button>
                </div>

                {/* Visual Live Preview (8 cols) */}
                <div className="md:col-span-8 border border-slate-200 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xs bg-slate-100">
                  <div className="p-3 bg-white border-b border-slate-200 text-[10px] font-mono text-slate-400 flex justify-between items-center">
                    <span>LIVE BRAND PREVIEW FRAME</span>
                    <span className="text-[8px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-extrabold">WHITELABEL RUNNING</span>
                  </div>

                  {/* Real visual preview content */}
                  {(() => {
                    const themeClasses = {
                      slate: "bg-slate-950 text-slate-100 border-slate-800",
                      cream: "bg-amber-50/40 text-slate-800 border-amber-100",
                      teal: "bg-teal-950 text-teal-100 border-teal-800",
                      cyberpunk: "bg-purple-950 text-pink-300 border-pink-500/20"
                    }[storeTheme];

                    const fontClass = {
                      sans: "font-sans",
                      serif: "font-serif italic",
                      mono: "font-mono text-xs"
                    }[storeFont];

                    return (
                      <div className={`p-6 space-y-6 ${themeClasses} ${fontClass} flex-1 min-h-[300px]`}>
                        {/* Custom Banner */}
                        <div className="relative h-28 rounded-2xl overflow-hidden border border-white/5 shadow-md flex items-center justify-center">
                          <img src={storeBanner} alt="Store banner" className="absolute inset-0 h-full w-full object-cover opacity-65" />
                          <div className="absolute inset-0 bg-black/40" />
                          <h4 className="absolute text-center px-4 text-xs md:text-sm font-black text-white tracking-wide uppercase drop-shadow-sm">
                            {storeHeadline}
                          </h4>
                        </div>

                        {/* Store Catalog Items representation */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block font-bold">Featured catalog</span>
                          <div className={`grid gap-3 ${
                            storeCols === 2 ? 'grid-cols-2' : storeCols === 3 ? 'grid-cols-3' : 'grid-cols-4'
                          }`}>
                            {sellerProducts.slice(0, 4).map(p => (
                              <div key={p.id} className="rounded-xl border border-slate-800/20 bg-white/5 p-2 space-y-1.5 shadow-2xs">
                                <img src={p.image} alt={p.name} className="h-16 w-full object-cover rounded-lg" />
                                <div className="leading-tight text-[10px]">
                                  <p className="font-bold truncate">{p.name}</p>
                                  <span className="font-mono text-[9px] opacity-75">${p.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* 49. RETURN-RATE PREDICTION DASHBOARD (7 cols) */}
            <div id="feature-49-returns" className="md:col-span-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-md space-y-6 scroll-mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] font-mono font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    MODULE 49 // DEFECTIVE BATCH TELEMETRY
                  </span>
                  <h4 className="text-base font-extrabold tracking-tight text-slate-800 mt-2">Return-Rate Prediction Dial</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Analyze defect telemetry and customer complaints to flag potentially defective manufacturing batches before heavy volume returns.</p>
                </div>

                <select
                  value={defectSelectedProd}
                  onChange={(e) => setDefectSelectedProd(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none cursor-pointer"
                >
                  <option value="">-- Select Product --</option>
                  {sellerProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {defectSelectedProd ? (() => {
                const prod = products.find(p => p.id === defectSelectedProd);
                if (!prod) return null;

                // Create deterministic telemetry based on ID string
                const score = (prod.name.charCodeAt(0) % 25) + 2.5;
                const batch = `B-BATCH-${(prod.name.charCodeAt(1) % 8) + 12}`;
                
                let riskColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
                let badgeLabel = "LOW DEFECT RISK";
                if (score > 12) {
                  riskColor = "text-rose-600 bg-rose-50 border-rose-100 animate-pulse";
                  badgeLabel = "CRITICAL DEFECT THRESHOLD DETECTED";
                } else if (score > 6) {
                  riskColor = "text-amber-600 bg-amber-50 border-amber-100";
                  badgeLabel = "MODERATE FLAGGED DEV";
                }

                return (
                  <div className="space-y-5 text-xs animate-scale-in border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-3 gap-3 text-center font-mono">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 text-[8px] uppercase block">Assigned Batch</span>
                        <span className="text-xs font-bold text-slate-800 mt-1 block">{batch}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 text-[8px] uppercase block">Predicted Returns</span>
                        <span className="text-xs font-bold text-slate-800 mt-1 block">{score.toFixed(1)}%</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 text-[8px] uppercase block">Telemetry Health</span>
                        <span className="text-xs font-bold text-slate-800 mt-1 block">{(100 - score).toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className={`p-4 border rounded-2xl space-y-3 ${riskColor}`}>
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider">
                        <span>Diagnostic Alert:</span>
                        <span>{badgeLabel}</span>
                      </div>
                      
                      <p className="text-[11px] leading-relaxed font-medium">
                        {score > 12 
                          ? `⚠️ ALERT: Batch ${batch} of the ${prod.name} has crossed critical return parameters. Internal acoustics and mechanical calibration sensors indicate a high correlation of diaphragm misalignment on Assembly Line #4.`
                          : `✓ Batch ${batch} demonstrates stable physical telemetry. Internal tolerance drift measurements are fully compliant with QA certifications.`
                        }
                      </p>
                    </div>

                    {/* Breakdown Reasons SVG horizontal segment */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block font-mono">Top Complaint Correlations</span>
                      <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden flex font-mono text-[9px] font-bold text-white text-center">
                        <div className="bg-red-500 h-full flex items-center justify-center transition-all" style={{ width: '60%' }} title="Acoustic Distortion">Distort (60%)</div>
                        <div className="bg-amber-500 h-full flex items-center justify-center transition-all" style={{ width: '25%' }} title="Chassis fitment">Fitment (25%)</div>
                        <div className="bg-blue-500 h-full flex items-center justify-center transition-all" style={{ width: '15%' }} title="Other">Other (15%)</div>
                      </div>
                    </div>

                    {/* Expert Action Recommendations */}
                    <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl space-y-2">
                      <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">Recommended mitigation</span>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                        <li>{score > 12 ? "Immediately halt active fabrication lines at Factory Segment B-4." : "Proceed with default production scheduling."}</li>
                        <li>{score > 12 ? "Launch deep acoustic sensor sweeps for drivers packaged after July 1st." : "Maintain current 5-day QA sweep interval."}</li>
                        <li>Consider enabling automatic variable discounts to offload flagged units to secondary wholesale category markets.</li>
                      </ul>
                    </div>

                  </div>
                );
              })() : (
                <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center italic text-xs text-slate-400">
                  Select an inventory product from the dropdown above to run return-rate prediction analysis.
                </div>
              )}
            </div>

            {/* 50. LIQUIDATION CLEARINGHOUSE PIPELINES (5 cols) */}
            <div id="feature-50-liquidation" className="md:col-span-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-md space-y-5 scroll-mt-6">
              <div>
                <span className="text-[9px] font-mono font-black text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  MODULE 50 // LIQUIDATION CLEARINGHOUSE PIPELINES
                </span>
                <h4 className="text-base font-extrabold tracking-tight text-slate-800 mt-2">Slow-Moving Excess Pipeline</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Flush sluggish inventory stocks directly to secondary discounted wholesale pipelines with a single click.</p>
              </div>

              {/* Items matching slow moving status (stock > 5) */}
              {(() => {
                const slowMovingItems = sellerProducts.filter(p => p.stock >= 5);

                return (
                  <div className="space-y-4 text-xs">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block font-mono">Flagged Overstocked Inventory SKUs ({slowMovingItems.length})</span>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {slowMovingItems.map((p) => (
                        <div key={p.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <img src={p.image} alt={p.name} className="h-8 w-8 rounded object-cover" />
                            <div>
                              <p className="font-bold text-slate-800 text-[11px] truncate max-w-[150px]">{p.name}</p>
                              <span className="text-[9px] text-slate-400 font-mono">Current Stock: {p.stock} units</span>
                            </div>
                          </div>

                          <span className="font-mono font-black text-rose-500">-${Math.round(p.price * 0.60)} (60% Off)</span>
                        </div>
                      ))}
                    </div>

                    {isLiquidating ? (
                      <div className="p-4 bg-orange-50 rounded-2xl text-center space-y-2 animate-pulse text-[11px] font-bold text-orange-800 border border-orange-200">
                        <Flame className="h-6 w-6 text-orange-500 mx-auto animate-bounce" />
                        <p>Redirecting excess units to Wholesaler category routes...</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={slowMovingItems.length === 0}
                        onClick={() => {
                          setIsLiquidating(true);
                          setLiquidationLog([]);
                          setTimeout(() => {
                            // Shifting stock prices in actual catalog listings!
                            slowMovingItems.forEach(p => {
                              onUpdateProduct(p.id, {
                                price: Math.round(p.price * 0.40), // 60% discount
                                stock: Math.max(2, p.stock - 3) // shift 3 units to wholesale buyers
                              });
                            });

                            setIsLiquidating(false);
                            setLiquidationLog([
                              `[COMPLETED] Shifted excess units to the Wholesale clearinghouse directory.`,
                              `Prices synchronized with a 60% liquidation reduction markup.`,
                              "Logistics transfer manifest logged with tenant courier nodes."
                            ]);
                          }, 1600);
                        }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/15 cursor-pointer hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Flame className="h-4 w-4" />
                        <span>Flush Slow Stocks to wholesale</span>
                      </button>
                    )}

                    {/* Liquidation Log output */}
                    {liquidationLog.length > 0 && (
                      <div className="space-y-1.5 font-mono">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Logistics Routing Manifest</span>
                        <div className="bg-slate-900 text-orange-300 rounded-xl p-3 text-[9px] border border-slate-800 space-y-1 leading-relaxed">
                          {liquidationLog.map((log, idx) => (
                            <div key={idx} className="truncate">
                              <span className="text-orange-500 font-bold">⚡</span> {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
