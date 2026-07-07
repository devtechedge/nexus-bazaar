/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Sparkles,
  ArrowRight,
  Database
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
  
  // --- BATCH 7: SUSTAINABILITY & CIRCULAR ECONOMY STATES (Features #61, #63, #65, #69) ---
  const [ecoPackagingToggle, setEcoPackagingToggle] = React.useState<boolean>(false);
  const [deliveryChoice, setDeliveryChoice] = React.useState<'home' | 'hub'>('home');
  const [selectedLockerHub, setSelectedLockerHub] = React.useState<string>('hub_alpha');
  const [donationPortalMode, setDonationPortalMode] = React.useState<'round_up' | 'percentage'>('round_up');
  const [donationPercentage, setDonationPercentage] = React.useState<number>(3); // 1%, 3%, 5%
  const [selectedNGO, setSelectedNGO] = React.useState<string>('ocean_cleanup');

  const ngoCatalog = React.useMemo(() => [
    { id: 'ocean_cleanup', name: 'The Ocean Cleanup Foundation', mission: 'Deploying high-efficiency passive marine cleanup interceptors.' },
    { id: 'carbon180', name: 'Carbon180 Atmospheric Recovery', mission: 'Vetting micro-capture systems to filter atmospheric carbon molecules.' },
    { id: 'one_tree', name: 'One Tree Planted Initiative', mission: 'Active biodiverse reforestation in key tropical and urban zones.' },
    { id: 'ewaste_circular', name: 'E-Waste Circularity Alliance', mission: 'Reclaiming high-grade copper and gold trace lines from discarded electronics.' }
  ], []);

  const lockerHubs = React.useMemo(() => [
    { id: 'hub_alpha', name: 'Nexus Locker Hub Alpha (Seattle-East)', distance: '1.2 miles', bonusCredits: 5.00 },
    { id: 'hub_beta', name: 'Nexus Locker Hub Beta (Downtown Grid)', distance: '3.4 miles', bonusCredits: 5.00 },
    { id: 'hub_gamma', name: 'Neighborhood Circular Node (Subang North)', distance: '2.1 miles', bonusCredits: 5.00 }
  ], []);

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

  // Store Credits state (Feature 51)
  const [storeCredits, setStoreCredits] = React.useState<number>(() => {
    if (typeof window === 'undefined') return 25.00;
    const stored = localStorage.getItem('nexus_bazaar_store_credit');
    return stored ? parseFloat(stored) : 25.00;
  });
  const [useStoreCredits, setUseStoreCredits] = React.useState<boolean>(false);

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

  // --- FEATURE #22: MULTI-ADDRESS SPLIT CHECKOUT ---
  const [splitAddressEnabled, setSplitAddressEnabled] = React.useState(false);
  const [splitAddresses, setSplitAddresses] = React.useState<Record<string, string>>({}); // itemID -> address string

  // --- FEATURE #23: MICRO-FULFILLMENT HOLD REGISTRY ---
  const [holdInWarehouse, setHoldInWarehouse] = React.useState(false);
  const [holdDurationDays, setHoldDurationDays] = React.useState(7); // 1 to 14 days

  // --- FEATURE #25: FRACTIONAL INVOICING FOR SHARED BUSINESS ACCOUNTS ---
  const [fractionalInvoicingEnabled, setFractionalInvoicingEnabled] = React.useState(false);
  const [fractionalShares, setFractionalShares] = React.useState<Record<string, number>>({
    'Corporate Headquarters': 50,
    'R&D Sector C': 30,
    'Logistics Division': 20
  }); // percentage split

  // --- FEATURE #27: PREDICTIVE SHIPPING DELAY NOTIFICATIONS ---
  const [ecoRouteBuffer, setEcoRouteBuffer] = React.useState(false);
  
  // Forecast exact shipping lag using route congestion, solar flare storms, asteroid-density risk
  const delayForecast = React.useMemo(() => {
    let baseDelay = shippingMethod === 'express' ? 1 : 4;
    let factor = shippingState === 'NY' ? 1.8 : shippingState === 'CA' ? 0.9 : 1.3;
    let solarCongestion = shippingState === 'NY' ? 'MODERATE SOLAR FLARE IMPACT' : 'STABLE LOGISTICS CORRIDOR';
    let asteroidRisk = shippingState === 'TX' ? 'HIGH SPACE-DEBRIS INDEX' : 'CLEAR COURIER ROUTE';
    
    let baseDays = Math.max(1, Math.round(baseDelay * factor));
    let bufferDays = ecoRouteBuffer ? 3 : 0;
    
    return {
      days: baseDays + bufferDays,
      solarCongestion,
      asteroidRisk,
      routeCongestionPct: Math.round(factor * 35),
      environmentalSavings: ecoRouteBuffer ? 4.8 : 0 // CO2 offset kg
    };
  }, [shippingState, shippingMethod, ecoRouteBuffer]);

  // --- BATCH 8: ADVANCED ENTERPRISE SECURITY, PRIVACY & CONTROLS STATES ---
  const [zkAddressVaultEnabled, setZkAddressVaultEnabled] = React.useState<boolean>(false);
  const [useDisposableVirtualCard, setUseDisposableVirtualCard] = React.useState<boolean>(false);
  const [mfaModalOpen, setMfaModalOpen] = React.useState<boolean>(false);
  const [mfaVerified, setMfaVerified] = React.useState<boolean>(false);
  const [mfaSimulating, setMfaSimulating] = React.useState<boolean>(false);
  const [mfaInputCode, setMfaInputCode] = React.useState<string>('');
  const [mfaError, setMfaError] = React.useState<string | null>(null);

  // 74. Device Session Fingerprint
  const [simulatedDeviceCountry, setSimulatedDeviceCountry] = React.useState<string>('US');
  const [simulatedDeviceCity, setSimulatedDeviceCity] = React.useState<string>('Seattle');
  const [simulatedDeviceIP, setSimulatedDeviceIP] = React.useState<string>('192.168.1.104');
  const [sessionAnomalyActive, setSessionAnomalyActive] = React.useState<boolean>(false);

  // 75. Review Pseudonym Mask
  const [reviewPseudonymMask, setReviewPseudonymMask] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('nexus_bazaar_buyer_review_pseudonym_mask');
    return stored === 'true';
  });

  // 78. Cart Garbage Collector Timer (in seconds)
  const [cartGcTimer, setCartGcTimer] = React.useState<number>(600); // 10 minutes default
  const [gcExtendedMessage, setGcExtendedMessage] = React.useState<string | null>(null);

  // Cart Garbage Collector Effect
  React.useEffect(() => {
    if (cart.length === 0) return;
    const interval = setInterval(() => {
      setCartGcTimer((prev) => {
        if (prev <= 1) {
          // Clear cart items
          cart.forEach(item => onRemoveFromCart(item.productId));
          // Log event to security ledger
          const logs = (() => {
            const stored = localStorage.getItem('nexus_bazaar_security_ledger');
            return stored ? JSON.parse(stored) : [];
          })();
          logs.unshift({
            id: `sec_${Date.now()}`,
            timestamp: new Date().toISOString(),
            level: 'WARN',
            source: 'GARBAGE_COLLECT',
            message: `Stale checkout cache auto-reclaimed by Ephemeral Cart Garbage Collector (Timer reached 0s).`,
            hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
          });
          localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cart, onRemoveFromCart, currentUser]);

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

  // --- BATCH 7: DYNAMIC CARBON FOOTPRINT EMISSIONS CALCULATOR ---
  const packageMetrics = React.useMemo(() => {
    let totalWeight = cartItems.reduce((acc, item) => {
      let weight = 0.5; // default 0.5kg
      const name = item.product.name.toLowerCase();
      if (name.includes('keyboard')) weight = 1.4;
      if (name.includes('headphones')) weight = 0.45;
      if (name.includes('watch')) weight = 0.22;
      if (name.includes('lens') || name.includes('camera')) weight = 0.85;
      if (name.includes('deck') || name.includes('console')) weight = 1.25;
      return acc + (weight * item.quantity);
    }, 0);
    if (totalWeight === 0) totalWeight = 0.5;

    let distance = 150; // miles/km
    if (deliveryChoice === 'hub') {
      distance = selectedLockerHub === 'hub_alpha' ? 12 : selectedLockerHub === 'hub_beta' ? 34 : 21;
    } else {
      if (shippingState === 'NY') distance = 2800;
      else if (shippingState === 'TX') distance = 1500;
      else if (shippingState === 'CA') distance = 180;
      else if (shippingState === 'OR') distance = 450;
      else if (shippingState === 'WA') distance = 600;
      else distance = 800;
    }

    let transportCoeff = 0.0006;
    if (ecoRoute === 'drone') transportCoeff = 0.00012;
    else if (ecoRoute === 'maglev') transportCoeff = 0.00028;
    else if (ecoRoute === 'hyperloop') transportCoeff = 0.00006;

    const rawEmissions = totalWeight * distance * transportCoeff;
    const finalEmissions = Number(rawEmissions.toFixed(3)); // in kg CO2

    return {
      totalWeight: Number(totalWeight.toFixed(2)),
      distance,
      emissions: finalEmissions,
    };
  }, [cartItems, deliveryChoice, selectedLockerHub, shippingState, ecoRoute]);

  // Donation Amount Calculation
  const donationAmount = React.useMemo(() => {
    if (!roundUpDonation) return 0;
    const baseTotal = subtotal - discountAmount - greenDiscount + shippingCost + taxAmount;
    if (donationPortalMode === 'round_up') {
      const nextFive = Math.ceil(baseTotal / 5) * 5;
      const diff = Number((nextFive - baseTotal).toFixed(2));
      return diff === 0 ? 5.00 : diff;
    } else {
      const taxableSubtotal = Math.max(0, subtotal - discountAmount - greenDiscount);
      return Number((taxableSubtotal * (donationPercentage / 100)).toFixed(2));
    }
  }, [roundUpDonation, donationPortalMode, donationPercentage, subtotal, discountAmount, greenDiscount, shippingCost, taxAmount]);

  const totalAmountBeforeCredits = React.useMemo(() => {
    const packagingSavings = ecoPackagingToggle ? 1.50 : 0;
    const base = Number((subtotal - discountAmount - greenDiscount + shippingCost + taxAmount - packagingSavings).toFixed(2));
    return Number((base + (roundUpDonation ? donationAmount : 0)).toFixed(2));
  }, [subtotal, discountAmount, greenDiscount, shippingCost, taxAmount, roundUpDonation, donationAmount, ecoPackagingToggle]);

  const appliedCredits = React.useMemo(() => {
    if (!useStoreCredits) return 0;
    return Number(Math.min(storeCredits, totalAmountBeforeCredits).toFixed(2));
  }, [useStoreCredits, storeCredits, totalAmountBeforeCredits]);

  const totalAmount = React.useMemo(() => {
    return Number(Math.max(0, totalAmountBeforeCredits - appliedCredits).toFixed(2));
  }, [totalAmountBeforeCredits, appliedCredits]);

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

    if (sessionAnomalyActive && !mfaVerified) {
      alert('SECURITY ALERT: Geohop Threat Lock Active. You must complete FIDO2 Hardware Key Authentication in the Security & Privacy panel before checkout can be authorized.');
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
        fullName: zkAddressVaultEnabled ? 'A. Vance (Address Locked for Privacy)' : fullName,
        street: zkAddressVaultEnabled ? 'ADDRESS LOCKED (Encrypted for privacy)' : street,
        city: zkAddressVaultEnabled ? '[PRIVATE_SHIPPING_LOCK]' : city,
        state: zkAddressVaultEnabled ? 'ZK' : shippingState,
        zip: zkAddressVaultEnabled ? '00000' : zip,
      },
      warehouseHoldDays: holdInWarehouse ? holdDurationDays : undefined,
      fractionalInvoices: fractionalInvoicingEnabled ? fractionalShares : undefined,
      predictiveLagDays: delayForecast.days,
      splitDeliveryAddresses: splitAddressEnabled ? splitAddresses : undefined,
      isZeroKnowledgeEncrypted: zkAddressVaultEnabled,
    });

    // BATCH 8: SECURITY AUDIT LEDGER TRANSACTION LOG (Feature 77)
    const logs = (() => {
      const stored = localStorage.getItem('nexus_bazaar_security_ledger');
      return stored ? JSON.parse(stored) : [];
    })();
    logs.unshift({
      id: `sec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'SECURE',
      source: 'CHECKOUT_PIPELINE',
      message: `Checkout authorized & committed. Net: $${totalAmount}. Ultra-Private Shipping Lock: ${zkAddressVaultEnabled ? 'ACTIVE' : 'INACTIVE'}. Disposable Card: ${useDisposableVirtualCard ? 'ACTIVE' : 'INACTIVE'}. Biometric Match: ${biometricScore || '95'}%.`,
      hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    });
    localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));

    // Update store credits if used (Feature 51) & locker hub pickup reward (Feature 65)
    let finalCredits = storeCredits;
    const txHistory = (() => {
      const storedTx = localStorage.getItem('nexus_bazaar_loyalty_ledger');
      return storedTx ? JSON.parse(storedTx) : [];
    })();

    if (appliedCredits > 0) {
      finalCredits = Number((finalCredits - appliedCredits).toFixed(2));
      const newTx = {
        id: `tx_spend_${Date.now()}`,
        type: 'spend',
        amount: appliedCredits,
        description: `Applied credits to Order checkout`,
        date: new Date().toISOString().split('T')[0]
      };
      txHistory.unshift(newTx);
    }

    if (deliveryChoice === 'hub') {
      finalCredits = Number((finalCredits + 5.00).toFixed(2));
      const newTx = {
        id: `tx_hub_pickup_${Date.now()}`,
        type: 'earn',
        amount: 5.00,
        description: `Bonus credits for locker hub delivery pickup selection`,
        date: new Date().toISOString().split('T')[0]
      };
      txHistory.unshift(newTx);
    }

    localStorage.setItem('nexus_bazaar_store_credit', finalCredits.toFixed(2));
    localStorage.setItem('nexus_bazaar_loyalty_ledger', JSON.stringify(txHistory));

    // Update lifetime spend milestones (Feature 52)
    const storedSpend = localStorage.getItem('nexus_bazaar_lifetime_spend');
    const currentSpend = storedSpend ? parseFloat(storedSpend) : 850.00;
    const nextSpend = currentSpend + subtotal;
    localStorage.setItem('nexus_bazaar_lifetime_spend', nextSpend.toFixed(2));

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
                  <span className="font-bold uppercase tracking-wider text-[9px] text-teal-600 font-mono block">Group Split Discount Activated</span>
                  <div className="flex justify-between font-bold">
                    <span>Your Share (1/3 of total)</span>
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

              {/* FEATURE #22: MULTI-ADDRESS SPLIT CHECKOUT TOGGLE */}
              <div className="rounded-2xl border border-slate-200/60 bg-slate-50/40 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase leading-none">Multi-Address Split Checkout</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Route items in this checkout to separate destinations under a single unified payment transaction.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={splitAddressEnabled}
                    onChange={(e) => setSplitAddressEnabled(e.target.checked)}
                    className="accent-teal-600 h-4.5 w-4.5 cursor-pointer rounded"
                  />
                </div>

                {splitAddressEnabled ? (
                  <div className="bg-white rounded-xl p-3.5 space-y-3.5 border border-slate-200/50">
                    <span className="text-[9px] font-bold text-teal-700 font-mono uppercase tracking-wide block border-b border-slate-100 pb-1.5">Configure Destination Rerouting</span>
                    {cartItems.map((item) => (
                      <div key={item.id} className="space-y-1 pb-2 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{item.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">Qty: {item.quantity}</span>
                        </div>
                        <input
                          type="text"
                          required={splitAddressEnabled}
                          placeholder="e.g. 104 Industrial Pkwy, Seattle WA 98101"
                          value={splitAddresses[item.id] || ''}
                          onChange={(e) => {
                            setSplitAddresses({
                              ...splitAddresses,
                              [item.id]: e.target.value
                            });
                          }}
                          className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs outline-none focus:border-teal-500 focus:bg-white"
                        />
                      </div>
                    ))}
                    <p className="text-[8.5px] text-slate-400 font-mono leading-relaxed pt-1 border-t border-slate-150">
                      Standard shipping fees are optimized. You are billed once and our fulfillment drones will dispatch from separate matching warehouse corridors.
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Active un-split delivery: All items are bound for the default single recipient master address specified below.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-600">
                    {splitAddressEnabled ? 'Default Master Billing / Recipient Name' : 'Full Recipient Name'}
                  </label>
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

            {/* BATCH 7: SUSTAINABILITY & CIRCULAR ECONOMY (Features 61, 63, 65, 69) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-slate-800 text-left">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Circular Sustainability Dispatch</h3>
                </div>
                <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
                  Zero Carbon Protocol
                </span>
              </div>

              {/* 61. DYNAMIC CARBON-FOOTPRINT CALCULATOR */}
              <div className="space-y-3 bg-slate-50 border border-slate-150 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">61. Live Transit Carbon Footprint</span>
                    <span className="text-[11px] text-slate-500 leading-normal">Dynamic math modeling of freight density & transit vector.</span>
                  </div>
                  <span className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs border border-emerald-500/20">
                    📊
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white rounded-lg p-2 border border-slate-200/50">
                    <span className="text-[8px] font-mono text-slate-400 uppercase block">Cargo Weight</span>
                    <strong className="text-xs font-mono text-slate-800">{packageMetrics.totalWeight} kg</strong>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-slate-200/50">
                    <span className="text-[8px] font-mono text-slate-400 uppercase block">Distance</span>
                    <strong className="text-xs font-mono text-slate-800">{packageMetrics.distance} miles</strong>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-slate-200/50">
                    <span className="text-[8px] font-mono text-slate-400 uppercase block">Transit Method</span>
                    <strong className="text-xs font-mono text-slate-800 uppercase">{ecoRoute}</strong>
                  </div>
                </div>

                <div className="bg-emerald-950 text-emerald-300 rounded-xl p-3 flex items-center justify-between border border-emerald-900 font-mono">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[8px] text-emerald-400 uppercase tracking-wider block">Estimated Emissions footprint</span>
                    <span className="text-sm font-black text-emerald-400">{packageMetrics.emissions} kg CO₂</span>
                  </div>
                  <span className="text-[8.5px] font-sans text-emerald-200 leading-tight max-w-[150px] text-right">
                    Equivalent to planting {Math.max(1, Math.round(packageMetrics.emissions * 0.05))} saplings.
                  </span>
                </div>
              </div>

              {/* 63. MINIMALIST ECO-PACKAGING TOGGLE */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ecoPackagingToggle}
                    onChange={(e) => setEcoPackagingToggle(e.target.checked)}
                    className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                      <span>63. Minimalist Eco-Packaging</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                        -$1.50 Eco Credit
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 leading-normal block mt-0.5">
                      Opt-out of retail presentation boxes, varnished color branding, and unnecessary print materials. Cargo ships securely in raw, high-density unbleached 100% compostable protective wrapping.
                    </span>
                  </div>
                </label>

                {ecoPackagingToggle && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-emerald-50 border border-emerald-150 rounded-xl p-2.5 text-[9.5px] text-emerald-800 font-mono flex items-center gap-2"
                  >
                    <span>🍃</span>
                    <span><strong>Active Offset:</strong> -1.5kg cardboard paper discarded. Transaction balance credited -$1.50.</span>
                  </motion.div>
                )}
              </div>

              {/* 65. LOCALIZED HUB COLLECTION MULTIPLIERS */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">65. Delivery Destination Vector</span>
                  <span className="text-[10px] text-slate-400 leading-normal">
                    Fulfill to your home address or pick up from a neighborhood hub to reduce delivery vehicle emissions and earn store credit.
                  </span>
                </div>

                <div className="grid gap-2 text-xs">
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    deliveryChoice === 'home' ? 'border-teal-500 bg-teal-50/5' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="deliveryChoice"
                        checked={deliveryChoice === 'home'}
                        onChange={() => setDeliveryChoice('home')}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <div className="text-left">
                        <span className="font-bold block text-slate-800">Direct Home Delivery</span>
                        <span className="text-[9px] text-slate-400">Courier drops parcel at your shipping address.</span>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    deliveryChoice === 'hub' ? 'border-teal-500 bg-teal-50/5' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="deliveryChoice"
                        checked={deliveryChoice === 'hub'}
                        onChange={() => setDeliveryChoice('hub')}
                        className="mt-0.5 h-4 w-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <div className="text-left">
                        <span className="font-bold block text-slate-800 flex items-center gap-1.5">
                          <span>Decentralized Neighborhood Locker Hub</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.2 rounded uppercase font-mono">
                            +$5.00 Bonus Credit
                          </span>
                        </span>
                        <span className="text-[9px] text-slate-400">Opt-in to pick up and trigger collection multipliers on your loyalty ledger!</span>
                      </div>
                    </div>
                  </label>
                </div>

                {deliveryChoice === 'hub' && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-2.5 text-left"
                  >
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Select locker hub location:</label>
                    <div className="grid gap-2 text-left">
                      {lockerHubs.map((hub) => {
                        const isSelected = selectedLockerHub === hub.id;
                        return (
                          <div
                            key={hub.id}
                            onClick={() => setSelectedLockerHub(hub.id)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition-all ${
                              isSelected ? 'bg-white border-teal-500 shadow-2xs' : 'bg-slate-100/50 border-slate-150 hover:bg-slate-100'
                            }`}
                          >
                            <div className="text-left">
                              <span className="font-bold block text-slate-800">{hub.name}</span>
                              <span className="text-[9px] font-mono text-slate-400">Distance: {hub.distance}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-600">
                              +${hub.bonusCredits.toFixed(2)} Credit
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-slate-400 leading-normal pt-1 font-mono">
                      🔒 pickup token will be generated inside your profile view once transaction completes.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* 69. PRODUCT-TO-DONATION DIRECT PORTALS */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">69. Product-to-Donation Direct Portal</span>
                    <span className="text-[10px] text-slate-400 leading-normal">
                      Vetted atmospheric capture and marine cleaning NGOs. Directly allocate transaction proceeds on checkout.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={roundUpDonation}
                    onChange={(e) => setRoundUpDonation(e.target.checked)}
                    className="accent-teal-600 h-4.5 w-4.5 cursor-pointer"
                  />
                </div>

                {roundUpDonation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-3.5 text-left"
                  >
                    {/* Mode Tabs */}
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 rounded-lg text-center text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setDonationPortalMode('round_up')}
                        className={`rounded py-1 transition-all cursor-pointer ${
                          donationPortalMode === 'round_up' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400'
                        }`}
                      >
                        Round-Up Total
                      </button>
                      <button
                        type="button"
                        onClick={() => setDonationPortalMode('percentage')}
                        className={`rounded py-1 transition-all cursor-pointer ${
                          donationPortalMode === 'percentage' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400'
                        }`}
                      >
                        Transaction Split %
                      </button>
                    </div>

                    {donationPortalMode === 'percentage' && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-slate-400 uppercase block">Percentage allocation:</label>
                        <div className="flex gap-1.5">
                          {[1, 3, 5, 10].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setDonationPercentage(pct)}
                              className={`flex-1 rounded-lg py-1 text-xs font-mono font-bold border transition-all cursor-pointer ${
                                donationPercentage === pct
                                  ? 'bg-teal-600 border-teal-600 text-white'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NGO Selector */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] font-mono text-slate-400 uppercase block">Vetted Restoration Partner:</label>
                      <select
                        value={selectedNGO}
                        onChange={(e) => setSelectedNGO(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none cursor-pointer"
                      >
                        {ngoCatalog.map((ngo) => (
                          <option key={ngo.id} value={ngo.id}>
                            {ngo.name}
                          </option>
                        ))}
                      </select>
                      
                      <div className="bg-emerald-50 text-emerald-800 rounded-lg p-2.5 border border-emerald-100 text-[10px] leading-relaxed">
                        <strong className="block text-emerald-950 font-bold mb-0.5 text-left">NGO Mission Objective:</strong>
                        {ngoCatalog.find((ngo) => ngo.id === selectedNGO)?.mission}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 border border-slate-150 flex justify-between items-center font-mono">
                      <span className="text-[9px] text-slate-400 uppercase">Allocated Contribution:</span>
                      <strong className="text-sm text-emerald-600 font-bold">${donationAmount.toFixed(2)}</strong>
                    </div>
                  </motion.div>
                )}
              </div>

            </div>

            {/* FEATURE #23 & #27: MICRO-FULFILLMENT HOLD & PREDICTIVE DELAY PANELS */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Feature #23: Hold Registry */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase">Micro-Fulfillment Hold Registry</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={holdInWarehouse}
                    onChange={(e) => setHoldInWarehouse(e.target.checked)}
                    className="accent-teal-600 h-4 w-4 cursor-pointer"
                  />
                </div>

                <p className="text-[10px] text-slate-500 leading-normal">
                  Hold purchased items in our climate-controlled local virtual warehouse for up to 14 days to consolidate with subsequent orders. Reduces carbon packaging waste and delivery costs.
                </p>

                {holdInWarehouse && (
                  <div className="bg-teal-50/30 border border-teal-100 rounded-xl p-3 space-y-3 font-mono text-[10px] text-teal-800">
                    <div className="flex justify-between items-center text-teal-950 font-bold border-b border-teal-100 pb-1">
                      <span>HOLD CONSOLIDATION WINDOW</span>
                      <span className="bg-teal-600 text-white px-1.5 py-0.2 rounded uppercase text-[8px] tracking-wider font-bold animate-pulse">Warehouse Reserved</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Consolidation Duration:</span>
                        <strong className="text-teal-700">{holdDurationDays} Days</strong>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="14"
                        value={holdDurationDays}
                        onChange={(e) => setHoldDurationDays(Number(e.target.value))}
                        className="w-full accent-teal-600 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                      />
                    </div>
                    <p className="text-[8.5px] text-slate-400 font-sans leading-relaxed pt-1">
                      Your items will be securely held in Warehouse Staging Slot #{Math.floor(1000 + Math.random() * 9000)}. Logistics dispatch will combine this order with future checkouts before the strict 14-day limit.
                    </p>
                  </div>
                )}
              </div>

              {/* Feature #27: Predictive Shipping Delay Forecast */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 font-bold text-slate-800 text-xs uppercase">
                  <Activity className="h-4 w-4 text-rose-500" />
                  <span>Logistics Telemetry Predictor</span>
                </div>

                <p className="text-[10px] text-slate-500 leading-normal">
                  Predictive route modeling estimates transport speed against route variables like magnetosphere radiation, solar wind storms, and ground shipping traffic.
                </p>

                <div className="bg-slate-50 rounded-xl p-3 font-mono text-[9.5px] space-y-2 border border-slate-100 text-slate-600">
                  <div className="flex justify-between">
                    <span>Route Traffic Load:</span>
                    <strong className="text-slate-800">{delayForecast.routeCongestionPct}% Capacity</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Space Congestion Index:</span>
                    <strong className="text-slate-800">{delayForecast.asteroidRisk}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Atmospheric Radiation:</span>
                    <strong className={delayForecast.solarCongestion.includes('IMPACT') ? 'text-amber-600 font-bold' : 'text-teal-600'}>
                      {delayForecast.solarCongestion}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-800 border-t border-slate-200/50 pt-1.5 mt-1">
                    <span>Predictive Transit Time:</span>
                    <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-mono">
                      {delayForecast.days} Transit Days
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={ecoRouteBuffer}
                      onChange={(e) => setEcoRouteBuffer(e.target.checked)}
                      className="accent-teal-600 h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>Opt-In Eco-Route Buffer Offset</span>
                  </label>
                  {ecoRouteBuffer && (
                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono border border-emerald-200">
                      -{delayForecast.environmentalSavings}kg CO₂
                    </span>
                  )}
                </div>
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

                {/* FEATURE #25: FRACTIONAL INVOICING FOR SHARED BUSINESS ACCOUNTS */}
                <div className="sm:col-span-3 border-t border-slate-100 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fractionalInvoicingEnabled}
                        onChange={(e) => setFractionalInvoicingEnabled(e.target.checked)}
                        className="accent-teal-600 h-4 w-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                        <span>Fractional Business Ledger Invoicing</span>
                        <span className="bg-teal-100 text-teal-800 text-[8px] font-bold px-1.5 py-0.2 rounded uppercase">Corporate</span>
                      </span>
                    </label>
                  </div>

                  {fractionalInvoicingEnabled && (
                    <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3.5 space-y-3 font-mono text-[10px] text-slate-700">
                      <div className="flex justify-between items-center text-slate-900 font-bold border-b border-slate-200 pb-1.5">
                        <span>COST-CENTER SPLIT RATIOS</span>
                        {Object.values(fractionalShares).reduce((a, b) => a + b, 0) === 100 ? (
                          <span className="text-emerald-600 font-bold text-[9px] flex items-center gap-1">✓ LEDGER ALLOCATED (100%)</span>
                        ) : (
                          <span className="text-red-500 font-bold text-[9px]">⚠️ RATIOS MUST EQUAL 100% (CURRENT: {Object.values(fractionalShares).reduce((a, b) => a + b, 0)}%)</span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(fractionalShares).map(([dept, share]) => {
                          const sharedTotal = (totalAmount * (share / 100)).toFixed(2);
                          return (
                            <div key={dept} className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200/55 shadow-xs">
                              <span className="text-[8.5px] font-bold text-slate-500 uppercase block tracking-tight truncate" title={dept}>
                                {dept}
                              </span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={share}
                                  onChange={(e) => {
                                    const val = Math.max(0, Math.min(100, Number(e.target.value)));
                                    setFractionalShares({
                                      ...fractionalShares,
                                      [dept]: val
                                    });
                                  }}
                                  className="w-12 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-800 text-xs font-bold text-center"
                                />
                                <span className="text-slate-500">%</span>
                              </div>
                              <div className="text-[10px] font-bold text-teal-600 mt-1">
                                ${sharedTotal}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-[8.5px] text-slate-400 font-sans leading-relaxed pt-1">
                        Corporate gateway will automatically distribute matching debit tokens to respective department ledgers. fractional balances are logged separately on the master billing registry.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BATCH 8: SMART SAVE & PRIVACY CONTROLS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-left">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛡️</span>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Smart Save & Privacy Controls</h3>
                </div>
                <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase">
                  Smart Save Active
                </span>
              </div>

              {/* Smart Save (Basket stays saved on any device) */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 space-y-3 font-mono text-xs border border-slate-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="animate-ping h-2 w-2 rounded-full bg-rose-500 block"></span>
                    <span className="font-bold text-rose-400">Smart Save (Basket holds your items!)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Smart Holding Timer</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-slate-400">Hold Timer:</span>
                  <span className="text-xl font-black text-rose-400">
                    {Math.floor(cartGcTimer / 60)}m {cartGcTimer % 60}s
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 transition-all duration-1000" 
                    style={{ width: `${(cartGcTimer / 600) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between gap-2 pt-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setCartGcTimer((prev) => Math.min(600, prev + 600));
                      setGcExtendedMessage('Hold timer extended! Your items are safe.');
                      setTimeout(() => setGcExtendedMessage(null), 3000);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 py-1.5 rounded font-bold cursor-pointer transition-colors"
                  >
                    🔄 Keep Saved Longer (+10m)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Instantly recycle
                      cart.forEach(item => onRemoveFromCart(item.productId));
                      setCartGcTimer(600);
                    }}
                    className="flex-1 bg-rose-950 hover:bg-rose-900 text-rose-300 py-1.5 rounded font-bold cursor-pointer transition-colors"
                  >
                    🧹 Empty Basket Now
                  </button>
                </div>
                {gcExtendedMessage && (
                  <p className="text-[9px] text-emerald-400 text-center">{gcExtendedMessage}</p>
                )}
                <p className="text-[9px] text-slate-500 leading-normal">
                  With our Smart Save feature, your shopping cart stays safely saved across any device. You won't lose your items even if you close the tab!
                </p>
              </div>

              {/* 74. DEVICE SESSION FINGERPRINT VERIFICATION & 73. HARDWARE MFA */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">74. Device Session Fingerprint</span>
                    <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                      Continuously evaluates browser entropy, geographic speed-of-light hops, and localized IP blocks.
                    </p>
                  </div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs border ${
                    sessionAnomalyActive ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-indigo-50 border-indigo-150 text-indigo-600'
                  }`}>
                    📡
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200/50">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block uppercase">Client Location</span>
                    <strong className={sessionAnomalyActive ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {simulatedDeviceCity}, {simulatedDeviceCountry}
                    </strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block uppercase">Device IPv4</span>
                    <strong className="text-slate-800">{simulatedDeviceIP}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block uppercase">Threat Score</span>
                    <strong className={sessionAnomalyActive ? 'text-rose-600 font-black' : 'text-emerald-600 font-bold'}>
                      {sessionAnomalyActive ? 'HIGH RISK (12%)' : 'SECURE (98%)'}
                    </strong>
                  </div>
                </div>

                {sessionAnomalyActive ? (
                  <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-[10px] text-rose-700 space-y-2 leading-relaxed">
                    <p className="font-bold flex items-center gap-1">
                      <span>⚠️ BLOCKING SECURITY THREAT ENFORCED</span>
                    </p>
                    <p>
                      Automated Shield: Sudden geohop detected from Seattle US to Tokyo JP. Hardware Multi-Factor Authentication is MANDATORY to bypass this transactional lockout block.
                    </p>
                    <div className="flex gap-2">
                      {mfaVerified ? (
                        <div className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5">
                          ✓ FIDO2 Hardware Key Authenticated
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={mfaSimulating}
                          onClick={() => {
                            setMfaSimulating(true);
                            setMfaError(null);
                            setTimeout(() => {
                              setMfaSimulating(false);
                              setMfaVerified(true);
                              // Log FIDO2 success to security ledger
                              const logs = (() => {
                                const stored = localStorage.getItem('nexus_bazaar_security_ledger');
                                return stored ? JSON.parse(stored) : [];
                              })();
                              logs.unshift({
                                id: `sec_${Date.now()}`,
                                timestamp: new Date().toISOString(),
                                level: 'SECURE',
                                source: 'MFA_LOCK',
                                message: `Hardware FIDO2 WebAuthn handshake succeeded for user ${currentUser.name}. Geohop threat bypassed.`,
                                hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
                              });
                              localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));
                            }, 1500);
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-md font-bold cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          {mfaSimulating ? '🗝️ Touch Security Key...' : '🗝️ Authenticate via FIDO2 Key'}
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => {
                          setSessionAnomalyActive(false);
                          setSimulatedDeviceCountry('US');
                          setSimulatedDeviceCity('Seattle');
                          setSimulatedDeviceIP('192.168.1.104');
                          setMfaVerified(false);
                        }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-md font-bold cursor-pointer transition-all"
                      >
                        Reset Geography
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-400">No telemetry anomalies sighted.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSessionAnomalyActive(true);
                        setSimulatedDeviceCountry('JP');
                        setSimulatedDeviceCity('Tokyo');
                        setSimulatedDeviceIP('118.238.12.89');
                        setMfaVerified(false);
                        // Log suspicious geohop to security ledger
                        const logs = (() => {
                          const stored = localStorage.getItem('nexus_bazaar_security_ledger');
                          return stored ? JSON.parse(stored) : [];
                        })();
                        logs.unshift({
                          id: `sec_${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          level: 'WARN',
                          source: 'SESSION_VERIFY',
                          message: `Sudden geographical switch from US to JP detected within active session. Transaction locked until Hardware MFA validation.`,
                          hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
                        });
                        localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider cursor-pointer font-mono"
                    >
                      ⚡ Test Geohop Anomaly
                    </button>
                  </div>
                )}
              </div>

              {/* 71. ULTRA-PRIVATE SHIPPING LOCK */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">71. Ultra-Private Shipping Lock</span>
                    <span className="text-[10px] text-slate-400 leading-normal">
                      Keeps your delivery address 100% private. Only the final delivery driver can see where your package is going, keeping it safe from hackers!
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={zkAddressVaultEnabled}
                    onChange={(e) => {
                      setZkAddressVaultEnabled(e.target.checked);
                      if (e.target.checked) {
                        // Log address encrypt event
                        const logs = (() => {
                          const stored = localStorage.getItem('nexus_bazaar_security_ledger');
                          return stored ? JSON.parse(stored) : [];
                        })();
                        logs.unshift({
                          id: `sec_${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          level: 'SECURE',
                          source: 'CRYPTO_VAULT',
                          message: `Ultra-Private Shipping Lock enabled. Shipping address encrypted safely.`,
                          hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
                        });
                        localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));
                      }
                    }}
                    className="accent-teal-600 h-4.5 w-4.5 cursor-pointer rounded"
                  />
                </div>

                {zkAddressVaultEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-slate-900 text-teal-400 rounded-xl p-3.5 space-y-3 font-mono text-[9px] border border-slate-800 leading-normal"
                  >
                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                      <span>CLIENT-SIDE ENCRYPTED SHIPPING METRICS</span>
                      <span className="text-teal-400 font-bold">ECC-25519 ACTIVE</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase">Cyphertext Recipient Block:</span>
                      <p className="text-slate-300 break-all bg-black/40 p-2 rounded mt-1 border border-slate-800">
                        {`nexus-zk:A1F97B620CDEE8D3540BAEF1789B10C${fullName ? fullName.toUpperCase().replace(/\s/g, 'X') : 'CLIENT'}XXE2E-ENCRYPTED-DELIVERY-COORDINATES-NEXUSBazaar`}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase">Destination Payload:</span>
                      <p className="text-slate-300 break-all bg-black/40 p-2 rounded mt-1 border border-slate-800 font-mono">
                        {`nexus-zk:8D3F9A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F:${street ? street.toUpperCase().replace(/\s/g, 'X') : 'STREET'}:${city ? city.toUpperCase() : 'CITY'}:${zip}`}
                      </p>
                    </div>
                    <div className="text-[8.5px] text-slate-500 flex items-center gap-1">
                      <span>✓ Private Key kept client-side. Databases see strictly un-scraperable cipher blocks.</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 72. SINGLE-USE DISPOSABLE VIRTUAL CARDS */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">72. Single-Use Disposable Virtual Cards</span>
                    <span className="text-[10px] text-slate-400 leading-normal">
                      Accept isolated burner payment tokens to obscure actual banking metadata from external analytics trackers and third-party ledger scans.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useDisposableVirtualCard}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setUseDisposableVirtualCard(enabled);
                      if (enabled) {
                        // Autofill burner credit card numbers
                        const burnerNum = `4916 88${Math.floor(10 + Math.random() * 89)} ${Math.floor(1000 + Math.random() * 8999)} ${Math.floor(1000 + Math.random() * 8999)}`;
                        const burnerExpiry = '12/28';
                        const burnerCvv = `${Math.floor(100 + Math.random() * 899)}`;
                        setCardNumber(burnerNum);
                        setCardExpiry(burnerExpiry);
                        setCardCvv(burnerCvv);

                        // Save virtual card in localStorage
                        const cards = (() => {
                          const stored = localStorage.getItem('nexus_bazaar_virtual_cards');
                          return stored ? JSON.parse(stored) : [];
                        })();
                        cards.unshift({
                          id: `card_${Date.now()}`,
                          cardNumber: burnerNum,
                          expiry: burnerExpiry,
                          cvv: burnerCvv,
                          spent: false,
                          limit: 500,
                          label: 'Burner Checkout Token'
                        });
                        localStorage.setItem('nexus_bazaar_virtual_cards', JSON.stringify(cards));

                        // Log to security ledger
                        const logs = (() => {
                          const stored = localStorage.getItem('nexus_bazaar_security_ledger');
                          return stored ? JSON.parse(stored) : [];
                        })();
                        logs.unshift({
                          id: `sec_${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          level: 'SECURE',
                          source: 'VIRTUAL_CARDS',
                          message: `Isolated single-use credit token generated to conceal bank route metadata. ID: card_${Date.now()}`,
                          hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
                        });
                        localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));
                      } else {
                        setCardNumber('');
                        setCardExpiry('');
                        setCardCvv('');
                      }
                    }}
                    className="accent-teal-600 h-4.5 w-4.5 cursor-pointer rounded"
                  />
                </div>

                {useDisposableVirtualCard && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-indigo-950 text-indigo-300 rounded-xl p-3.5 space-y-2.5 font-mono text-[9px] border border-indigo-900 leading-normal"
                  >
                    <div className="flex justify-between items-center text-indigo-200 border-b border-indigo-900 pb-1">
                      <span>SECURE DISPOSABLE VIRTUAL CARD ACTIVE</span>
                      <span className="text-emerald-400 font-bold">BURNER_TOKEN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Card Number:</span>
                      <strong className="text-white text-xs">{cardNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Expiry / CVV:</span>
                      <strong className="text-white text-xs">{cardExpiry} / {cardCvv}</strong>
                    </div>
                    <p className="text-[8.5px] text-indigo-400 font-sans leading-relaxed pt-1">
                      This token is tied to a maximum single transaction limit of ${totalAmount}. Once the order completes, this card payload becomes dead, completely masking your actual card routes.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* 75. ANONYMIZED BUYER REVIEW PSEUDONYMS */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">75. Anonymized Buyer Review Pseudonyms</span>
                    <span className="text-[10px] text-slate-400 leading-normal">
                      Apply a secure cryptographic mask over your public profile history. Prevents profiling or harvesting of your order habits by external web scraper bots.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={reviewPseudonymMask}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setReviewPseudonymMask(enabled);
                      localStorage.setItem('nexus_bazaar_buyer_review_pseudonym_mask', String(enabled));
                      
                      // Log to security ledger
                      const logs = (() => {
                        const stored = localStorage.getItem('nexus_bazaar_security_ledger');
                        return stored ? JSON.parse(stored) : [];
                      })();
                      logs.unshift({
                        id: `sec_${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        level: 'INFO',
                        source: 'PRIVACY_HUB',
                        message: `Anonymized Buyer Review Mask toggled to ${enabled ? 'ENABLED' : 'DISABLED'}.`,
                        hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
                      });
                      localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));
                    }}
                    className="accent-teal-600 h-4.5 w-4.5 cursor-pointer rounded"
                  />
                </div>

                {reviewPseudonymMask && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[10px] text-slate-600 font-mono"
                  >
                    <span className="text-[8.5px] font-bold text-slate-400 block uppercase font-mono">Public Identity Mask:</span>
                    <p className="text-slate-800 font-bold mt-1">
                      {currentUser.name} <span className="text-slate-400 font-normal">will be masked as</span> {currentUser.name.slice(0, 2).toUpperCase()}_ZK_MEMBER_{Math.floor(100 + Math.random() * 899)}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* 79. GRANULAR PRIVACY TRACKING TOGGLES */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">79. Granular Privacy Tracking Matrix</span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Customize the behavior of client-side tracking loops in this transaction. Toggle metrics visibility directly.
                </p>
                
                <div className="grid gap-2.5 sm:grid-cols-2 text-[10px] font-mono text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-150">
                    <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
                    <span>Opt-Out Behavioral Maps</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-150">
                    <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
                    <span>Redact Device Entropy</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-150">
                    <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
                    <span>Disable Hotjar Matrix Logs</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-150">
                    <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
                    <span>Force HTTPS TLS 1.3</span>
                  </label>
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
                  {ecoPackagingToggle && (
                    <div className="flex justify-between text-emerald-600 font-medium animate-fade-in">
                      <span>Eco-Packaging Offset</span>
                      <span className="font-mono font-bold">-$1.50</span>
                    </div>
                  )}
                  {roundUpDonation && donationAmount > 0 && (
                    <div className="flex justify-between text-teal-600 font-medium animate-fade-in">
                      <span className="truncate max-w-[150px]">NGO restoration</span>
                      <span className="font-mono font-bold">+${donationAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* 51. Store Credit application checkbox/switch */}
                {storeCredits > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 animate-fade-in text-xs">
                    <label className="flex items-center justify-between font-semibold text-slate-700 cursor-pointer">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={useStoreCredits}
                          onChange={(e) => setUseStoreCredits(e.target.checked)}
                          className="accent-teal-600 h-4 w-4 cursor-pointer"
                        />
                        <span>Apply Store Credits</span>
                      </div>
                      <span className="font-mono font-bold text-teal-600">${storeCredits.toFixed(2)} Available</span>
                    </label>
                    {useStoreCredits && (
                      <div className="flex justify-between text-[11px] text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-100 font-mono font-semibold">
                        <span>Applied Credits:</span>
                        <span>-${appliedCredits.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

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
