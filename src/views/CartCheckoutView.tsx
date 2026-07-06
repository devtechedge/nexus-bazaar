/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Trash2, 
  Tag, 
  CreditCard, 
  MapPin, 
  Truck, 
  Crown,
  Heart,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Leaf,
  Fingerprint,
  PenTool,
  Activity,
  Info,
  Sparkles
} from 'lucide-react';
import { Product, PromoCode, User, OrderItem, Order } from '../lib/db';

interface CartCheckoutViewProps {
  products: Product[];
  cart: { productId: string; quantity: number }[];
  wishlist: string[];
  onUpdateCartQty: (productId: string, qty: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onMoveToCart: (productId: string) => void;
  onRemoveFromWishlist: (productId: string) => void;
  currentUser: User;
  promoCodes: PromoCode[];
  onPlaceOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
  setActiveView: (view: any) => void;
}

export default function CartCheckoutView({
  products,
  cart,
  wishlist,
  onUpdateCartQty,
  onRemoveFromCart,
  onMoveToCart,
  onRemoveFromWishlist,
  currentUser,
  promoCodes,
  onPlaceOrder,
  setActiveView,
}: CartCheckoutViewProps) {
  const [activeStep, setActiveStep] = React.useState<'cart' | 'checkout'>('cart');
  
  // Checkout Shipping Form State
  const [fullName, setFullName] = React.useState(currentUser.name);
  const [street, setStreet] = React.useState('');
  const [city, setCity] = React.useState('');
  const [shippingState, setShippingState] = React.useState('CA'); // CA, NY, TX, etc.
  const [zip, setZip] = React.useState('');
  
  // Checkout Card Form State
  const [cardNumber, setCardNumber] = React.useState('');
  const [cardExpiry, setCardExpiry] = React.useState('');
  const [cardCvv, setCardCvv] = React.useState('');

  // Quantum Eco Routing Optimizer State (Feature #22)
  const [ecoRoute, setEcoRoute] = React.useState<'drone' | 'maglev' | 'hyperloop'>('maglev');

  // Biometric Signature Auth Pad State (Feature #23)
  const [isSigned, setIsSigned] = React.useState(false);
  const [signaturePoints, setSignaturePoints] = React.useState<{ x: number; y: number; pressure: number }[]>([]);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [biometricScore, setBiometricScore] = React.useState<number | null>(null);
  const [signError, setSignError] = React.useState<string | null>(null);
  const sigCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Shipping Method
  const [shippingMethod, setShippingMethod] = React.useState<'standard' | 'express'>('standard');

  // Promo code entry
  const [promoInput, setPromoInput] = React.useState('');
  const [appliedPromo, setAppliedPromo] = React.useState<PromoCode | null>(null);
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = React.useState<string | null>(null);

  // --- FEATURE #12: SHARED MULTI-USER SESSION CARTS STATES ---
  const [sharedSessionActive, setSharedSessionActive] = React.useState(true);
  const [splitBillingEnabled, setSplitBillingEnabled] = React.useState(false);
  const sessionPeers = [
    { name: 'Emma', color: 'bg-emerald-500', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60' },
    { name: 'Lucas', color: 'bg-amber-500', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60' }
  ];

  // --- FEATURE #14: ANONYMOUS GIFTING VAULT STATES ---
  const [anonymousGiftingEnabled, setAnonymousGiftingEnabled] = React.useState(false);
  const [giftRecipientEmail, setGiftRecipientEmail] = React.useState('');
  const [giftMessage, setGiftMessage] = React.useState('');
  const giftToken = React.useMemo(() => {
    return `GIFT_CIPHER_${Math.floor(1000 + Math.random() * 9000)}_X`;
  }, []);

  // --- FEATURE #17: MICRO-DONATION ROUND-UPS STATES ---
  const [roundUpDonation, setRoundUpDonation] = React.useState(false);
  const [donationCause, setDonationCause] = React.useState<'carbon_capture' | 'green_forest' | 'ewaste'>('carbon_capture');

  // Map cart identifiers to concrete product models
  const cartItems = React.useMemo(() => {
    return cart.map((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return {
        product: p,
        quantity: item.quantity,
        // Apply 10% elite discount on elite items if user is elite
        price: p && p.isElite && currentUser.isElite ? Math.round(p.price * 0.9) : p ? p.price : 0,
      };
    }).filter(item => item.product !== undefined) as { product: Product; quantity: number; price: number }[];
  }, [cart, products, currentUser.isElite]);

  // Multi-vendor split deliveries (Feature #16)
  const warehouseSplits = React.useMemo(() => {
    const warehouses = [
      { name: 'Seattle Flight Node A', eta: '1-2 Days', color: 'bg-teal-50 border-teal-100 text-teal-800' },
      { name: 'Austin Cargo Hub B', eta: '2-3 Days', color: 'bg-indigo-50 border-indigo-100 text-indigo-800' },
      { name: 'Secaucus Ground Depot C', eta: '3-4 Days', color: 'bg-purple-50 border-purple-100 text-purple-800' }
    ];

    const clusters: Record<string, typeof cartItems> = {};
    cartItems.forEach((item) => {
      const idx = Math.abs(item.product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % warehouses.length;
      const whName = warehouses[idx].name;
      if (!clusters[whName]) clusters[whName] = [];
      clusters[whName].push(item);
    });

    return Object.entries(clusters).map(([name, items]) => {
      const idx = warehouses.findIndex(w => w.name === name);
      return {
        name,
        items,
        eta: currentUser.isElite ? 'Elite Priority: Under 24h Drone Flight' : warehouses[idx]?.eta || '2-3 Days',
        color: warehouses[idx]?.color || 'bg-slate-50 border-slate-100 text-slate-700'
      };
    });
  }, [cartItems, currentUser.isElite]);

  // Map wishlist identifiers
  const wishlistProducts = React.useMemo(() => {
    return wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];
  }, [wishlist, products]);

  // Financial calculations
  const subtotal = React.useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = React.useMemo(() => {
    if (!appliedPromo) return 0;
    return Math.round((subtotal * appliedPromo.discountPercent) / 100);
  }, [appliedPromo, subtotal]);

  // Quantum Eco Routing Green Discount (5% on choosing lowest-impact 'drone' route)
  const greenDiscount = React.useMemo(() => {
    if (ecoRoute !== 'drone') return 0;
    return Math.round(subtotal * 0.05);
  }, [ecoRoute, subtotal]);

  // Shipping rules
  // - Elite users get standard and express shipping upgraded to $0!
  // - Standard is free on orders over $150
  const shippingCost = React.useMemo(() => {
    if (subtotal === 0) return 0;
    if (currentUser.isElite) return 0; // Free express/standard
    
    if (shippingMethod === 'express') return 30;
    return subtotal > 150 ? 0 : 15;
  }, [subtotal, currentUser.isElite, shippingMethod]);

  // Regional tax rates
  const taxRate = React.useMemo(() => {
    if (shippingState === 'CA') return 0.0825; // California: 8.25%
    if (shippingState === 'NY') return 0.08875; // New York: 8.875%
    if (shippingState === 'TX') return 0.0625; // Texas: 6.25%
    return 0.05; // Standard Flat: 5%
  }, [shippingState]);

  const taxAmount = React.useMemo(() => {
    const taxableSubtotal = Math.max(0, subtotal - discountAmount - greenDiscount);
    return Number((taxableSubtotal * taxRate).toFixed(2));
  }, [subtotal, discountAmount, greenDiscount, taxRate]);

  // Donation Amount Calculation
  const donationAmount = React.useMemo(() => {
    if (!roundUpDonation) return 0;
    const baseTotal = subtotal - discountAmount - greenDiscount + shippingCost + taxAmount;
    const nextFive = Math.ceil(baseTotal / 5) * 5;
    const diff = Number((nextFive - baseTotal).toFixed(2));
    return diff === 0 ? 5.00 : diff;
  }, [roundUpDonation, subtotal, discountAmount, greenDiscount, shippingCost, taxAmount]);

  const totalAmount = React.useMemo(() => {
    const base = Number((subtotal - discountAmount - greenDiscount + shippingCost + taxAmount).toFixed(2));
    return Number((base + (roundUpDonation ? donationAmount : 0)).toFixed(2));
  }, [subtotal, discountAmount, greenDiscount, shippingCost, taxAmount, roundUpDonation, donationAmount]);

  // Canvas Signature event listeners (Feature #23)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setSignError(null);
    const pos = getCoordinates(e);
    if (pos) {
      setSignaturePoints([pos]);
      drawPoint(pos.x, pos.y, pos.pressure, true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getCoordinates(e);
    if (pos) {
      setSignaturePoints((prev) => [...prev, pos]);
      drawPoint(pos.x, pos.y, pos.pressure, false);
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setIsSigned(true);
    // Generate a simulated biometric match score!
    setBiometricScore(Math.round(88 + Math.random() * 11));
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw grid lines on clear
        drawGrid(canvas, ctx);
      }
    }
    setSignaturePoints([]);
    setIsSigned(false);
    setBiometricScore(null);
    setSignError(null);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    let pressure = 0.5;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      pressure = e.touches[0].force || 0.5;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      pressure = 0.6; // constant mouse pressure
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      pressure
    };
  };

  const drawPoint = (x: number, y: number, pressure: number, isStart: boolean) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0d9488'; // teal-600
    ctx.lineWidth = pressure * 6 + 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isStart) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      // Draw line to current point from previous
      if (signaturePoints.length > 0) {
        const last = signaturePoints[signaturePoints.length - 1];
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const drawGrid = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(13, 148, 136, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
  };

  // Draw grid initially
  React.useEffect(() => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawGrid(canvas, ctx);
      }
    }
  }, [activeStep]);

  // Promo code validation
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);
    
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const promo = promoCodes.find((p) => p.code === code);
    if (!promo) {
      setPromoError('Voucher code does not match any active record logs.');
      return;
    }

    if (promo.requiresElite && !currentUser.isElite) {
      setPromoError('This voucher requires an active Elite Tier Membership.');
      return;
    }

    if (promo.minSubtotal && subtotal < promo.minSubtotal) {
      setPromoError(`Voucher requires a minimum cart subtotal of $${promo.minSubtotal}.`);
      return;
    }

    setAppliedPromo(promo);
    setPromoSuccess(`Voucher successfully applied! Saving ${promo.discountPercent}% on items.`);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoSuccess(null);
  };

  // Submit final checkout
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !street || !city || !zip || !cardNumber || !cardExpiry || !cardCvv) {
      alert('Please fill out all billing and payment fields completely.');
      return;
    }

    if (!isSigned) {
      setSignError("Biometric Signature authorization required to commit this ledger transaction. Please trace your authorization below.");
      const el = document.getElementById('biometric-auth-pad');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setSignError(null);

    // Map to db transaction item
    const items: OrderItem[] = cartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.price,
      quantity: item.quantity,
      image: item.product.image
    }));

    // Place the order
    onPlaceOrder({
      userId: currentUser.id,
      userName: currentUser.name,
      items,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      shipping: shippingCost,
      total: totalAmount,
      promoCodeUsed: appliedPromo?.code,
      shippingAddress: {
        fullName,
        street,
        city,
        state: shippingState,
        zip,
      },
    });

    // Clear local state
    setAppliedPromo(null);
    setPromoInput('');
    setActiveView('orders');
  };

  // Step indicator
  return (
    <div id="cart-checkout-container" className="pb-16 space-y-8">
      
      {/* STEPS INDICATOR */}
      <div className="flex items-center justify-center gap-2 border-b border-slate-100 pb-5">
        <button
          id="step-cart-indicator-btn"
          onClick={() => subtotal > 0 && setActiveStep('cart')}
          className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${
            activeStep === 'cart' ? 'bg-teal-50 text-teal-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          1. Shopping Cart
        </button>
        <ChevronRight className="h-4 w-4 text-slate-300" />
        <button
          id="step-checkout-indicator-btn"
          disabled={subtotal === 0}
          onClick={() => setActiveStep('checkout')}
          className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${
            activeStep === 'checkout' ? 'bg-teal-50 text-teal-700' : 'text-slate-400 disabled:opacity-50'
          }`}
        >
          2. Logistics & Payment
        </button>
      </div>

      {subtotal === 0 && activeStep === 'cart' ? (
        <div id="cart-empty-grid" className="grid gap-8 md:grid-cols-12">
          
          {/* EMPTY CART */}
          <div className="md:col-span-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 px-4 bg-white text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Your Cart is Empty</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Explore the listings in the bazaar and commit items to your active cart to proceed.
            </p>
            <button
              id="empty-cart-return-btn"
              onClick={() => setActiveView('storefront')}
              className="mt-6 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-colors"
            >
              Back to Storefront
            </button>
          </div>

          {/* WISHLIST SIDE PANEL */}
          <div className="md:col-span-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Active Wishlist ({wishlistProducts.length})</h4>
            {wishlistProducts.length > 0 ? (
              <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto pr-1">
                {wishlistProducts.map((p) => (
                  <div id={`wish-item-${p.id}`} key={p.id} className="py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                      <div className="leading-tight">
                        <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px]" title={p.name}>{p.name}</p>
                        <p className="text-[10px] font-mono text-teal-600 font-bold">${p.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        id={`wish-remove-${p.id}`}
                        onClick={() => onRemoveFromWishlist(p.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded-lg"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        id={`wish-move-${p.id}`}
                        onClick={() => onMoveToCart(p.id)}
                        disabled={p.stock <= 0}
                        className="p-1 text-teal-600 hover:text-teal-700 disabled:opacity-40"
                        title="Move to Cart"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Wishlist logs are currently empty.</p>
            )}
          </div>
        </div>
      ) : activeStep === 'cart' ? (
        
        /* STEP 1: CART VIEW */
        <div id="step-cart-grid" className="grid gap-8 md:grid-cols-12">
          
          {/* SHARED MULTI-USER SESSION CONTROLS (Feature #12) */}
          {sharedSessionActive && (
            <div className="md:col-span-12 rounded-2xl border border-teal-100 bg-teal-50/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img src={currentUser.avatar} alt="You" className="h-8 w-8 rounded-full border-2 border-white object-cover" title="You" />
                  {sessionPeers.map((peer, pidx) => (
                    <img key={pidx} src={peer.avatar} alt={peer.name} className="h-8 w-8 rounded-full border-2 border-white object-cover" title={peer.name} />
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Shared Session Active</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Synced via Vercel KV WebSockets • Emma & Lucas are editing live</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSplitBillingEnabled(!splitBillingEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border cursor-pointer ${
                    splitBillingEnabled 
                      ? 'bg-teal-600 text-white border-teal-600' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {splitBillingEnabled ? '✓ Split Billing Active' : 'Enable Split Billing'}
                </button>
                
                <span className="text-[10px] text-slate-400 font-mono">3 Shoppers</span>
              </div>
            </div>
          )}
          
          {/* CART ITEMS LIST (8 cols) */}
          <div className="md:col-span-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Shopping Cart Items ({cartItems.length})</h3>
            <div className="divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div id={`cart-row-${item.product.id}`} key={item.product.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Product specs */}
                  <div className="flex items-center gap-3">
                    <img src={item.product.image} alt={item.product.name} className="h-14 w-14 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                        {item.product.brand} • {item.product.category}
                      </p>
                      {item.product.isElite && currentUser.isElite && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold text-amber-800 mt-1">
                          <Crown className="h-2 w-2" />
                          <span>ELITE PRICE APPLIED (-10%)</span>
                        </span>
                      )}
                      {sharedSessionActive && (
                        <span className="block text-[8px] font-mono text-slate-400 mt-1 font-bold">
                          Owner: {item.product.id.charCodeAt(0) % 3 === 0 ? 'Emma' : item.product.id.charCodeAt(0) % 3 === 1 ? 'Lucas' : 'Me'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Quantities & Pricing controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        id={`cart-qty-dec-${item.product.id}`}
                        onClick={() => onUpdateCartQty(item.product.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-400 hover:text-slate-800 text-xs font-bold"
                      >
                        -
                      </button>
                      <span id={`cart-qty-display-${item.product.id}`} className="px-2 text-xs font-mono font-bold text-slate-800">{item.quantity}</span>
                      <button
                        id={`cart-qty-inc-${item.product.id}`}
                        onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2.5 py-1 text-slate-400 hover:text-slate-800 text-xs font-bold disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <p id={`cart-row-total-${item.product.id}`} className="text-xs font-mono font-bold text-slate-800">
                        ${(item.price * item.quantity)}
                      </p>
                      <p className="text-[9px] font-mono text-slate-400 mt-0.5">${item.price} each</p>
                    </div>

                    <button
                      id={`cart-row-remove-${item.product.id}`}
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Remove from Cart"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Split Delivery Estimates (Feature #16) */}
            {cartItems.length > 0 && (
              <div id="split-deliveries-analyzer" className="mt-6 border-t border-slate-100 pt-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 block">Logistics Routing Protocol</span>
                    <h4 className="font-extrabold text-slate-800 text-xs">Multi-Origin Dispatch Split Analyzer</h4>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <span>99.8% Perfect Carbon Routing</span>
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {warehouseSplits.map((wh) => (
                    <div key={wh.name} className={`rounded-xl border p-3.5 space-y-2.5 flex flex-col justify-between ${wh.color}`}>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5 opacity-80" />
                          <span className="font-bold text-[11px] tracking-tight">{wh.name}</span>
                        </div>
                        <ul className="space-y-1 text-[10px] opacity-90 font-medium list-disc list-inside">
                          {wh.items.map((item) => (
                            <li key={item.product.id} className="truncate" title={item.product.name}>
                              {item.quantity}x {item.product.name}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-black/5 pt-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
                        <span>EST. TRANSIT:</span>
                        <span className="font-mono">{wh.eta}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-[10px] text-slate-500 leading-relaxed border border-slate-100 flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>
                    To minimize logistics overhead and expedite clearance times, items in your basket are automatically allocated to our closest regional cargo hubs. You will receive real-time tracking streams for each dispatch block.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* CHECKOUT CALCULATOR (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            
            {/* Promo code box with Voucher Catalog Drawer / Matcher (Feature #11) */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Apply Voucher</label>
              
              {appliedPromo ? (
                <div id="applied-promo-box" className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                    <Tag className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Applied: <strong className="font-mono">{appliedPromo.code}</strong></span>
                  </div>
                  <button
                    id="remove-promo-btn"
                    onClick={handleRemovePromo}
                    className="text-[10px] font-bold text-emerald-800 underline hover:no-underline uppercase cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form id="promo-apply-form" onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    id="promo-code-input"
                    type="text"
                    placeholder="e.g. NEXUS10"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500"
                  />
                  <button
                    id="promo-submit-btn"
                    type="submit"
                    className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {promoError && (
                <p id="promo-error-msg" className="text-[10px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{promoError}</span>
                </p>
              )}
              {promoSuccess && (
                <p id="promo-success-msg" className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>{promoSuccess}</span>
                </p>
              )}

              {/* Dynamic Voucher Ledger list (Feature #11) */}
              <div id="voucher-catalog-drawer" className="border-t border-slate-100 pt-3.5 mt-2 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Available Voucher Catalog</span>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {promoCodes.map((promo) => {
                    const meetsElite = !promo.requiresElite || currentUser.isElite;
                    const meetsMin = !promo.minSubtotal || subtotal >= promo.minSubtotal;
                    const isEligible = meetsElite && meetsMin;
                    const isCurrentlyApplied = appliedPromo?.code === promo.code;

                    return (
                      <div
                        id={`voucher-catalog-item-${promo.code}`}
                        key={promo.code}
                        onClick={() => {
                          if (isEligible && !isCurrentlyApplied) {
                            setAppliedPromo(promo);
                            setPromoSuccess(`Voucher ${promo.code} applied successfully!`);
                            setPromoError(null);
                          }
                        }}
                        className={`rounded-xl border p-2.5 transition-all text-left group relative ${
                          isCurrentlyApplied
                            ? 'bg-emerald-50 border-emerald-300 shadow-2xs'
                            : isEligible
                              ? 'bg-white hover:bg-slate-50 border-slate-100 cursor-pointer hover:border-teal-300'
                              : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-slate-800">{promo.code}</span>
                            {promo.requiresElite && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.25 text-[7px] font-bold text-amber-800">
                                <Crown className="h-2 w-2" />
                                <span>ELITE</span>
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-black text-teal-600">-{promo.discountPercent}%</span>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">{promo.description}</p>
                        
                        {promo.minSubtotal && (
                          <p className="text-[8px] font-mono text-slate-400 mt-0.5">Min. Order Value: ${promo.minSubtotal}</p>
                        )}

                        <div className="mt-2 pt-1.5 border-t border-slate-50 flex items-center justify-between text-[8px] font-mono uppercase tracking-widest">
                          {!isEligible ? (
                            <span className="text-red-500 font-bold">
                              {!meetsElite ? 'Requires Elite Status' : `Requires Min. $${promo.minSubtotal}`}
                            </span>
                          ) : isCurrentlyApplied ? (
                            <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                              <span>✓ APPLIED</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 group-hover:text-teal-600 transition-colors">Quick Apply</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Subtotal summary card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Order Summary</h4>
              
              <div className="space-y-2 text-xs border-b border-slate-50 pb-3">
                <div className="flex justify-between text-slate-500">
                  <span>Cart Subtotal</span>
                  <span id="summary-subtotal" className="font-mono font-bold text-slate-700">${subtotal}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedPromo.discountPercent}%)</span>
                    <span id="summary-discount" className="font-mono font-bold">-${discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fees</span>
                  <span id="summary-shipping" className="font-mono font-bold text-slate-700">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost}`}
                  </span>
                </div>
              </div>

              {appliedPromo && (
                <div id="cart-promo-breakdown-banner" className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 space-y-1 animate-fade-in shadow-2xs">
                  <span className="font-bold uppercase tracking-wider text-[9px] text-emerald-600 font-mono block">Voucher Calculation Ledger</span>
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal before Promo</span>
                    <span className="font-mono">${subtotal}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Savings ({appliedPromo.code})</span>
                    <span className="font-mono">-${discountAmount}</span>
                  </div>
                  <div className="border-t border-emerald-100/40 my-1"></div>
                  <div className="flex justify-between font-bold text-emerald-900">
                    <span>Discounted Subtotal</span>
                    <span className="font-mono">${subtotal - discountAmount}</span>
                  </div>
                </div>
              )}

              {/* MICRO-DONATION ROUND-UPS (Feature #17) */}
              <div className="border-t border-dashed border-slate-100 pt-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roundUpDonation}
                    onChange={(e) => setRoundUpDonation(e.target.checked)}
                    className="accent-teal-600 rounded"
                  />
                  <span className="text-[11px] font-bold text-slate-700">Round up to donate to green causes</span>
                </label>

                {roundUpDonation && (
                  <div className="pl-5 space-y-1.5 animate-fade-in">
                    <p className="text-[10px] text-slate-400">Your donation of <span className="font-bold text-teal-600 font-mono">${donationAmount.toFixed(2)}</span> will go directly to your chosen impact sector:</p>
                    <select
                      value={donationCause}
                      onChange={(e: any) => setDonationCause(e.target.value)}
                      className="w-full rounded-lg border border-slate-100 bg-slate-50 p-1.5 text-[10px] text-slate-700 outline-none"
                    >
                      <option value="carbon_capture">Direct Air Carbon Capture (DAC)</option>
                      <option value="green_forest">Sustainable Reforestation Hub</option>
                      <option value="ewaste">Electronic E-Waste Reduction Node</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-slate-50">
                <span className="text-sm font-bold text-slate-800">Estimated Total</span>
                <span id="summary-total" className="text-xl font-black text-slate-900 font-mono">${totalAmount}</span>
              </div>

              {splitBillingEnabled && (
                <div className="bg-teal-50 border border-teal-100/50 rounded-xl p-3 text-[11px] text-teal-800 space-y-1 mt-2">
                  <span className="font-bold uppercase tracking-wider text-[9px] text-teal-600 font-mono block">Co-Op Split Billing Activated</span>
                  <div className="flex justify-between font-bold">
                    <span>Your 1/3 Portion</span>
                    <span className="font-mono text-xs text-teal-900">${(totalAmount / 3).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                id="cart-next-step-btn"
                onClick={() => setActiveStep('checkout')}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              {currentUser.isElite ? (
                <div className="rounded-xl bg-amber-50/50 p-3 border border-amber-100 flex gap-2">
                  <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    <strong>Elite Logistics Activated:</strong> You have been automatically upgraded to free Express courier service ($0 shipping fee).
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 text-center">
                  Standard shipping is free on orders exceeding $150.
                </p>
              )}
            </div>

          </div>

        </div>
      ) : (
        
        /* STEP 2: SHIPPING AND BILLING CHECKOUT FORM */
        <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="grid gap-8 md:grid-cols-12 max-w-4xl mx-auto">
          
          {/* Left Column: Delivery details (8 cols) */}
          <div className="md:col-span-8 space-y-6">
            
            {/* 1. SHIPPING LOGISTICS */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-50 pb-3">
                <MapPin className="h-4 w-4 text-teal-600" />
                <span>Logistics Delivery Endpoint</span>
              </div>

              {/* ANONYMOUS GIFTING VAULT WIDGET (Feature #14) */}
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-xs">
                  <input
                    type="checkbox"
                    checked={anonymousGiftingEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setAnonymousGiftingEnabled(enabled);
                      if (enabled) {
                        // Auto-fill hidden details so standard HTML validators pass without friction
                        setStreet('Vault Routed Endpoint');
                        setCity('Decentralized Depot');
                        setZip('94101');
                      } else {
                        setStreet('');
                        setCity('');
                        setZip('');
                      }
                    }}
                    className="accent-teal-600 rounded"
                  />
                  <span>Route via Encrypted Anonymous Gifting Vault</span>
                </label>
                
                {anonymousGiftingEnabled ? (
                  <div className="space-y-3.5 pt-2 animate-fade-in text-xs">
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Security token generated! The physical package will print your custom cipher token. The courier will look up the recipient's coordinates on scans without exposing your name or billing details.
                    </p>
                    
                    <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2">
                      <span className="text-[8px] font-mono text-slate-500 uppercase font-bold block">Secure Vault Cipher Token</span>
                      <p className="font-mono text-xs font-black tracking-wider text-teal-400">{giftToken}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Recipient Email</label>
                        <input
                          type="email"
                          required
                          placeholder="recipient@domain.com"
                          value={giftRecipientEmail}
                          onChange={(e) => setGiftRecipientEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Encrypted Gift Note</label>
                        <input
                          type="text"
                          placeholder="Happy Birthday! Open soon!"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 leading-normal">Redacts billing credentials from standard packing slip metrics, converting delivery into an un-trackable surprise note.</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-600">Full Recipient Name</label>
                  <input
                    id="checkout-fullName-input"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-600">Street Address</label>
                  <input
                    id="checkout-street-input"
                    type="text"
                    required
                    placeholder="e.g. 427 Quantum Boulevard, Suite 9"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">City</label>
                  <input
                    id="checkout-city-input"
                    type="text"
                    required
                    placeholder="e.g. San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">State / Region</label>
                    <div className="relative">
                      <select
                        id="checkout-state-select"
                        value={shippingState}
                        onChange={(e) => setShippingState(e.target.value)}
                        className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none appearance-none cursor-pointer focus:border-teal-500 focus:bg-white"
                      >
                        <option value="CA">California (CA)</option>
                        <option value="NY">New York (NY)</option>
                        <option value="TX">Texas (TX)</option>
                        <option value="OR">Oregon (OR)</option>
                        <option value="WA">Washington (WA)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">ZIP Code</label>
                    <input
                      id="checkout-zip-input"
                      type="text"
                      required
                      placeholder="e.g. 94107"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. SHIPPING SPEED METHOD */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-50 pb-3">
                <Truck className="h-4 w-4 text-teal-600" />
                <span>Logistics Courier Priority</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Standard option */}
                <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  shippingMethod === 'standard' ? 'border-teal-500 bg-teal-50/10' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}>
                  <input
                    id="checkout-shipping-standard"
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Standard Courier</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">3-5 Business Days Delivery</span>
                    <span className="text-xs font-bold text-slate-700 block mt-2">
                      {currentUser.isElite || subtotal > 150 ? 'FREE' : '$15'}
                    </span>
                  </div>
                </label>

                {/* Express option */}
                <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  shippingMethod === 'express' ? 'border-teal-500 bg-teal-50/10' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}>
                  <input
                    id="checkout-shipping-express"
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block flex items-center gap-1">
                      <span>Express Courier</span>
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold text-amber-800">
                        PRIORITY
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Next-Day Hub Logistics</span>
                    <span className="text-xs font-bold text-slate-700 block mt-2">
                      {currentUser.isElite ? 'FREE (Elite upgraded)' : '$30'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* 2B. QUANTUM ECO ROUTING OPTIMIZER (Feature #22) */}
            <div id="eco-routing-card" className="rounded-2xl border border-teal-100 bg-teal-950 text-white p-5 space-y-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 pointer-events-none opacity-10">
                <Leaf className="h-24 w-24 text-teal-400" />
              </div>

              <div className="flex items-center justify-between border-b border-teal-800 pb-3">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold font-mono tracking-wider uppercase text-emerald-400">Quantum Eco Routing Optimizer</span>
                </div>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[8px] font-bold font-mono text-emerald-300 border border-emerald-800">
                  REAL-TIME EMISSIONS MODEL
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Determine the optimal shipping vector. Select the **Solar Drone Cargo** system to offset logistical carbon emissions and trigger a **5% Green Discount** on your total.
              </p>

              {/* Dynamic Animated Vector Pathway Map */}
              <div className="relative h-[110px] rounded-xl bg-slate-950/80 border border-teal-900/40 p-2 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 400 100">
                  {/* Grid lines */}
                  <g stroke="rgba(20, 184, 166, 0.05)" strokeWidth="0.5">
                    <line x1="0" y1="25" x2="400" y2="25" />
                    <line x1="0" y1="50" x2="400" y2="50" />
                    <line x1="0" y1="75" x2="400" y2="75" />
                    <line x1="100" y1="0" x2="100" y2="100" />
                    <line x1="200" y1="0" x2="200" y2="100" />
                    <line x1="300" y1="0" x2="300" y2="100" />
                  </g>

                  {/* Nodes */}
                  <circle cx="40" cy="50" r="4" fill="#0d9488" className="animate-ping" style={{ animationDuration: '3s' }} />
                  <circle cx="40" cy="50" r="3" fill="#0d9488" />
                  <text x="35" y="38" fill="#14b8a6" fontSize="7" fontFamily="monospace">AUSTIN_HUB</text>

                  <circle cx="360" cy="50" r="4" fill="#0d9488" />
                  <text x="325" y="38" fill="#14b8a6" fontSize="7" fontFamily="monospace">RECIPIENT_NODE</text>

                  {/* Vector tracks */}
                  {/* Drone track: Arc */}
                  <path 
                    d="M 40,50 Q 200,5 360,50" 
                    fill="none" 
                    stroke={ecoRoute === 'drone' ? '#34d399' : 'rgba(52, 211, 153, 0.15)'} 
                    strokeWidth={ecoRoute === 'drone' ? '2' : '1'} 
                    strokeDasharray="4 3" 
                  />
                  {/* Mag-lev track: Straight Line */}
                  <line 
                    x1="40" y1="50" x2="360" y2="50" 
                    stroke={ecoRoute === 'maglev' ? '#38bdf8' : 'rgba(56, 189, 248, 0.15)'} 
                    strokeWidth={ecoRoute === 'maglev' ? '2' : '1'} 
                    strokeDasharray="5 5" 
                  />
                  {/* Hyperloop track: Downward arc */}
                  <path 
                    d="M 40,50 Q 200,95 360,50" 
                    fill="none" 
                    stroke={ecoRoute === 'hyperloop' ? '#fbbf24' : 'rgba(251, 191, 36, 0.15)'} 
                    strokeWidth={ecoRoute === 'hyperloop' ? '2' : '1'} 
                    strokeDasharray="6 2" 
                  />

                  {/* Moving pulse indicator along chosen track */}
                  {ecoRoute === 'drone' && (
                    <circle r="4" fill="#34d399">
                      <animateMotion dur="4s" repeatCount="indefinite" path="M 40,50 Q 200,5 360,50" />
                    </circle>
                  )}
                  {ecoRoute === 'maglev' && (
                    <circle r="4" fill="#38bdf8">
                      <animateMotion dur="3s" repeatCount="indefinite" path="M 40,50 L 360,50" />
                    </circle>
                  )}
                  {ecoRoute === 'hyperloop' && (
                    <circle r="4" fill="#fbbf24">
                      <animateMotion dur="2s" repeatCount="indefinite" path="M 40,50 Q 200,95 360,50" />
                    </circle>
                  )}
                </svg>

                <div className="absolute bottom-2 left-3 text-[8px] font-mono text-slate-400 flex items-center gap-2">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Solar Drone</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span> Mag-lev</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Undersea Loop</span>
                </div>
              </div>

              {/* Selector buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setEcoRoute('drone')}
                  className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                    ecoRoute === 'drone' ? 'border-emerald-500 bg-emerald-950 text-emerald-100 shadow-sm' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-bold block leading-none flex items-center gap-1">
                    Solar Drone
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </span>
                  <span className="text-[8px] text-emerald-400 font-mono block mt-1">-14kg CO₂ (Save 5%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEcoRoute('maglev')}
                  className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                    ecoRoute === 'maglev' ? 'border-sky-500 bg-sky-950 text-sky-100 shadow-sm' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-bold block leading-none">Mag-lev Rail</span>
                  <span className="text-[8px] text-sky-300 font-mono block mt-1">+2.4kg CO₂ (Neutral)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEcoRoute('hyperloop')}
                  className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                    ecoRoute === 'hyperloop' ? 'border-amber-500 bg-amber-950 text-amber-100 shadow-sm' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-bold block leading-none">Hyperloop</span>
                  <span className="text-[8px] text-amber-400 font-mono block mt-1">+8.2kg CO₂ (High)</span>
                </button>
              </div>
            </div>

            {/* 3. SIMULATED PAYMENT CARD */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-50 pb-3">
                <CreditCard className="h-4 w-4 text-teal-600" />
                <span>Simulated Secure Payment Vault</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-600">Credit Card Number</label>
                  <input
                    id="checkout-cardNumber-input"
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Expiry (MM/YY)</label>
                  <input
                    id="checkout-cardExpiry-input"
                    type="text"
                    required
                    placeholder="12/29"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">CVV</label>
                  <input
                    id="checkout-cardCvv-input"
                    type="password"
                    required
                    placeholder="•••"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white font-mono"
                  />
                </div>
                <div className="sm:col-span-3 pt-2">
                  <div className="flex gap-2 text-[10px] text-slate-400 leading-normal">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                    <p>Encryption logs validated. Payment occurs in a sandboxed, client-contained state. No physical currency is drafted.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. BIOMETRIC SIGNATURE AUTH PAD (Feature #23) */}
            <div id="biometric-auth-pad" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <Fingerprint className="h-4 w-4 text-teal-600 animate-pulse" />
                  <span>Biometric Dispatch Signature Pad</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                  TRANSACTION_SECURE_M2
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                Nexus security laws require a digital biometric signature log to authorize final goods dispatch. Use your cursor or touch screen to trace your signature inside the matrix grid below.
              </p>

              {/* Signature Canvas Grid */}
              <div className="relative border border-slate-200 rounded-xl bg-slate-50 overflow-hidden h-[150px] cursor-crosshair">
                <canvas
                  ref={sigCanvasRef}
                  width={400}
                  height={150}
                  className="w-full h-[150px] block"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={endDrawing}
                />

                {/* Status Indicator overlay */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-mono bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200/50">
                  <Activity className={`h-3 w-3 ${isDrawing ? 'text-teal-600 animate-pulse' : 'text-slate-400'}`} />
                  <span>{isDrawing ? 'SENSORS_RECORDING' : isSigned ? 'SIGNATURE_LOCKED' : 'SENSORS_STANDBY'}</span>
                </div>

                {/* Guide Text */}
                {!isSigned && !isDrawing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 space-y-1">
                    <PenTool className="h-5 w-5 text-slate-300 animate-bounce" />
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider">Trace Signature Here</span>
                  </div>
                )}
              </div>

              {signError && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-[10px] text-rose-700 font-medium animate-shake">
                  {signError}
                </div>
              )}

              {/* Action and feedback row */}
              <div className="flex items-center justify-between">
                <div>
                  {isSigned && biometricScore && (
                    <div className="text-[10px] font-mono text-teal-600 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 animate-bounce" />
                      <div>
                        <span className="font-bold">Biometric Match: {biometricScore}%</span>
                        <span className="text-slate-400 block text-[8px]">Index: HIGHER_TRUST_RATING_VERIFIED</span>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[10px] font-bold font-mono text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Clear Signature
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Calculations & Submit (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            
            {/* Calculation Recap */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Logistics Breakdown</h4>

              <div className="divide-y divide-slate-50 space-y-3">
                {/* Minimal product recap list */}
                <div className="space-y-2 pb-3">
                  {cartItems.map((item) => (
                    <div id={`checkout-recap-${item.product.id}`} key={item.product.id} className="flex justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[150px]">{item.product.name} (x{item.quantity})</span>
                      <span className="font-mono">${item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs pt-3 pb-3">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span id="recap-subtotal" className="font-mono text-slate-700 font-semibold">${subtotal}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({appliedPromo.discountPercent}%)</span>
                      <span id="recap-discount" className="font-mono font-bold">-${discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping Courier</span>
                    <span id="recap-shipping" className="font-mono text-slate-700 font-semibold">
                      {shippingCost === 0 ? 'FREE' : `$${shippingCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Sales Tax ({ (taxRate * 100).toFixed(2) }%)</span>
                    <span id="recap-tax" className="font-mono text-slate-700 font-semibold">${taxAmount}</span>
                  </div>
                  {greenDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium animate-fade-in">
                      <span>Green Route Offset (5%)</span>
                      <span id="recap-green-discount" className="font-mono font-bold">-${greenDiscount}</span>
                    </div>
                  )}
                </div>

                {appliedPromo && (
                  <div id="recap-promo-breakdown-banner" className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 space-y-1 animate-fade-in shadow-2xs">
                    <span className="font-bold uppercase tracking-wider text-[9px] text-emerald-600 font-mono block">Voucher Calculation Ledger</span>
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal before Promo</span>
                      <span className="font-mono">${subtotal}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Savings ({appliedPromo.code})</span>
                      <span className="font-mono">-${discountAmount}</span>
                    </div>
                    <div className="border-t border-emerald-100/40 my-1"></div>
                    <div className="flex justify-between font-bold text-emerald-900">
                      <span>Discounted Subtotal</span>
                      <span className="font-mono">${subtotal - discountAmount}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-3">
                  <span className="text-sm font-bold text-slate-800">Final Charged Total</span>
                  <span id="recap-total" className="text-2xl font-black text-teal-600 font-mono">${totalAmount}</span>
                </div>
              </div>

              <button
                id="checkout-place-order-btn"
                type="submit"
                className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] mt-4"
              >
                Place Order (${totalAmount})
              </button>

              <button
                id="checkout-cancel-btn"
                type="button"
                onClick={() => setActiveStep('cart')}
                className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest mt-2"
              >
                Return to Edit Cart
              </button>
            </div>

          </div>

        </form>

      )}

    </div>
  );
}
