/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowLeft, Heart, ShoppingCart, Star, Crown, MessageSquare, HelpCircle,
  Clock, UserCheck, Sparkles, Cpu, Send, Eye, Settings, Sliders, Play, 
  Square, Volume2, Info, GitBranch, GitCommit, GitMerge, AlertTriangle, Disc
} from 'lucide-react';
import { Product, Review, QA, User, UserRole } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailsViewProps {
  product: Product;
  products?: Product[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  currentUser: User;
  reviews: Review[];
  qas: QA[];
  onAddReview: (productId: string, rating: number, title: string, text: string) => void;
  onAddQuestion: (productId: string, question: string) => void;
  onAddAnswer: (qaId: string, answer: string) => void;
  onPlayPodcast?: (product: Product) => void;
  podcastPlaying?: boolean;
}

export default function ProductDetailsView({
  product,
  products = [],
  onBack,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  currentUser,
  reviews,
  qas,
  onAddReview,
  onAddQuestion,
  onAddAnswer,
  onPlayPodcast,
  podcastPlaying = false,
}: ProductDetailsViewProps) {
  // --- BATCH 7: SUSTAINABILITY & CIRCULAR ECONOMY MEMO (Features #64, #66, #67, #68, #70) ---
  const ecoData = React.useMemo(() => {
    return {
      materialLifespan: product.materialDegradationLifespan || "Recyclable circular polymer composites. Housing (300-400 years lifecycle), logic circuit boards (98% certified heavy metals recovery rate).",
      biodegradability: product.biodegradabilityScore || 54,
      recyclingIndex: product.recyclingViabilityIndex || 85,
      isUpcycled: !!product.upcycled,
      upcycledHistory: product.upcycledHistory || "Formed from premium upcycled industrial material offcuts retrieved directly from vetted sustainable component suppliers.",
      repairability: product.repairabilityScore || 7.8,
      spareParts: product.repairSparePartsAvailability || "Official battery packs, screen plates, and frame components stocked in the NexusBazaar parts ledger for rapid courier dispatch.",
      repairTools: product.repairToolAccessibility || "Standard Phillips screwdriver bits and flat spudger. Simple internal clip structures designed with zero permanent epoxy glues.",
      fairTrade: !!product.fairTradeVerified || product.id === 'prod_1' || product.id === 'prod_4' || product.id === 'prod_5',
      fairTradeFactory: product.fairTradeFactory || "Accredited Circular Labor Assembly Co-Op - Subang, West Java",
      fairTradeWage: product.fairTradeWageRating || "Verified pays 1.35x standard regional median living wage, complete air purification venting, and safe shift-limits.",
      fairTradeAudit: product.fairTradeAuditLink || "Fair Labor Association Registry Audit: #FLA-NEXUS-2025"
    };
  }, [product]);

  // --- FEATURE #11: CO-OP POOL BUYING STATES ---
  const [joinedPool, setJoinedPool] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(`nexus_bazaar_pool_${product.id}`);
    return stored === 'true';
  });
  const [poolCount, setPoolCount] = React.useState<number>(() => {
    const hash = product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return (hash % 4) + 2; 
  });
  const [poolTimeLeft, setPoolTimeLeft] = React.useState<number>(82452); 
  const [kvLogs, setKvLogs] = React.useState<string[]>([]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setPoolTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSeconds = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTogglePool = () => {
    const nextJoined = !joinedPool;
    setJoinedPool(nextJoined);
    localStorage.setItem(`nexus_bazaar_pool_${product.id}`, String(nextJoined));
    
    const opId = `kv_op_${Date.now()}`;
    const newLogs = [
      `[KV] ${opId} - SADD pool:active_buyers:${product.id} -> ${currentUser.name}`,
      `[KV] ${opId} - HSET pool:meta:${product.id} buyers_count ${poolCount + (nextJoined ? 1 : 0)}`,
      `[KV] ${opId} - COMMIT SUCCESS (14ms)`
    ];
    setKvLogs(prev => [...newLogs, ...prev].slice(0, 8));
  };

  // --- FEATURE #15: PEER-TO-PEER VERIFIED RESALE STATES ---
  const [resaleListings, setResaleListings] = React.useState<{ id: string; seller: string; condition: string; price: number; orderRef: string }[]>(() => {
    const hash = product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const isEven = hash % 2 === 0;
    if (isEven) {
      return [
        {
          id: `resale_${product.id}_1`,
          seller: 'Alex (Acoustics Expert)',
          condition: 'Mint (Used 2 weeks)',
          price: Math.round(product.price * 0.70),
          orderRef: `ord_orig_9921`
        }
      ];
    }
    return [];
  });

  const handleBuyUsed = (item: any) => {
    const mockUsedProduct: Product = {
      ...product,
      name: `${product.name} (P2P Resale - Verified ${item.condition})`,
      price: item.price,
      stock: 1
    };
    onAddToCart(mockUsedProduct);
    alert(`Success! Added ${mockUsedProduct.name} (Used) to cart.`);
  };

  // --- FEATURE #16: CROWDSOURCED Q&A STREAMS UPVOTE STATES ---
  const [qaUpvotes, setQaUpvotes] = React.useState<Record<string, number>>({});
  const handleUpvoteQa = (qaId: string) => {
    setQaUpvotes(prev => ({
      ...prev,
      [qaId]: (prev[qaId] || 0) + 1
    }));
  };

  // Feature #6: Immersive Editorial Lookbook layout mode toggle
  const [editorialMode, setEditorialMode] = React.useState(false);

  // Specifications Tabs Panel
  // 'parametric' | 'revision' | 'audio' | 'hologram' | 'custom' | 'sku' | 'demo' | 'unboxing' | 'compare' | 'lighting' | 'sustainability'
  const [techTab, setTechTab] = React.useState<'parametric' | 'revision' | 'audio' | 'hologram' | 'custom' | 'sku' | 'demo' | 'unboxing' | 'compare' | 'lighting' | 'sustainability'>('sustainability');

  // --- BATCH 4 PRODUCT DETAILS INTERACTIVE STATES ---
  const [demoVolume, setDemoVolume] = React.useState(50);
  const [demoAncEnabled, setDemoAncEnabled] = React.useState(false);
  const [demoUsbConnected, setDemoUsbConnected] = React.useState(false);
  const [demoBatteryPct, setDemoBatteryPct] = React.useState(62);

  const [unboxedSleeve, setUnboxedSleeve] = React.useState(false);
  const [unboxedLid, setUnboxedLid] = React.useState(false);
  const [unboxedTray, setUnboxedTray] = React.useState(false);

  const [compareSplitX, setCompareSplitX] = React.useState(50);
  const [activeLighting, setActiveLighting] = React.useState<'studio' | 'neon' | 'daylight' | 'stealth'>('studio');

  // --- FEATURE #32: TIME-STAMPED VIDEO REVIEW STATES ---
  const [reviewVideoPlaying, setReviewVideoPlaying] = React.useState(false);
  const [reviewVideoTime, setReviewVideoTime] = React.useState(10);

  // --- FEATURE #21: AUTOREPLENISH PARAMETRIC SUBSCRIPTION STATES ---
  const [purchaseMode, setPurchaseMode] = React.useState<'onetime' | 'replenish'>('onetime');
  const [replenishRate, setReplenishRate] = React.useState<number>(3); // daily cycles
  const [containerCapacity, setContainerCapacity] = React.useState<number>(120); // total capacity / cycles
  const computedDays = React.useMemo(() => {
    return Math.max(5, Math.ceil(containerCapacity / Math.max(1, replenishRate)));
  }, [replenishRate, containerCapacity]);

  // --- FEATURE #24: DYNAMIC PRICE-DROP WAITLISTS ---
  const [targetPrice, setTargetPrice] = React.useState<number>(Math.round(product.price * 0.8));
  const [waitlistDeployed, setWaitlistDeployed] = React.useState<boolean>(false);
  const [waitlistLogs, setWaitlistLogs] = React.useState<string[]>([]);
  const [waitlistSuccess, setWaitlistSuccess] = React.useState<boolean>(false);

  // --- FEATURE #28: DIRECT-TO-MANUFACTURER CUSTOMIZATION ---
  const [mfgAlloy, setMfgAlloy] = React.useState<string>('Grade 5 Titanium');
  const [mfgSolder, setMfgSolder] = React.useState<string>('Sac305 Lead-Free');
  const [mfgFirmware, setMfgFirmware] = React.useState<string>('https://github.com/nexus-bazaar/custom-node.git');
  const [mfgCNCLogs, setMfgCNCLogs] = React.useState<string[]>([]);
  const [mfgCompiled, setMfgCompiled] = React.useState<boolean>(false);

  // --- FEATURE #29: UNIVERSAL SKU MATCHING LEDGER ---
  const [selectedSkuVariant, setSelectedSkuVariant] = React.useState<'branded' | 'white_label'>('branded');

  const handleCompileSpecs = () => {
    setMfgCompiled(true);
    const mockId = Math.floor(Math.random() * 9000 + 1000);
    setMfgCNCLogs([
      `[CNC] G-CODE GENERATOR v4.1 INITIALIZED`,
      `[CNC] CNC MILL LOADED: ALLOY TYPE -> ${mfgAlloy}`,
      `[CNC] SPEED: 18000RPM | FEEDRATE: 1500MM/MIN`,
      `[CNC] G00 X0.00 Y0.00 Z10.00 (SAFE POS)`,
      `[CNC] G01 Z-1.25 F150 (INITIAL PENETRATION)`,
      `[CNC] G02 X22.50 Y10.00 R8.50 F800 (LASER CASING PROFILE CUT)`,
      `[CNC] RE-ZEROING SPINDLE NODES... OK`,
      `[SOLDER] PROFILE CONFIGURED: TEMP_MAX 217°C (LIQUIDUS) [${mfgSolder}]`,
      `[FIRMWARE] PULLING COMMITS FROM ${mfgFirmware}...`,
      `[FIRMWARE] SECURE BOOTLOADER RE-SIGNED & LOADED SUCCESSFULLY`,
      `[LEDGER] SPECIFICATIONS RECORDED ON MFG FLOW RUN #${mockId} EN-ROUTE TO MANUFACTURING LINE!`
    ]);
  };

  const handleAddToCartClick = () => {
    let finalName = displayProductName;
    let finalDesc = displayProductDesc;
    
    if (purchaseMode === 'replenish') {
      finalName = `${displayProductName} (AutoReplenish - Every ${computedDays} Days)`;
      finalDesc = `${displayProductDesc} [AUTOREPLENISH SUBSCRIPTION: Parametric rate of ${replenishRate} cycles/day for a capacity of ${containerCapacity} units]`;
    } else if (mfgCompiled) {
      finalName = `${displayProductName} (Custom Direct Mfg: ${mfgAlloy})`;
      finalDesc = `${displayProductDesc} [DIRECT MFG RUN SPECS: Base Alloy -> ${mfgAlloy}, Solder -> ${mfgSolder}, Firmware URL -> ${mfgFirmware}]`;
    }

    const cartProduct = {
      ...product,
      name: finalName,
      price: finalPrice,
      description: finalDesc,
    };
    onAddToCart(cartProduct);
  };

  // Image Hover Zoom effect
  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties>({ transform: 'scale(1)' });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editorialMode) return; // Keep clean in editorial mode
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.5)',
    });
  };
  const handleMouseLeave = () => {
    setZoomStyle({ transform: 'scale(1)' });
  };

  // Holographic AR Product Preview Sandbox (Feature #20)
  const [holoEnabled, setHoloEnabled] = React.useState(false);
  const [holoColor, setHoloColor] = React.useState<'cyan' | 'amber' | 'emerald'>('cyan');
  const [holoRotSpeed, setHoloRotSpeed] = React.useState(1);
  const [holoBeamDensity, setHoloBeamDensity] = React.useState(2);
  const [holoNoise, setHoloNoise] = React.useState(2);
  const holoCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (!holoEnabled || techTab !== 'hologram') return;
    const canvas = holoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    let animId: number;

    const renderHolo = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Scanlines & Grid background
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 25) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let i = 0; i < h; i += 20) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }

      // Projection Beam Glow
      const beamGrad = ctx.createLinearGradient(cx, h, cx, cy - 10);
      let coreColor = 'rgba(20, 184, 166, '; // cyan/teal
      if (holoColor === 'amber') coreColor = 'rgba(245, 158, 11, ';
      if (holoColor === 'emerald') coreColor = 'rgba(16, 185, 129, ';

      beamGrad.addColorStop(0, `${coreColor}0.02)`);
      beamGrad.addColorStop(0.5, `${coreColor}0.06)`);
      beamGrad.addColorStop(1, `${coreColor}0.15)`);
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 80, h);
      ctx.lineTo(cx + 80, h);
      ctx.lineTo(cx + 120, cy - 30);
      ctx.lineTo(cx - 120, cy - 30);
      ctx.closePath();
      ctx.fill();

      // Draw particle dust streams
      ctx.fillStyle = `${coreColor}0.4)`;
      for (let p = 0; p < holoBeamDensity * 4; p++) {
        const px = cx + Math.sin(p * 23.4 + angle) * 70;
        const py = (h - ((angle * 12 + p * 35) % h));
        ctx.fillRect(px, py, 1.5, 1.5);
      }

      // Draw Rotating 3D Wireframe depending on product category/type
      ctx.strokeStyle = `${coreColor}0.85)`;
      ctx.lineWidth = 1.5;

      const scale = 50;
      const pts: [number, number, number][] = [];

      // Generate geometric shapes based on categories
      const isSquare = product.category === 'Workspace';
      const isSphere = product.category === 'Electronics' || product.category === 'Wearables';

      if (isSquare) {
        // Wireframe Cube/Monitor Box
        const d = 0.8;
        const cpts: [number, number, number][] = [
          [-d, -d, -d], [d, -d, -d], [d, d, -d], [-d, d, -d],
          [-d, -d, d], [d, -d, d], [d, d, d], [-d, d, d],
        ];
        cpts.forEach(([ex, ey, ez]) => {
          const radY = angle;
          const radX = 0.4;
          let x1 = ex * Math.cos(radY) - ez * Math.sin(radY);
          let z1 = ex * Math.sin(radY) + ez * Math.cos(radY);
          let y2 = ey * Math.cos(radX) - z1 * Math.sin(radX);
          let z2 = ey * Math.sin(radX) + z1 * Math.cos(radX);
          pts.push([x1, y2, z2]);
        });

        const edges = [
          [0,1], [1,2], [2,3], [3,0],
          [4,5], [5,6], [6,7], [7,4],
          [0,4], [1,5], [2,6], [3,7]
        ];
        edges.forEach(([u, v]) => {
          ctx.beginPath();
          ctx.moveTo(cx + pts[u][0] * scale, cy + pts[u][1] * scale);
          ctx.lineTo(cx + pts[v][0] * scale, cy + pts[v][1] * scale);
          ctx.stroke();
        });
      } else if (isSphere) {
        // Futuristic sphere/gyroscope rings
        const steps = 16;
        for (let r = 0; r < 3; r++) {
          ctx.beginPath();
          const radOffset = r * Math.PI / 3;
          for (let s = 0; s <= steps; s++) {
            const stepAng = (s / steps) * Math.PI * 2;
            let ex = Math.cos(stepAng);
            let ey = Math.sin(stepAng) * Math.cos(radOffset);
            let ez = Math.sin(stepAng) * Math.sin(radOffset);

            const radY = angle * (1 + r * 0.2);
            let x1 = ex * Math.cos(radY) - ez * Math.sin(radY);

            const screenX = cx + x1 * scale * 1.1;
            const screenY = cy + ey * scale * 1.1;
            if (s === 0) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          }
          ctx.stroke();
        }
      } else {
        // Pyramid crystal shape
        const d = 1.0;
        const pyrPts: [number, number, number][] = [
          [0, -d, 0], // apex
          [-d, d, -d], [d, d, -d], [d, d, d], [-d, d, d] // base
        ];
        pyrPts.forEach(([ex, ey, ez]) => {
          const radY = angle;
          let x1 = ex * Math.cos(radY) - ez * Math.sin(radY);
          let z1 = ex * Math.sin(radY) + ez * Math.cos(radY);
          pts.push([x1, ey, z1]);
        });

        const edges = [
          [0, 1], [0, 2], [0, 3], [0, 4],
          [1, 2], [2, 3], [3, 4], [4, 1]
        ];
        edges.forEach(([u, v]) => {
          ctx.beginPath();
          ctx.moveTo(cx + pts[u][0] * scale, cy + pts[u][1] * scale);
          ctx.lineTo(cx + pts[v][0] * scale, cy + pts[v][1] * scale);
          ctx.stroke();
        });
      }

      // Scanline static overlay
      if (holoNoise > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.02 * holoNoise})`;
        for (let i = 0; i < h; i += 4) {
          if (Math.random() > 0.5) {
            ctx.fillRect(0, i, w, 1);
          }
        }
      }

      // Core anchor circle
      ctx.strokeStyle = `${coreColor}0.1)`;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 1.3, 0, Math.PI * 2);
      ctx.stroke();

      angle += 0.012 * holoRotSpeed;
      animId = requestAnimationFrame(renderHolo);
    };

    renderHolo();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [holoEnabled, holoColor, holoRotSpeed, holoBeamDensity, holoNoise, techTab]);

  // ---------------------------------------------------------------------------
  // FEATURE #2: DYNAMIC PARAMETRIC SIZING MATRIX
  // ---------------------------------------------------------------------------
  // Range states change depending on category
  const isWearableCategory = product.category === 'Wearables' || product.category === 'Accessories';
  const [param1, setParam1] = React.useState(isWearableCategory ? 38 : 75); // Wrist circumference (mm) or Desk depth (cm)
  const [param2, setParam2] = React.useState(isWearableCategory ? 190 : 160); // Strap length (mm) or Desk width (cm)
  const parametricCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Compute ergonomic alignment ratio
  const parametricFitRatio = React.useMemo(() => {
    if (isWearableCategory) {
      // Optimal wrist for watch (38mm size) is around 170mm wrist, optimal strap is 185mm
      const wristDev = Math.abs(param1 - 38);
      const strapDev = Math.abs(param2 - 190);
      return Math.max(50, Math.round(100 - (wristDev * 0.5) - (strapDev * 0.3)));
    } else {
      // Workspace: monitor needs depth >= 60cm, width >= 120cm
      const depthShortfall = Math.max(0, 65 - param1);
      const widthShortfall = Math.max(0, 110 - param2);
      return Math.max(40, Math.round(100 - (depthShortfall * 1.5) - (widthShortfall * 0.8)));
    }
  }, [param1, param2, isWearableCategory]);

  React.useEffect(() => {
    if (techTab !== 'parametric') return;
    const canvas = parametricCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Draw blueprint graph mesh
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 15) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 15) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    if (isWearableCategory) {
      // Draw wrist/strap schematic
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, 45 + (param1 * 0.15), 0, Math.PI * 2); // Wrist ellipse
      ctx.stroke();

      // Draw watch body strap wrap
      ctx.strokeStyle = parametricFitRatio > 85 ? '#14b8a6' : '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 48 + (param2 * 0.1), -Math.PI / 1.5, Math.PI / 1.5);
      ctx.stroke();

      // Core anchor watch block
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 15, cy - 20, 30, 40);
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 15, cy - 20, 30, 40);
    } else {
      // Draw Desk surface bounding layout
      ctx.fillStyle = 'rgba(100, 116, 139, 0.1)';
      const deskW = param2 * 1.1;
      const deskH = param1 * 1.1;
      ctx.fillRect(cx - deskW/2, cy - deskH/2, deskW, deskH);
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.strokeRect(cx - deskW/2, cy - deskH/2, deskW, deskH);

      // Draw item footprint footprint (e.g. keycraft or ultrawide)
      const itemW = product.id === 'prod_3' ? 140 : 60; // Curved monitor wide footprint
      const itemH = 30;
      ctx.fillStyle = 'rgba(20, 184, 166, 0.2)';
      ctx.fillRect(cx - itemW/2, cy - itemH/2, itemW, itemH);
      
      ctx.strokeStyle = parametricFitRatio > 85 ? '#14b8a6' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - itemW/2, cy - itemH/2, itemW, itemH);
    }
  }, [param1, param2, techTab, isWearableCategory, parametricFitRatio, product.id]);

  // ---------------------------------------------------------------------------
  // FEATURE #4: CHRONOLOGICAL HARDWARE VERSIONING CONTROL
  // ---------------------------------------------------------------------------
  // Git branch nodes list
  const revisionNodes = [
    { id: 'v1.0.0-beta', tag: 'REV-1.0', title: 'Baseline Concept Board', desc: 'FR4 substrate layout, dual-layer traces, legacy firmware bootloader. Low-speed polling rate.', date: 'Dec 12, 2025', author: 'Systems Lead <design@nexusbazaar.com>' },
    { id: 'v1.1.0-rev2', tag: 'REV-1.5', title: 'Acoustic Capacitive Buffering', desc: 'Upgraded gold capacitors, added acoustic dampening silicon liners. Mitigated ripple resonance.', date: 'Feb 05, 2026', author: 'Acoustic Eng <systems@nexusbazaar.com>' },
    { id: 'v2.0.0-rc1', tag: 'ACTIVE', title: 'Production Ship Core', desc: 'Aerospace grade titanium structure, low-latency firmware v1.4.2 pre-loaded. Perfect mechanical clearance.', date: 'May 10, 2026', author: 'Manufacturing Lead <production@nexusbazaar.com>' },
    { id: 'v2.1.0-nightly', tag: 'EXPERIMENTAL', title: 'Developer active Overclock', desc: 'Beta branch enabling 8000Hz polling rate and active telemetry reporting streams. Requires self-flash.', date: 'July 01, 2026', author: 'DevOps Lead <beta@nexusbazaar.com>' }
  ];
  const [activeRevNode, setActiveRevNode] = React.useState('v2.0.0-rc1');
  const selectedRevision = revisionNodes.find((r) => r.id === activeRevNode) || revisionNodes[2];

  // ---------------------------------------------------------------------------
  // FEATURE #9: SPATIAL AUDIO EQUIPMENT DEMO SIMULATOR (WEB AUDIO API)
  // ---------------------------------------------------------------------------
  const [audioPlaying, setAudioPlaying] = React.useState(false);
  const [audioDistance, setAudioDistance] = React.useState(35);
  const [audioAbsorption, setAudioAbsorption] = React.useState(40);
  const [audioDelay, setAudioDelay] = React.useState(25);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const oscNodesRef = React.useRef<OscillatorNode[]>([]);
  const filterNodeRef = React.useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = React.useRef<GainNode | null>(null);
  const delayNodeRef = React.useRef<DelayNode | null>(null);
  const delayGainRef = React.useRef<GainNode | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const audioCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Manage Web Audio API instantiations
  React.useEffect(() => {
    return () => {
      // Cleanup audio nodes on unmount
      cleanupSynth();
    };
  }, []);

  const cleanupSynth = () => {
    oscNodesRef.current.forEach((osc) => {
      try { osc.stop(); } catch(e){}
    });
    oscNodesRef.current = [];
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch(e){}
      audioContextRef.current = null;
    }
    setAudioPlaying(false);
  };

  const handleToggleAudioSim = async () => {
    if (audioPlaying) {
      cleanupSynth();
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        alert('Web Audio API not supported on this device.');
        return;
      }
      
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Create Analyser for waveform feedback
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Polyphonic warm pad (Major chord based on A)
      const baseFreq = product.id === 'prod_1' ? 220 : 110; // High headphones frequency or deeper monitor rumble
      const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 1.875];
      
      const oscillators = freqs.map((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        return osc;
      });
      oscNodesRef.current = oscillators;

      // Lowpass Filter simulating air absorption / wall material
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(10000 - (audioAbsorption * 90), ctx.currentTime);
      filterNodeRef.current = filter;

      // Feedback Echo Delay Loop
      const delay = ctx.createDelay();
      delay.delayTime.setValueAtTime((audioDelay / 100) * 0.8, ctx.currentTime);
      delayNodeRef.current = delay;

      const delayGain = ctx.createGain();
      delayGain.gain.setValueAtTime(0.4, ctx.currentTime);
      delayGainRef.current = delayGain;

      // Master output attenuator linked to Distance
      const gainNode = ctx.createGain();
      const distanceFactor = Math.max(0.01, 1 - (audioDistance / 100));
      gainNode.gain.setValueAtTime(distanceFactor * 0.12, ctx.currentTime);
      gainNodeRef.current = gainNode;

      // Wire connections path
      oscillators.forEach((osc) => osc.connect(filter));
      filter.connect(gainNode);

      // Delay feedback loop
      gainNode.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(gainNode);

      gainNode.connect(analyser);
      analyser.connect(ctx.destination);

      oscillators.forEach((osc) => osc.start());
      setAudioPlaying(true);
    } catch (err) {
      console.error('Audio node routing failed', err);
    }
  };

  // Adjust parameters on active audio graph in real-time
  React.useEffect(() => {
    if (!audioPlaying) return;
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (filterNodeRef.current) {
      const freq = Math.max(100, 10000 - (audioAbsorption * 90));
      filterNodeRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
    }
    if (gainNodeRef.current) {
      const atten = Math.max(0.005, 1 - (audioDistance / 100));
      gainNodeRef.current.gain.setTargetAtTime(atten * 0.12, ctx.currentTime, 0.1);
    }
    if (delayNodeRef.current) {
      const delayTime = Math.max(0, (audioDelay / 100) * 0.8);
      delayNodeRef.current.delayTime.setTargetAtTime(delayTime, ctx.currentTime, 0.2);
    }
  }, [audioDistance, audioAbsorption, audioDelay, audioPlaying]);

  // Oscilloscope drawing animation loop
  React.useEffect(() => {
    if (!audioPlaying || techTab !== 'audio') return;
    const canvas = audioCanvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const drawOscilloscope = () => {
      const w = canvas.width;
      const h = canvas.height;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#14b8a6'; // teal wave
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      const sliceWidth = w / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      // Bounding acoustics frame
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.08)';
      ctx.strokeRect(4, 4, w - 8, h - 8);

      animId = requestAnimationFrame(drawOscilloscope);
    };

    drawOscilloscope();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [audioPlaying, techTab]);

  // ---------------------------------------------------------------------------
  // ORIGINAL PERSISTED STATE HOOKS (Reviews, Bidding, sentiment etc.)
  // ---------------------------------------------------------------------------
  // Live Counter-Offer Bidding Bartering Engine
  const [userBid, setUserBid] = React.useState<string>('');
  const [biddingMessages, setBiddingMessages] = React.useState<{ sender: 'merchant' | 'user'; text: string; time: string }[]>([
    { sender: 'merchant', text: `Greetings Pathfinder. Our current listing rate for this gear is $${product.price} credits. Would you like to offer a custom credit bid?`, time: '12:00' }
  ]);
  const [bidStatus, setBidStatus] = React.useState<'idle' | 'rejected' | 'negotiating' | 'accepted'>('idle');
  const [negotiatedPrice, setNegotiatedPrice] = React.useState<number | null>(null);
  const [forgedVoucherCode, setForgedVoucherCode] = React.useState<string | null>(null);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    const bidValue = Math.round(parseFloat(userBid));
    if (isNaN(bidValue) || bidValue <= 0) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nextMsgs = [...biddingMessages, { sender: 'user' as const, text: `I offer $${bidValue} credits.`, time: timeString }];
    setBiddingMessages(nextMsgs);
    setUserBid('');

    setTimeout(() => {
      const ratio = bidValue / product.price;
      let replyText = '';
      if (ratio < 0.65) {
        replyText = `Friction detected. $${bidValue} credits is below our regional logistics clearance threshold. Request denied. Please raise your bid above 70% of list rate.`;
        setBidStatus('rejected');
      } else if (ratio >= 0.65 && ratio < 0.88) {
        const counterVal = Math.round(product.price * 0.88);
        replyText = `We appreciate your merchant spirit. However, we cannot authorize such a low rate. We can meet you at $${counterVal} credits as an ultimate settlement rate. Submit that rate to unlock!`;
        setBidStatus('negotiating');
        setNegotiatedPrice(counterVal);
      } else {
        replyText = `Offer approved! $${bidValue} is within our legal dispatch parameters. We have forged an exclusive, temporary promo voucher for you. Type it in checkout to claim this rate!`;
        setBidStatus('accepted');
        setNegotiatedPrice(bidValue);

        // Forge the custom promo code in local db state
        const customCode = `BID_${product.id.substring(5).toUpperCase()}_${Math.floor(10 + Math.random() * 90)}`;
        const discountPercent = Math.round(((product.price - bidValue) / product.price) * 100);
        
        try {
          const stored = localStorage.getItem('nexus_bazaar_simulated_db');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (!parsed.promoCodes.find((p: any) => p.code === customCode)) {
              parsed.promoCodes.push({
                code: customCode,
                discountPercent,
                description: `Haggled offer for ${product.name} (Save ${discountPercent}%)`,
                requiresElite: false
              });
              localStorage.setItem('nexus_bazaar_simulated_db', JSON.stringify(parsed));
            }
          }
          setForgedVoucherCode(customCode);
        } catch (err) {
          console.error("Bidding db sync failed", err);
        }
      }
      setBiddingMessages((prev) => [...prev, { sender: 'merchant' as const, text: replyText, time: timeString }]);
    }, 1000);
  };

  // Add Review Form state
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewTitle, setReviewTitle] = React.useState('');
  const [reviewText, setReviewText] = React.useState('');
  const [reviewSuccess, setReviewSuccess] = React.useState(false);

  // Real-time sentiment keyword tagger (Feature #14)
  const computedSentiment = React.useMemo(() => {
    if (!reviewText.trim()) return null;
    const lower = reviewText.toLowerCase();
    const positiveWords = ['excellent', 'love', 'amazing', 'great', 'perfect', 'good', 'best', 'superb', 'delightful', 'gorgeous', 'bliss', 'magical', 'flawless', 'curated'];
    const negativeWords = ['bad', 'worst', 'hate', 'issue', 'poor', 'broken', 'disappointing', 'tight', 'heavy', 'stiff', 'sad', 'muddy', 'clunky', 'annoying'];
    
    const posCount = positiveWords.filter(w => lower.includes(w)).length;
    const negCount = negativeWords.filter(w => lower.includes(w)).length;
    
    if (posCount > negCount) {
      return { label: 'Audit Result: Product Praise (Positive Sentiment)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    } else if (negCount > posCount) {
      return { label: 'Audit Result: Critical Friction (Negative Sentiment)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    } else {
      return { label: 'Audit Result: Neutral Balance (Neutral/Objective)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  }, [reviewText]);

  // Add Question state
  const [questionText, setQuestionText] = React.useState('');
  const [questionSuccess, setQuestionSuccess] = React.useState(false);

  // QA Answer boxes states
  const [answerTexts, setAnswerTexts] = React.useState<Record<string, string>>({});

  // Review star filter & Q&A search query
  const [selectedStarFilter, setSelectedStarFilter] = React.useState<number | null>(null);
  const [qaSearchQuery, setQaSearchQuery] = React.useState('');

  const [bountyClaimed, setBountyClaimed] = React.useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewText.trim()) return;

    // Check if high-effort review for bounty (Feature 60)
    const isHighEffort = reviewText.trim().length >= 40;
    if (isHighEffort) {
      // 1. Grant $15.00 credits
      const storedCredits = localStorage.getItem('nexus_bazaar_store_credit');
      const currentCredits = storedCredits ? parseFloat(storedCredits) : 25.00;
      const nextCredits = currentCredits + 15.00;
      localStorage.setItem('nexus_bazaar_store_credit', nextCredits.toFixed(2));

      // 2. Add transaction history record
      const storedTx = localStorage.getItem('nexus_bazaar_loyalty_ledger');
      const txHistory = storedTx ? JSON.parse(storedTx) : [];
      const newTx = {
        id: `tx_bounty_${Date.now()}`,
        type: 'earn',
        amount: 15.00,
        description: `Claimed Review Bounty for ${product.name}`,
        date: new Date().toISOString().split('T')[0]
      };
      txHistory.unshift(newTx);
      localStorage.setItem('nexus_bazaar_loyalty_ledger', JSON.stringify(txHistory));

      // 3. Grant a Badge (Feature 55)
      const storedBadges = localStorage.getItem('nexus_bazaar_badges');
      let badgesList: string[] = storedBadges ? JSON.parse(storedBadges) : [];
      if (!badgesList.includes('audiophile_veteran')) {
        badgesList.push('audiophile_veteran');
        localStorage.setItem('nexus_bazaar_badges', JSON.stringify(badgesList));
      }

      setBountyClaimed(true);
      setTimeout(() => setBountyClaimed(false), 5000);
    }

    onAddReview(product.id, reviewRating, reviewTitle, reviewText);
    setReviewTitle('');
    setReviewText('');
    setReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    onAddQuestion(product.id, questionText);
    setQuestionText('');
    setQuestionSuccess(true);
    setTimeout(() => setQuestionSuccess(false), 3000);
  };

  const handleAnswerSubmit = (qaId: string) => {
    const txt = answerTexts[qaId];
    if (!txt || !txt.trim()) return;
    onAddAnswer(qaId, txt);
    setAnswerTexts({ ...answerTexts, [qaId]: '' });
  };

  // Filter lists
  const rawProductReviews = reviews.filter((r) => r.productId === product.id);
  const productReviews = selectedStarFilter !== null
    ? rawProductReviews.filter((r) => r.rating === selectedStarFilter)
    : rawProductReviews;

  const rawProductQas = qas.filter((q) => q.productId === product.id);
  const productQas = qaSearchQuery.trim()
    ? rawProductQas.filter((qa) => 
        qa.question.toLowerCase().includes(qaSearchQuery.toLowerCase()) || 
        (qa.answer && qa.answer.toLowerCase().includes(qaSearchQuery.toLowerCase()))
      )
    : rawProductQas;

  const isWhiteLabel = selectedSkuVariant === 'white_label';
  const rawBasePrice = isWhiteLabel ? Math.round(product.price * 0.55) : product.price;

  const finalPrice = product.isElite && currentUser.isElite 
    ? Math.round(rawBasePrice * 0.9) 
    : rawBasePrice;

  const displayProductName = isWhiteLabel 
    ? `Generic White-Label Alternative (${product.brand} OEM)` 
    : product.name;

  const baseProductDesc = isWhiteLabel
    ? `Identical architectural design and structural frame matching the unbranded ledger footprint. Manufactured on the same production floor utilizing raw industrial casings and plain bulk packaging. Bypasses premium retail markups.`
    : product.description;

  // --- FEATURE 97: CONTEXTUAL AI SMART DESCRIPTIONS ---
  const [aiPersona, setAiPersona] = React.useState<'default' | 'minimalist' | 'technical' | 'marketing' | 'critique'>('default');
  const [aiTyping, setAiTyping] = React.useState(false);
  const [aiDescriptionText, setAiDescriptionText] = React.useState(baseProductDesc);

  const aiDescriptions = React.useMemo(() => {
    return {
      prod_1: {
        minimalist: "A single piece of audio perfection. Pure silence, uninterrupted battery, upcycled marine polymers.",
        technical: "Acoustic chamber volume: 38cc. Drivers: 40mm Neodymium N52 magnets. Coil: CCAW. Impedance: 32 ohms. Active Noise Cancellation: Dual-feed hybrid feedforward + feedback, attenuates up to 42dB in 20Hz-2KHz spectrum. Bluetooth v5.3 supporting LDAC, AAC, aptX Adaptive.",
        marketing: "Step into your own sanctuary of sound. The Aether-9 envelops you in magnificent, breathtaking acoustics while wiping away the outside world with studio-grade noise elimination. Unleash raw, emotional performance for up to 45 glorious hours.",
        critique: "Aether-9 represents a masterclass in spatial sound reproduction and premium comfort. However, the reliance on soy-protein ear cushions, while highly biodegradable, means they will show physical wear and material flaking under high humidity conditions after 18-24 months of heavy usage. We advise acquiring spare ear cups early."
      },
      prod_2: {
        minimalist: "Aerospace titanium watch featuring high-accuracy AMOLED biosensors and native offline map navigation.",
        technical: "Casing: Grade-5 surgical-grade Titanium. Bezel: Sapphire Crystal glass, Mohs hardness 9. Display: 1.43\" AMOLED, 466x466 pixels, 326 PPI, peak luminance 1200 nits. Sensors: PPG optical blood oxygen, tri-axis accelerometer, barometric altimeter, dual-frequency multi-constellation GPS.",
        marketing: "Crafted for the untamable spirit. The Chronos Edition 4 is more than a timepiece—it is a rugged companion built from space-era titanium. Navigate uncharted terrains with military-grade mapping and track your body's vitals with relentless, pinpoint accuracy.",
        critique: "An exceptional outdoor tool with a robust GPS lock. Nonetheless, the high-luminance AMOLED panel severely penalizes battery stamina during active tracking sessions, shrinking runtime from 14 days to a mere 18 hours when GPS and Always-On-Display are concurrent. We advise toggling off-line pre-rendering when in remote grids."
      },
      prod_3: {
        minimalist: "A flawless, immersive 34-inch curved workspace monitor with 144Hz fluid motion.",
        technical: "Panel Type: VA Curved (1500R curvature). Native Resolution: 3440 x 1440 (21:9 aspect ratio). Color Gamut: 99% sRGB, 92% DCI-P3 calibrated. Refresh Rate: 144Hz. Input Ports: 2x HDMI 2.1, 1x DisplayPort 1.4, 1x USB-C with 90W Power Delivery.",
        marketing: "Expand your horizon. The Lumina Horizon pulls you into stunning high-definition wide-screen space, perfect for complex workspace spreadsheets or epic gameplay. Experience gorgeous, vibrant colors and ultra-smooth fluid transitions.",
        critique: "The Horizon Ultrawide excels at desktop real estate. However, due to VA panel technology, fast-moving dark elements exhibit slight ghosting and black smearing during low-light transitions. Gamers requiring flawless gray-to-gray response should enable the overdrive option inside the OSD."
      }
    };
  }, []);

  const getSmartDescription = React.useCallback((prodId: string, name: string, desc: string, category: string, persona: 'default' | 'minimalist' | 'technical' | 'marketing' | 'critique') => {
    if (persona === 'default') return desc;
    
    const mapped = (aiDescriptions as any)[prodId];
    if (mapped && (mapped as any)[persona]) {
      return (mapped as any)[persona];
    }
    
    // Dynamic generation backup:
    if (persona === 'minimalist') {
      return `An elegant, high-precision expression of modern ${category.toLowerCase()} design. Built around pure functional performance.`;
    }
    if (persona === 'technical') {
      return `Physical architecture: High-grade component casing. Performance rating: High-efficiency ${category.toLowerCase()} modules. Latency thresholds: Low-latency communication nodes. Integrates standard diagnostic registers.`;
    }
    if (persona === 'marketing') {
      return `Elevate your standard of living with the ${name}. Engineered to inspire, it delivers breathtaking features and unparalleled luxury directly to your daily routine!`;
    }
    if (persona === 'critique') {
      return `The ${name} represents a substantial milestone in consumer-tier ${category.toLowerCase()} items. However, the thermal dissipation envelope is tightly constrained under peak loads, and we recommend ensuring proper ambient airflow to prevent premature throttling.`;
    }
    return desc;
  }, [aiDescriptions]);

  // Handle persona changes with a beautiful local typewriter effect!
  React.useEffect(() => {
    const targetText = getSmartDescription(
      product.id,
      displayProductName,
      baseProductDesc,
      product.category,
      aiPersona
    );
    
    if (aiPersona === 'default') {
      setAiDescriptionText(targetText);
      setAiTyping(false);
      return;
    }

    setAiTyping(true);
    let currentLen = 0;
    setAiDescriptionText('');
    
    const timer = setInterval(() => {
      currentLen += 6; // Type 6 characters at a time for fast response
      if (currentLen >= targetText.length) {
        setAiDescriptionText(targetText);
        setAiTyping(false);
        clearInterval(timer);
      } else {
        setAiDescriptionText(targetText.substring(0, currentLen) + '▮');
      }
    }, 15);
    
    return () => clearInterval(timer);
  }, [aiPersona, product.id, displayProductName, baseProductDesc, product.category, getSmartDescription]);

  const displayProductDesc = aiDescriptionText;

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const matchingCount = rawProductReviews.filter((r) => r.rating === stars).length;
    const pct = rawProductReviews.length > 0 ? (matchingCount / rawProductReviews.length) * 100 : 0;
    return { stars, count: matchingCount, pct };
  });

  // --- FEATURE 94: SEMANTIC REVIEW SUMMARIZATION ---
  const summaryInsights = React.useMemo(() => {
    const reviewsToAnalyze = productReviews.length > 0 ? productReviews : rawProductReviews;
    const prosSet = new Set<string>();
    const consSet = new Set<string>();
    let positiveCount = 0;
    
    reviewsToAnalyze.forEach(r => {
      const txt = r.text.toLowerCase();
      const rating = r.rating;
      if (rating >= 4) positiveCount++;
      
      if (txt.includes('sound') || txt.includes('audio') || txt.includes('music') || txt.includes('bass') || txt.includes('frequency')) prosSet.add('Stellar soundstage signature');
      if (txt.includes('comfort') || txt.includes('soft') || txt.includes('wear') || txt.includes('foam')) prosSet.add('Ergonomic and plush fit');
      if (txt.includes('battery') || txt.includes('hours') || txt.includes('charge')) prosSet.add('Superb battery longevity');
      if (txt.includes('titanium') || txt.includes('quality') || txt.includes('build') || txt.includes('alloy')) prosSet.add('Premium metal craftsmanship');
      if (txt.includes('anc') || txt.includes('noise') || txt.includes('quiet') || txt.includes('isolation')) prosSet.add('Excellent active isolation');
      
      if (txt.includes('expensive') || txt.includes('price') || txt.includes('cost') || txt.includes('dollars')) consSet.add('Higher capital barrier');
      if (txt.includes('sleeve') || txt.includes('lid') || txt.includes('packaging')) consSet.add('Complex unboxing ritual');
      if (txt.includes('sweat') || txt.includes('humidity') || txt.includes('peel') || txt.includes('flake')) consSet.add('Ear cushions sensitive to humidity');
      if (txt.includes('weight') || txt.includes('heavy') || txt.includes('grams')) consSet.add('Slightly heavy footprint');
      if (txt.includes('software') || txt.includes('app') || txt.includes('firmware') || txt.includes('sync')) consSet.add('Basic accompanying app utility');
    });
    
    if (prosSet.size === 0) {
      prosSet.add('High-end industrial aesthetics');
      prosSet.add('Vetted materials certification');
    }
    if (consSet.size === 0) {
      consSet.add('Limited initial colorways');
      consSet.add('Premium pricing tier');
    }
    
    const sentimentPct = reviewsToAnalyze.length > 0 
      ? Math.round((positiveCount / reviewsToAnalyze.length) * 100) 
      : 95;
      
    return {
      pros: Array.from(prosSet).slice(0, 3),
      cons: Array.from(consSet).slice(0, 3),
      sentimentPct,
      consensus: sentimentPct >= 85 ? 'Highly Recommended' : sentimentPct >= 70 ? 'Recommended with Caveats' : 'Mixed Sentiments'
    };
  }, [productReviews, rawProductReviews]);

  // --- FEATURE 91: CLIENT-SIDE SEMANTIC RECOMMENDATION ENGINE ---
  const semanticRecommendations = React.useMemo(() => {
    if (!products || products.length <= 1) return [];
    
    const currentTokens = new Set(`${product.name} ${product.category} ${product.brand}`.toLowerCase().split(/\s+/));
    
    const scored = products
      .filter(p => p.id !== product.id)
      .map(p => {
        const otherTokens = `${p.name} ${p.category} ${p.brand}`.toLowerCase().split(/\s+/);
        let intersection = 0;
        otherTokens.forEach(t => {
          if (currentTokens.has(t)) intersection++;
        });
        const union = currentTokens.size + otherTokens.length - intersection;
        const jaccard = union > 0 ? intersection / union : 0;
        return { product: p, score: jaccard };
      });
      
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.product);
  }, [product, products]);

  // --- FEATURE #32: TIME-STAMPED VIDEO REVIEW SNIPPET PARSER ---
  const renderReviewText = (text: string) => {
    const parts = text.split(/(\[0:10\]|\[0:35\]|\[1:15\])/g);
    return parts.map((part, index) => {
      if (part === '[0:10]') {
        return (
          <button
            key={index}
            type="button"
            onClick={() => { setReviewVideoTime(10); setReviewVideoPlaying(true); }}
            className="mx-1 px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] border border-purple-800/40 hover:bg-purple-900 transition-colors cursor-pointer inline-flex items-center gap-0.5 font-bold"
          >
            <Play className="h-2.5 w-2.5 fill-current" /> 0:10
          </button>
        );
      }
      if (part === '[0:35]') {
        return (
          <button
            key={index}
            type="button"
            onClick={() => { setReviewVideoTime(35); setReviewVideoPlaying(true); }}
            className="mx-1 px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] border border-purple-800/40 hover:bg-purple-900 transition-colors cursor-pointer inline-flex items-center gap-0.5 font-bold"
          >
            <Play className="h-2.5 w-2.5 fill-current" /> 0:35
          </button>
        );
      }
      if (part === '[1:15]') {
        return (
          <button
            key={index}
            type="button"
            onClick={() => { setReviewVideoTime(75); setReviewVideoPlaying(true); }}
            className="mx-1 px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] border border-purple-800/40 hover:bg-purple-900 transition-colors cursor-pointer inline-flex items-center gap-0.5 font-bold"
          >
            <Play className="h-2.5 w-2.5 fill-current" /> 1:15
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div id="product-details-view" className={`pb-16 space-y-12 transition-all duration-500 rounded-3xl ${
      editorialMode 
        ? 'bg-slate-950 text-slate-100 p-8 sm:p-12 border border-slate-900 shadow-2xl font-serif' 
        : 'bg-transparent text-slate-800 font-sans'
    }`}>
      
      {/* Back button & IMMERSIVE EDITORIAL LAYOUT TOGGLE (Feature #6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100/10 pb-4">
        <button
          id="details-back-btn"
          onClick={() => { cleanupSynth(); onBack(); }}
          className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            editorialMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-teal-600'
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Listing</span>
        </button>

        <button
          type="button"
          onClick={() => setEditorialMode(!editorialMode)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer ${
            editorialMode 
              ? 'bg-slate-900 border-teal-800 text-teal-400 hover:text-white shadow-lg' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Settings className={`h-4 w-4 ${editorialMode ? 'animate-spin' : ''}`} />
          <span>{editorialMode ? 'Standard Layout Mode' : 'Immersive Editorial Lookbook'}</span>
        </button>
      </div>

      {/* PRIMARY COLUMN GRID */}
      <div id="details-main-grid" className="grid gap-8 md:grid-cols-2">
        
        {/* LEFT COLUMN: Zoomable Image Card */}
        <div className="space-y-6">
          <div 
            id="details-image-card" 
            className={`overflow-hidden rounded-2xl border transition-all p-4 flex flex-col justify-center ${
              editorialMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white shadow-sm'
            }`}
          >
            <div 
              id="zoom-image-frame"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-50 cursor-zoom-in"
            >
              <img
                id="details-product-img"
                src={product.image}
                alt={product.name}
                style={zoomStyle}
                className="h-full w-full object-cover transition-transform duration-100"
              />
              
              {product.isElite && (
                <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-amber-500/95 backdrop-blur-sm px-3 py-1.5 text-xs font-black text-white shadow-md">
                  <Crown className="h-4 w-4" />
                  <span>ELITE SELECTION</span>
                </div>
              )}
            </div>
            {!editorialMode && (
              <p className="text-[10px] text-center text-slate-400 mt-3 font-mono">
                Hover or slide cursor over image to zoom and inspect quality details
              </p>
            )}
          </div>

          {/* -------------------------------------------------------------
              ADVANCED SPECIFICATIONS / DIAGNOSTIC SCHEMATICS COMPONENT DECK
             ------------------------------------------------------------- */}
          <div className={`rounded-2xl border p-5 space-y-5 shadow-xl relative overflow-hidden ${
            editorialMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
          }`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/50 pb-3 gap-2">
              <span className="text-[10px] font-bold font-mono text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="h-4 w-4 animate-pulse" />
                Advanced Cargo Diagnostics
              </span>
              
              {/* Tab options for Cargo Diagnostics */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setTechTab('sustainability')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    techTab === 'sustainability' 
                      ? 'bg-emerald-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌱 Eco-Ledger
                </button>
                <button
                  type="button"
                  onClick={() => setTechTab('parametric')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    techTab === 'parametric' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sizing Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setTechTab('revision')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    techTab === 'revision' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Revisions
                </button>
                <button
                  type="button"
                  onClick={() => setTechTab('audio')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    techTab === 'audio' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Spatial Demo
                </button>
                <button
                  type="button"
                  onClick={() => setTechTab('hologram')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    techTab === 'hologram' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  3D AR Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setTechTab('custom')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    techTab === 'custom' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Direct Mfg
                </button>
                <button
                  type="button"
                  onClick={() => setTechTab('sku')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    techTab === 'sku' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SKU Ledger
                </button>
                <button
                  type="button"
                  onClick={() => setTechTab('demo')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    techTab === 'demo' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🎛️ Micro-Demo
                </button>
                <button
                  type="button"
                  onClick={() => setTechTab('unboxing')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    techTab === 'unboxing' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📦 Unboxing
                </button>
                <button
                  type="button"
                  onClick={() => setTechTab('compare')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    techTab === 'compare' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ↔ Split Compare
                </button>
                <button
                  type="button"
                  onClick={() => setTechTab('lighting')}
                  className={`px-2 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    techTab === 'lighting' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  💡 Lighting
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              
              {/* BATCH 7: SUSTAINABILITY & CIRCULAR ECONOMY LEDGER */}
              {techTab === 'sustainability' && (
                <motion.div
                  key="tab-sustainability"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 text-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-black font-mono text-emerald-400 tracking-widest uppercase flex items-center gap-2">
                      <span>🌱 Circular & Sustainability Ledger</span>
                    </h4>
                    <span className="text-[8px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded uppercase">
                      VERIFIED ECO METRICS
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    We care about our planet. That's why we track exactly how each item is made, how long it takes to break down, and how easy it is to fix yourself. See the details below!
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    
                    {/* Column 1: Biodegradability & Materials Lifecycle (Feature #66) */}
                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
                        <span className="text-base">♻️</span>
                        <h5 className="text-[10.5px] font-bold font-mono text-slate-300 uppercase">How Long It Lasts & Ecolife</h5>
                      </div>

                      {/* Material degradation lifespan */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Time to break down naturally</span>
                        <p className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50 leading-relaxed">
                          {ecoData.materialLifespan}
                        </p>
                      </div>

                      {/* Score metrics */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {/* Biodegradability rating */}
                        <div className="bg-slate-900/40 border border-slate-900/60 p-2.5 rounded-lg space-y-1.5">
                          <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Natural Breakdown</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-emerald-400 font-mono">{ecoData.biodegradability}</span>
                            <span className="text-[9px] text-slate-500">/ 100</span>
                          </div>
                          {/* Mini visual bar */}
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400" style={{ width: `${ecoData.biodegradability}%` }} />
                          </div>
                          <span className="text-[8px] text-slate-500 font-mono block">Breaks down in soil</span>
                        </div>

                        {/* Recycling viability index */}
                        <div className="bg-slate-900/40 border border-slate-900/60 p-2.5 rounded-lg space-y-1.5">
                          <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Easy to Recycle</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-teal-400 font-mono">{ecoData.recyclingIndex}</span>
                            <span className="text-[9px] text-slate-500">/ 100</span>
                          </div>
                          {/* Mini visual bar */}
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-400" style={{ width: `${ecoData.recyclingIndex}%` }} />
                          </div>
                          <span className="text-[8px] text-slate-500 font-mono block">Can be melted/reused</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Repairability Index Scorecard (Feature #68) */}
                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
                        <span className="text-base">🛠️</span>
                        <h5 className="text-[10.5px] font-bold font-mono text-slate-300 uppercase">How Easy to Fix</h5>
                      </div>

                      {/* Score rating gauge */}
                      <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-900/60">
                        <div className="leading-none">
                          <span className="text-[8px] text-slate-500 font-mono font-bold uppercase block">Repair Score</span>
                          <span className="text-[10px] font-bold text-emerald-400 font-mono mt-1 block">
                            {ecoData.repairability >= 8.5 ? "✓ EASY TO REPAIR" : "MODERATE REPAIR VALUE"}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-0.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
                          <span className="text-xl font-black text-emerald-400 font-mono">{ecoData.repairability}</span>
                          <span className="text-[9px] text-slate-500">/ 10</span>
                        </div>
                      </div>

                      {/* Parts and tools details */}
                      <div className="space-y-3 text-[11px] leading-relaxed text-slate-400">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-slate-500 font-mono font-bold uppercase block">Spare Parts Available:</span>
                          <p className="text-slate-200 text-xs">{ecoData.spareParts}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-slate-500 font-mono font-bold uppercase block">Tools You'll Need:</span>
                          <p className="text-slate-200 text-xs">{ecoData.repairTools}</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Refurbished Ledger - Full detail section if certified refurbished (Feature #64) */}
                  {product.isRefurbished && (
                    <div className="bg-gradient-to-r from-teal-950/40 via-slate-950 to-teal-950/40 border border-teal-850/40 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-teal-950 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">🛡️</span>
                          <span className="text-[10.5px] font-bold font-mono text-teal-300 uppercase">Verified Refurbished (Like New!)</span>
                        </div>
                        <span className="text-[9px] bg-teal-950 text-teal-400 border border-teal-850 px-2 py-0.5 rounded font-bold font-mono">
                          PROVED PRE-OWNED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        This item is a certified pre-owned product. It has been thoroughly cleaned, tested, and restored to work perfectly just like a brand-new item!
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 bg-slate-950/60 p-3 rounded-lg border border-teal-900/30 text-[10px] font-mono text-slate-400">
                        <div>
                          <span className="text-slate-500 uppercase block">Restored By:</span>
                          <span className="text-teal-400 font-bold">{product.refurbishedRepairer}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase block">Quality Grade Score:</span>
                          <span className="text-emerald-400 font-extrabold">{product.refurbishedScore}/100 Grade-A</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upcycled Raw Materials lineage if upcycled (Feature #67) */}
                  {ecoData.isUpcycled && (
                    <div className="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-emerald-950/40 border border-emerald-850/40 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-1.5 border-b border-emerald-950 pb-1.5">
                        <span className="text-base">🌱</span>
                        <span className="text-[10.5px] font-bold font-mono text-emerald-300 uppercase">Upcycled & Eco-Friendly Materials</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        <strong>Upcycled Lineage Verified:</strong> {ecoData.upcycledHistory}
                      </p>
                      <span className="text-[8px] font-mono text-emerald-500 uppercase block">
                        ★ Made from recycled plastics to keep trash out of landfills.
                      </span>
                    </div>
                  )}

                  {/* Fair Trade Certification Ledger (Feature #70) */}
                  {ecoData.fairTrade && (
                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">🤝</span>
                          <span className="text-[10.5px] font-bold font-mono text-slate-300 uppercase">Fair Trade & Good Wages</span>
                        </div>
                        <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                          FAIR WAGES VERIFIED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        This item was made in a verified fair-trade facility. Workers enjoy fair wages, clean working conditions, and support for community schooling.
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400">
                        <div>
                          <span className="text-slate-500 uppercase block">Accredited Assembly Hub:</span>
                          <span className="text-slate-200 font-bold">{ecoData.fairTradeFactory}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase block">Worker Wage Ratio Rating:</span>
                          <span className="text-emerald-400 font-bold">{ecoData.fairTradeWage}</span>
                        </div>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1.5">
                        <span>🛡️ Cryptographic Ledger Record:</span>
                        <span className="text-teal-400 underline cursor-pointer">{ecoData.fairTradeAudit}</span>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}

              {/* FEATURE #2: DYNAMIC PARAMETRIC SIZING MATRIX PANEL */}
              {techTab === 'parametric' && (
                <motion.div
                  key="tab-parametric"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Enter raw material measurements below instead of generic standard size guidelines to preview fit constraints on our schematic matrix vector scan.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Interactive inputs */}
                    <div className="space-y-3.5 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-mono">
                      {isWearableCategory ? (
                        <>
                          <div className="space-y-1.5">
                            <div className="flex justify-between">
                              <span>Wrist Circumference</span>
                              <span className="text-teal-400 font-bold">{param1}mm</span>
                            </div>
                            <input
                              type="range" min="20" max="60" value={param1}
                              onChange={(e) => setParam1(Number(e.target.value))}
                              className="w-full accent-teal-400 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between">
                              <span>Strap Adjustment Range</span>
                              <span className="text-teal-400 font-bold">{param2}mm</span>
                            </div>
                            <input
                              type="range" min="130" max="240" value={param2}
                              onChange={(e) => setParam2(Number(e.target.value))}
                              className="w-full accent-teal-400 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <div className="flex justify-between">
                              <span>Desk depth clearance</span>
                              <span className="text-teal-400 font-bold">{param1}cm</span>
                            </div>
                            <input
                              type="range" min="40" max="110" value={param1}
                              onChange={(e) => setParam1(Number(e.target.value))}
                              className="w-full accent-teal-400 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between">
                              <span>Desk horizontal width</span>
                              <span className="text-teal-400 font-bold">{param2}cm</span>
                            </div>
                            <input
                              type="range" min="80" max="240" value={param2}
                              onChange={(e) => setParam2(Number(e.target.value))}
                              className="w-full accent-teal-400 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                            />
                          </div>
                        </>
                      )}

                      <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-[11px] font-bold">
                        <span>Ergonomic Match Fit:</span>
                        <span className={parametricFitRatio > 85 ? 'text-teal-400' : 'text-amber-400 animate-pulse'}>
                          {parametricFitRatio}% Accurate Sizing
                        </span>
                      </div>
                    </div>

                    {/* Schematic vector Canvas */}
                    <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-1 flex justify-center items-center h-[140px]">
                      <canvas ref={parametricCanvasRef} width={180} height={130} className="w-full h-full block" />
                      <span className="absolute bottom-1 right-2 text-[7px] text-slate-500 font-mono">SCHEM_REF: FIT_SAMP</span>
                    </div>
                  </div>

                  {/* Fit analysis message */}
                  <div className={`p-3 rounded-xl border font-mono text-[10px] leading-relaxed ${
                    parametricFitRatio > 85 
                      ? 'bg-teal-950/40 border-teal-800/50 text-teal-400' 
                      : 'bg-amber-950/40 border-amber-800/50 text-amber-400 animate-pulse'
                  }`}>
                    <div className="flex gap-2 items-start">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>
                        {isWearableCategory 
                          ? (parametricFitRatio > 85 
                              ? '✓ ERGONOMIC BALANCE SECURED: Adjusted strap nodes wrap wrist bones within nominal blood-flow tolerances.'
                              : '⚠ EXCESS OVERLAP DETECTED: Selected strap circumference may result in physical overhang of core bezel.')
                          : (parametricFitRatio > 85
                              ? '✓ WORKSPACE FOOTPRINT CONFIRMED: Desktop workspace handles physical curves of item without overhang conflict.'
                              : '⚠ PHYSICAL CLEARANCE CONFLICT: Desk depth is insufficient for curves of monitor box. Avoid wall contact.')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* FEATURE #4: CHRONOLOGICAL HARDWARE VERSIONING TIMELINE */}
              {techTab === 'revision' && (
                <motion.div
                  key="tab-revision"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Trace the physical design changes, electrical substrate layouts, and preloaded firmware revision commits of this hardware in our chronological timeline tree.
                  </p>

                  {/* Visual Git Branch Line Map */}
                  <div className="relative rounded-xl bg-slate-950 p-3 border border-slate-800 h-[65px] flex items-center justify-between">
                    <div className="absolute left-6 right-6 h-0.5 bg-slate-800 z-0" />
                    
                    {revisionNodes.map((node) => {
                      const isActive = activeRevNode === node.id;
                      return (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => setActiveRevNode(node.id)}
                          className="relative z-10 flex flex-col items-center group cursor-pointer"
                        >
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isActive 
                              ? 'bg-teal-500 border-teal-300 scale-110 shadow-[0_0_8px_#14b8a6]' 
                              : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                          }`}>
                            <GitCommit className={`h-3 w-3 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                          </div>
                          <span className={`text-[8px] font-mono font-bold mt-1 uppercase ${
                            isActive ? 'text-teal-400' : 'text-slate-500'
                          }`}>
                            {node.tag}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Revision Specs Panel */}
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[10px] text-slate-300 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-teal-400 text-[11px]">{selectedRevision.title}</span>
                      <span className="text-[8px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{selectedRevision.id}</span>
                    </div>

                    <p className="text-slate-400 leading-relaxed text-[10.5px]">
                      {selectedRevision.desc}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500 border-t border-slate-800 pt-2">
                      <div>REVISION DATE: <span className="text-slate-400 font-bold">{selectedRevision.date}</span></div>
                      <div className="text-right">ARCHITECT: <span className="text-slate-400 font-bold">{selectedRevision.author}</span></div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* FEATURE #9: SPATIAL AUDIO EQUIPMENT DEMO SIMULATOR */}
              {techTab === 'audio' && (
                <motion.div
                  key="tab-audio"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Initialize our real-time spatial synthesizer demo model to inspect the acoustic characteristics, echo bounce feedback, and frequency dampening bounds of this unit.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Audio Synthesis knobs */}
                    <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300">
                      
                      <button
                        type="button"
                        onClick={handleToggleAudioSim}
                        className={`w-full py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          audioPlaying 
                            ? 'bg-red-950 text-red-400 border border-red-800 shadow-[0_0_8px_rgba(239,68,68,0.25)] animate-pulse' 
                            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-md'
                        }`}
                      >
                        {audioPlaying ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                        <span>{audioPlaying ? 'Disable Audio Space' : 'Active Acoustic Beam'}</span>
                      </button>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between">
                          <span>Acoustic Distance (m)</span>
                          <span className="text-teal-400 font-bold">{audioDistance}m</span>
                        </div>
                        <input
                          type="range" min="1" max="100" value={audioDistance}
                          onChange={(e) => setAudioDistance(Number(e.target.value))}
                          className="w-full accent-teal-400 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span>Material Wall Absorption</span>
                          <span className="text-teal-400 font-bold">{audioAbsorption}%</span>
                        </div>
                        <input
                          type="range" min="1" max="100" value={audioAbsorption}
                          onChange={(e) => setAudioAbsorption(Number(e.target.value))}
                          className="w-full accent-teal-400 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span>Echo Delay (Feedback Loop)</span>
                          <span className="text-teal-400 font-bold">{audioDelay}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100" value={audioDelay}
                          onChange={(e) => setAudioDelay(Number(e.target.value))}
                          className="w-full accent-teal-400 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                        />
                      </div>

                    </div>

                    {/* Real-time Oscilloscope canvas */}
                    <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-2 flex flex-col justify-between h-[180px]">
                      <div className="text-[8px] font-mono text-slate-500 flex justify-between">
                        <span>TELEM_STREAM: MONO_OUT</span>
                        <span className={audioPlaying ? 'text-teal-400 animate-pulse' : ''}>
                          {audioPlaying ? '✓ ACTIVE OSCILLATOR' : 'STREAM STANDBY'}
                        </span>
                      </div>
                      
                      {audioPlaying ? (
                        <canvas ref={audioCanvasRef} width={180} height={100} className="w-full h-[100px] block" />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-1">
                          <Disc className="h-6 w-6 text-slate-700 animate-spin-slow" />
                          <span className="text-[8px] font-mono uppercase font-bold text-center">Waveform standby</span>
                        </div>
                      )}

                      <span className="text-[7px] text-slate-500 font-mono text-right">FREQ_OUTFLOW: SWEEP_SAW</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* HOLOGRAPHIC AR PROJECTION SANDBOX (Feature #20) */}
              {techTab === 'hologram' && (
                <motion.div
                  key="tab-hologram"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] font-mono text-slate-400">STATUS: HOLO_AR_NODE</span>
                    <button
                      type="button"
                      onClick={() => setHoloEnabled(!holoEnabled)}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        holoEnabled ? 'bg-cyan-500 hover:bg-cyan-600 text-slate-900 shadow-md' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {holoEnabled ? 'Shutdown Projection' : 'Activate Hologram'}
                    </button>
                  </div>

                  {holoEnabled ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="relative rounded-xl border border-slate-800 bg-slate-950/85 p-1 flex justify-center items-center h-[180px]">
                        <canvas ref={holoCanvasRef} width={220} height={170} className="w-full h-full block" />
                        
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <button 
                            type="button"
                            onClick={() => setHoloColor('cyan')}
                            className={`h-3 w-3 rounded-full bg-cyan-400 border transition-all cursor-pointer ${holoColor === 'cyan' ? 'border-white' : 'border-transparent'}`}
                          />
                          <button 
                            type="button"
                            onClick={() => setHoloColor('amber')}
                            className={`h-3 w-3 rounded-full bg-amber-500 border transition-all cursor-pointer ${holoColor === 'amber' ? 'border-white' : 'border-transparent'}`}
                          />
                          <button 
                            type="button"
                            onClick={() => setHoloColor('emerald')}
                            className={`h-3 w-3 rounded-full bg-emerald-500 border transition-all cursor-pointer ${holoColor === 'emerald' ? 'border-white' : 'border-transparent'}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400">
                        <div className="space-y-1">
                          <label className="block uppercase text-[8px]">Rotation Speed</label>
                          <input 
                            type="range" min="0.2" max="3" step="0.1" value={holoRotSpeed} 
                            onChange={(e) => setHoloRotSpeed(Number(e.target.value))}
                            className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block uppercase text-[8px]">Projection Beams</label>
                          <input 
                            type="range" min="1" max="5" step="1" value={holoBeamDensity} 
                            onChange={(e) => setHoloBeamDensity(Number(e.target.value))}
                            className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block uppercase text-[8px]">Glitch Noise</label>
                          <input 
                            type="range" min="0" max="4" step="1" value={holoNoise} 
                            onChange={(e) => setHoloNoise(Number(e.target.value))}
                            className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/20 text-slate-500">
                      <Cpu className="h-6 w-6 text-slate-700 mx-auto animate-pulse" />
                      <p className="text-[10px] font-mono uppercase font-bold mt-1">Projection Node Offline</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* FEATURE #28: DIRECT-TO-MANUFACTURER CUSTOMIZATION PANEL */}
              {techTab === 'custom' && (
                <motion.div
                  key="tab-custom"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Append your custom engineering configuration specifications directly to the manufacturer's automated production run queue, completely bypassing retail middleware.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300">
                      <div className="space-y-1">
                        <label className="block text-slate-500 uppercase text-[8px] font-bold">CNC Alloy Base Grade</label>
                        <select 
                          value={mfgAlloy} 
                          onChange={(e) => { setMfgAlloy(e.target.value); setMfgCompiled(false); }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="Grade 5 Titanium">Grade 5 Titanium (Premium Aerospace)</option>
                          <option value="6061-T6 Aluminum">6061-T6 Aluminum (Anodized Spec)</option>
                          <option value="Eutectic Solid Copper">Eutectic Solid Copper (Max Thermal Transfer)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-500 uppercase text-[8px] font-bold">Substrate Solder Alloy</label>
                        <select 
                          value={mfgSolder} 
                          onChange={(e) => { setMfgSolder(e.target.value); setMfgCompiled(false); }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="Sac305 Lead-Free">SAC305 Lead-Free (Sn/Ag/Cu standard)</option>
                          <option value="Indium Eutectic">Indium Eutectic (Low-Temp Crystal)</option>
                          <option value="High-Silver Eutectic">High-Silver Eutectic (High-Conductivity)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-500 uppercase text-[8px] font-bold">Custom Firmware Repo URL</label>
                        <input 
                          type="text" 
                          value={mfgFirmware} 
                          onChange={(e) => { setMfgFirmware(e.target.value); setMfgCompiled(false); }}
                          placeholder="https://github.com/org/repo.git"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleCompileSpecs}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold uppercase transition-colors"
                      >
                        Compile & Append to CNC Queue
                      </button>
                    </div>

                    {/* Manufacturing compilation log terminal */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 h-[200px] flex flex-col justify-between font-mono text-[8px]">
                      <div className="space-y-1 overflow-y-auto max-h-[160px]">
                        <span className="text-slate-500 uppercase text-[7px] block font-bold">CNC Compiler Feed</span>
                        {mfgCompiled ? (
                          mfgCNCLogs.map((log, lidx) => (
                            <p key={lidx} className={log.includes('SUCCESS') || log.includes('RECORDED') ? 'text-teal-400 font-bold' : 'text-slate-400'}>
                              {log}
                            </p>
                          ))
                        ) : (
                          <div className="text-slate-600 italic py-8 text-center uppercase">
                            Await compiling specs to manufacture line...
                          </div>
                        )}
                      </div>
                      {mfgCompiled && (
                        <div className="border-t border-slate-800 pt-1.5 text-teal-400 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
                          <span>SPECS APPENDED TO QUEUE SLOT</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* FEATURE #29: UNIVERSAL SKU MATCHING LEDGER PANEL */}
              {techTab === 'sku' && (
                <motion.div
                  key="tab-sku"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 font-mono text-[11px]"
                >
                  <p className="text-slate-400 leading-normal font-sans">
                    Our platform maps manufacturers' physical hardware footprints. Use the open <strong>Universal SKU Matching Ledger</strong> to instantly identify unbranded white-label equivalents of this product.
                  </p>

                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 text-[10px]">
                      <div className={`p-3 rounded-lg border transition-all ${
                        selectedSkuVariant === 'branded' ? 'border-teal-500 bg-slate-900/60' : 'border-slate-800'
                      }`}>
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                          <span className="font-bold text-white uppercase">Premium Brand Layout</span>
                          <span className="text-[8px] bg-teal-950 text-teal-400 border border-teal-800 px-1.5 py-0.5 rounded">Active</span>
                        </div>
                        <ul className="space-y-1 mt-2 text-slate-400">
                          <li>SKU: <span className="text-slate-300 font-bold">NEX-{product.id.substring(0, 5).toUpperCase()}</span></li>
                          <li>Casing: Aluminum Anodized Matte</li>
                          <li>Price: <span className="text-teal-400 font-bold">${product.price}</span></li>
                        </ul>
                      </div>

                      <div className={`p-3 rounded-lg border transition-all ${
                        selectedSkuVariant === 'white_label' ? 'border-amber-500 bg-slate-900/60' : 'border-slate-800'
                      }`}>
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                          <span className="font-bold text-white uppercase">Unbranded White-Label Equivalent</span>
                          <span className="text-[8px] bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded">Mapped Alternative</span>
                        </div>
                        <ul className="space-y-1 mt-2 text-slate-400">
                          <li>SKU: <span className="text-slate-300 font-bold">OEM-{product.id.substring(0, 5).toUpperCase()}-RAW</span></li>
                          <li>Casing: Recycled Carbon Matrix</li>
                          <li>Price: <span className="text-amber-400 font-bold">${Math.round(product.price * 0.55)} (-45%)</span></li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                      <span className="text-slate-400 font-sans text-xs">
                        {selectedSkuVariant === 'branded' 
                          ? "Using official branded package with extended warranty."
                          : "Using white-label package. Logo stripped, raw components used."
                        }
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedSkuVariant(selectedSkuVariant === 'branded' ? 'white_label' : 'branded')}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          selectedSkuVariant === 'branded' 
                            ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        {selectedSkuVariant === 'branded' ? 'Swap to Generic Alternative' : 'Restore Premium Brand'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* FEATURE #33: DYNAMIC INTERACTIVE MICRO-DEMO */}
              {techTab === 'demo' && (
                <motion.div
                  key="tab-demo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Interact directly with the mock hardware controls below to test Active Noise Cancellation filters, volume attenuator scrolls, or rapid USB-C fast-charging speeds on this {product.name}.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Device schematic visualization with interactive hotspots */}
                    <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-4 min-h-[180px] flex flex-col justify-between overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.06),transparent_70%)]" />
                      
                      <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 z-10">
                        <span>SCHEM_MODEL: V-GEN4_SYS</span>
                        <span className="text-purple-400 animate-pulse">● LIVE INTERACTION READY</span>
                      </div>

                      {/* Mock hardware vector lines */}
                      <div className="relative my-4 flex justify-center items-center h-28">
                        <div className="absolute w-24 h-24 rounded-full border border-dashed border-purple-500/30 flex items-center justify-center animate-spin-slow">
                          <div className="w-16 h-16 rounded-full border border-purple-500/20" />
                        </div>
                        {/* Interactive overlays based on selected specs */}
                        <div className={`absolute px-3 py-1.5 rounded-lg border text-[10px] font-mono z-10 transition-all ${
                          demoAncEnabled ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400' : 'border-purple-900 bg-slate-900/60 text-slate-400'
                        }`}>
                          {demoAncEnabled ? '🛡️ ANC FILTER: HIGH' : '🔊 PASS-THROUGH MODE'}
                        </div>

                        {demoUsbConnected && (
                          <div className="absolute bottom-1 bg-yellow-950 border border-yellow-700 text-yellow-400 rounded px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-widest animate-bounce">
                            ⚡ Charging: {demoBatteryPct}%
                          </div>
                        )}
                      </div>

                      <div className="text-[8px] font-mono text-slate-500 text-right z-10">
                        ATTENUATOR VOL LEVEL: {demoVolume}%
                      </div>
                    </div>

                    {/* Controls Panel */}
                    <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300">
                      <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block border-b border-slate-800 pb-1.5 mb-2">Attenuator Control Nodes</span>
                      
                      {/* Control 1: ANC Toggle */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[11px] text-white">Active Noise Cancellation</p>
                          <p className="text-[9px] text-slate-500">Toggle isolation filters</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDemoAncEnabled(!demoAncEnabled)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
                            demoAncEnabled ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {demoAncEnabled ? 'Active' : 'Muted'}
                        </button>
                      </div>

                      {/* Control 2: Volume dial slider */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between">
                          <span>Attenuator Volume Roll</span>
                          <strong className="text-purple-400">{demoVolume}%</strong>
                        </div>
                        <input
                          type="range" min="0" max="100" value={demoVolume}
                          onChange={(e) => setDemoVolume(Number(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                        />
                      </div>

                      {/* Control 3: Plug USB-C */}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <div>
                          <p className="font-bold text-[11px] text-white">USB-C Power Deliver</p>
                          <p className="text-[9px] text-slate-500">{demoUsbConnected ? '18W Fast Charging' : 'Mains disconnected'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDemoUsbConnected(!demoUsbConnected);
                            if (!demoUsbConnected) {
                              setDemoBatteryPct(62);
                              const intv = setInterval(() => {
                                setDemoBatteryPct(p => Math.min(100, p + 1));
                              }, 800);
                              setTimeout(() => clearInterval(intv), 10000);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
                            demoUsbConnected ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {demoUsbConnected ? 'Unplug' : 'Plug In'}
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* FEATURE #37: INTERACTIVE UNBOXING TIMELINES */}
              {techTab === 'unboxing' && (
                <motion.div
                  key="tab-unboxing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Peel back the layers of this premium delivery box using our interactive sequence to verify absolute shipment packaging authenticity.
                  </p>

                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-4 font-mono text-[10.5px]">
                    <div className="relative border-l border-purple-500/30 ml-4 pl-6 space-y-6 py-2">
                      
                      {/* Step 1: bio peel */}
                      <div className="relative text-left">
                        <div className={`absolute -left-9.5 top-0.5 h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                          unboxedSleeve ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}>
                          1
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-white text-[11px]">Unwrap Biodegradable Polymer Sleeve</h5>
                          <p className="text-[9.5px] text-slate-400">Protects outer carton casing from moisture and static charge.</p>
                          <button
                            type="button"
                            onClick={() => setUnboxedSleeve(!unboxedSleeve)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] font-bold rounded-lg text-teal-400 mt-1 cursor-pointer"
                          >
                            {unboxedSleeve ? '✓ Sleeve Peeled' : 'Peel Outer Protection'}
                          </button>
                        </div>
                      </div>

                      {/* Step 2: lid lift */}
                      <div className="relative text-left">
                        <div className={`absolute -left-9.5 top-0.5 h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                          unboxedLid ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}>
                          2
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-white text-[11px]">Matte Charcoal Heavyweight Cardboard Lid Lift</h5>
                          <p className="text-[9.5px] text-slate-400">Fitted friction seal releases slowly with signature airtight sound.</p>
                          <button
                            type="button"
                            disabled={!unboxedSleeve}
                            onClick={() => setUnboxedLid(!unboxedLid)}
                            className={`px-2.5 py-1 border text-[9px] font-bold rounded-lg mt-1 cursor-pointer ${
                              !unboxedSleeve ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-teal-400'
                            }`}
                          >
                            {unboxedLid ? '✓ Lid Released' : 'Slide Lid Open'}
                          </button>
                        </div>
                      </div>

                      {/* Step 3: molded tray */}
                      <div className="relative text-left">
                        <div className={`absolute -left-9.5 top-0.5 h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                          unboxedTray ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}>
                          3
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-white text-[11px]">Recycled Plant-Fiber Device Bed Extraction</h5>
                          <p className="text-[9.5px] text-slate-400">Presents the core hardware element cleanly with accessories nested safely below.</p>
                          <button
                            type="button"
                            disabled={!unboxedLid}
                            onClick={() => {
                              setUnboxedTray(!unboxedTray);
                              if (!unboxedTray) alert(`✨ Packaging complete! You have revealed the pristine hardware casing of the ${product.name}!`);
                            }}
                            className={`px-2.5 py-1 border text-[9px] font-bold rounded-lg mt-1 cursor-pointer ${
                              !unboxedLid ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-teal-400'
                            }`}
                          >
                            {unboxedTray ? '✓ Device Revealed' : 'Lift Device from Mold'}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* FEATURE #38: COMPARATIVE VIDEO SPLIT-SCREENS */}
              {techTab === 'compare' && (
                <motion.div
                  key="tab-compare"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-slate-400 leading-normal font-sans text-left">
                    Drag the interactive comparison slider below to inspect split-screen rendering improvements of standard SDR vs advanced Ultra-HDR color spectrums side-by-side in real-time.
                  </p>

                  <div className="relative rounded-2xl border border-slate-800 bg-slate-950 aspect-video overflow-hidden flex items-center justify-center select-none">
                    
                    {/* Left Layer: SDR standard (Faded/Grayed) */}
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-center p-6 text-slate-500 font-mono text-[10px]">
                      <div className="space-y-2">
                        <p className="font-extrabold text-sm uppercase tracking-wider text-slate-400 opacity-65">Standard SDR Filter</p>
                        <p className="text-[9px]">Saturated Color Gamut: Rec. 709 (Limited)</p>
                        <p className="text-[9px]">Dynamic Peak Luminance: 120 Nits</p>
                      </div>
                    </div>

                    {/* Right Layer: Ultra HDR overlay clipping */}
                    <div 
                      className="absolute top-0 bottom-0 right-0 overflow-hidden bg-gradient-to-tr from-purple-950 via-slate-900 to-teal-950 border-l-2 border-purple-400 flex items-center justify-center text-center p-6 text-white font-mono text-[10px]"
                      style={{ left: `${compareSplitX}%` }}
                    >
                      {/* Offset container so content doesn't squeeze as left moves */}
                      <div className="absolute w-full h-full inset-0 flex items-center justify-center p-6" style={{ width: '400px', right: 0 }}>
                        <div className="space-y-2 text-center">
                          <p className="font-black text-sm uppercase tracking-wider text-purple-400 animate-pulse">Ultra-HDR Enhanced Spectrum</p>
                          <p className="text-[9px]">Expanded Wide Color Gamut: DCI-P3 (10-bit)</p>
                          <p className="text-[9px]">Max Peak Luminance: 1400 Nits</p>
                        </div>
                      </div>
                    </div>

                    {/* Slider overlay control bar input */}
                    <input 
                      type="range" min="0" max="100" value={compareSplitX}
                      onChange={(e) => setCompareSplitX(Number(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-40"
                    />

                    {/* Slider thumb handle decoration overlay */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-purple-400 pointer-events-none z-30 flex items-center justify-center"
                      style={{ left: `${compareSplitX}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="h-7 w-7 rounded-full bg-purple-500 border-2 border-purple-300 shadow-lg text-white font-bold flex items-center justify-center text-[10px]">
                        ↔
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between font-mono text-[9px] text-slate-500 bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                    <span>SPLIT DISPLACEMENT: {compareSplitX}%</span>
                    <span>ACTIVE EVALUATION MODULE</span>
                  </div>
                </motion.div>
              )}

              {/* FEATURE #39: IMMERSIVE 360-DEGREE LIGHTING SIMULATORS */}
              {techTab === 'lighting' && (
                <motion.div
                  key="tab-lighting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 font-sans text-left"
                >
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Adjust the studio light parameters below to project custom virtual ambient light filters onto our real-time product preview casing.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Simulated light-responsive card */}
                    <div className={`relative rounded-2xl border p-6 min-h-[160px] flex flex-col justify-between transition-all duration-700 ease-in-out ${
                      activeLighting === 'studio' 
                        ? 'bg-gradient-to-br from-amber-950 via-slate-950 to-amber-950/80 border-amber-900/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-white' 
                        : activeLighting === 'neon'
                        ? 'bg-gradient-to-br from-indigo-950 via-slate-950 to-pink-950 border-purple-900/40 shadow-[0_0_20px_rgba(168,85,247,0.18)] text-white'
                        : activeLighting === 'daylight'
                        ? 'bg-gradient-to-br from-slate-100 via-white to-slate-200 border-slate-200 shadow-[0_0_20px_rgba(148,163,184,0.1)] text-slate-800'
                        : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-800 shadow-none text-slate-300'
                    }`}>
                      <div className="text-[8px] font-mono opacity-50 uppercase tracking-widest">
                        Studio Filter Output: {activeLighting}
                      </div>

                      <div className="text-center my-2">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-20 w-20 object-contain mx-auto mix-blend-screen transition-transform duration-500 hover:rotate-6" 
                        />
                      </div>

                      <p className="font-bold text-xs text-center tracking-tight leading-none">
                        {product.name} ({activeLighting.toUpperCase()} GLOW)
                      </p>
                    </div>

                    {/* Lighting selector buttons */}
                    <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300">
                      <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest block border-b border-slate-800 pb-1.5 mb-2">Select Studio Preset</span>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveLighting('studio')}
                          className={`py-2 rounded-xl text-[10px] font-bold transition-all uppercase ${
                            activeLighting === 'studio' ? 'bg-amber-600 text-white font-extrabold shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Studio Gold
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveLighting('neon')}
                          className={`py-2 rounded-xl text-[10px] font-bold transition-all uppercase ${
                            activeLighting === 'neon' ? 'bg-purple-600 text-white font-extrabold shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Cyber Neon
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveLighting('daylight')}
                          className={`py-2 rounded-xl text-[10px] font-bold transition-all uppercase ${
                            activeLighting === 'daylight' ? 'bg-slate-100 text-slate-800 font-extrabold shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Daylight White
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveLighting('stealth')}
                          className={`py-2 rounded-xl text-[10px] font-bold transition-all uppercase ${
                            activeLighting === 'stealth' ? 'bg-slate-800 text-slate-300 font-extrabold shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Midnight Gray
                        </button>
                      </div>

                      <p className="text-[8.5px] text-slate-500 leading-normal font-sans pt-1">Glow presets dynamically calculate reflection shading variables to display casing textures.</p>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS CONTROLS */}
        <div id="details-controls-card" className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category and brand path */}
            <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest leading-none ${
              editorialMode ? 'text-slate-400' : 'text-slate-400'
            }`}>
              <span>{product.brand}</span>
              <span>/</span>
              <span className="text-teal-600 font-bold">{product.category}</span>
            </div>

            {/* Title */}
            <h2 id="details-product-title" className={`text-3xl font-black tracking-tight leading-tight ${
              editorialMode ? 'text-white text-4xl' : 'text-slate-900'
            }`}>
              {displayProductName}
            </h2>

            {/* Rating overview */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'}`} 
                    id={`details-star-${i}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({productReviews.length} Verified Reviewers)</span>
            </div>

            {/* FEATURE 97: Contextual Smart Persona Selector */}
            <div className="flex flex-col gap-1.5 pt-2.5 border-t border-slate-100">
              <span className="text-[9px] font-mono font-bold text-teal-600 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse" /> Edge AI Smart Description Persona
              </span>
              <div className="flex flex-wrap gap-1">
                {(['default', 'minimalist', 'technical', 'marketing', 'critique'] as const).map((persona) => (
                  <button
                    key={persona}
                    id={`btn-persona-${persona}`}
                    onClick={() => setAiPersona(persona)}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      aiPersona === persona
                        ? 'bg-teal-600 border-teal-500 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {persona}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className={`text-sm leading-relaxed pt-2 min-h-[60px] relative ${
              editorialMode ? 'text-slate-300 italic text-base font-light' : 'text-slate-600'
            }`}>
              <p id="details-product-description">
                {displayProductDesc}
              </p>
              {aiTyping && (
                <span className="absolute bottom-1 right-2 text-[8px] font-mono text-teal-500 tracking-widest animate-pulse">
                  AI RENDERING ENGINE ACTIVE...
                </span>
              )}
            </div>

            {/* Specs list */}
            {!editorialMode && (
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Specifications Log</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Manufacturer</span><span className="font-semibold text-slate-700">{product.brand}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Stock Available</span><span className={`font-semibold ${product.stock <= 3 ? 'text-red-500' : 'text-slate-700'}`}>{product.stock} units</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Category segment</span><span className="font-semibold text-slate-700">{product.category}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Merchant</span><span className="font-semibold text-teal-600">{product.sellerName}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Box & Call-To-Action */}
          <div className={`rounded-2xl border p-5 shadow-sm space-y-4 ${
            editorialMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white'
          }`}>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider mb-1">Pricing Ledger</span>
                <div className="flex items-baseline gap-2">
                  <span id="details-price-tag" className={`text-3xl font-black ${editorialMode ? 'text-white' : 'text-slate-800'}`}>
                    ${finalPrice}
                  </span>
                  {rawBasePrice !== product.price && (
                    <span className="text-sm text-slate-400 line-through">${product.price}</span>
                  )}
                  {isWhiteLabel ? (
                    <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md animate-pulse">
                      White-Label SKU applied!
                    </span>
                  ) : product.isElite && currentUser.isElite ? (
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                      Elite 10% Discount applied!
                    </span>
                  ) : product.isElite && !currentUser.isElite && (
                    <span className="text-[10px] text-amber-600 font-medium">Join Elite to save 10%!</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Logistics Class</span>
                <span className="text-xs font-bold text-slate-400">Priority Hub Delivery</span>
              </div>
            </div>

            {/* FEATURE #21: AUTOREPLENISH PARAMETRIC TRIGGER SELECTOR */}
            <div className="border-t border-slate-100/10 pt-3 space-y-3">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Purchase Integration Model</span>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100/60 p-1 rounded-xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setPurchaseMode('onetime')}
                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    purchaseMode === 'onetime' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Standard Buy
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseMode('replenish')}
                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    purchaseMode === 'replenish' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>🔄 AutoReplenish</span>
                </button>
              </div>

              {purchaseMode === 'replenish' && (
                <div className="bg-teal-50/40 border border-teal-100 rounded-xl p-3 font-mono text-[10px] space-y-3 text-slate-700">
                  <div className="flex justify-between items-center text-[11px] font-bold text-teal-800 border-b border-teal-100 pb-1.5">
                    <span>PARAMETRIC SUBSCRIPTION CONFIG</span>
                    <span className="bg-teal-100 text-teal-800 px-1 rounded">ACTIVE</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Daily Usage Cycles / Consumption</span>
                      <strong className="text-teal-700">{replenishRate} cycles/day</strong>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={replenishRate}
                      onChange={(e) => setReplenishRate(Number(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Container Capacity / Cycles</span>
                      <strong className="text-teal-700">{containerCapacity} total</strong>
                    </div>
                    <input 
                      type="range" min="30" max="360" step="10" value={containerCapacity}
                      onChange={(e) => setContainerCapacity(Number(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                    />
                  </div>

                  <div className="pt-1 text-[11px] font-bold text-teal-800 flex justify-between items-center leading-tight">
                    <span>Predictive replenishment trigger:</span>
                    <span className="bg-teal-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase animate-pulse">
                      Every {computedDays} Days
                    </span>
                  </div>
                  <p className="text-[8.5px] text-slate-400 font-sans leading-relaxed">
                    AutoReplenish uses parametric telemetry to auto-ship precisely when your consumable cycles deplete. Saves warehouse logistics and storage waste.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {/* Wishlist Button */}
              <button
                id="details-wishlist-toggle"
                onClick={() => onToggleWishlist(product)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all ${
                  isWishlisted 
                    ? 'border-rose-100 bg-rose-50/50 text-rose-500 hover:bg-rose-100' 
                    : 'border-slate-200 bg-transparent text-slate-400 hover:border-slate-300 hover:text-slate-600'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>

              {/* Add to Cart Button */}
              <button
                id="details-add-to-cart-btn"
                onClick={handleAddToCartClick}
                disabled={product.stock <= 0}
                className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold text-white shadow-sm transition-all ${
                  product.stock > 0
                    ? 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98] cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {product.stock <= 0 
                    ? 'Currently Out of Stock' 
                    : purchaseMode === 'replenish' 
                      ? 'Confirm Parametric Subscription' 
                      : 'Commit to Cart'
                  }
                </span>
              </button>
            </div>
          </div>

          {/* FEATURE #40: AUDIO-GUIDED PRODUCT DEEP-DIVE CARD */}
          <div id="audio-deepdive-guide-card" className={`rounded-2xl border p-5 space-y-4 shadow-sm ${
            editorialMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-indigo-50/40'
          }`}>
            <div className="flex items-center justify-between border-b border-indigo-100/50 pb-2">
              <span className="text-[10px] font-bold font-mono text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-indigo-600" />
                Acoustic Research & Audio Guide
              </span>
              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                podcastPlaying ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {podcastPlaying ? 'Playing' : 'Audio Ready'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Listen to our expert-guided 3-minute technical audio analysis. This guide covers detailed materials telemetry, mechanical dial tolerances, and acoustic wave absorption metrics for the {product.name}.
            </p>

            <button
              id="play-podcast-deepdive-btn"
              type="button"
              onClick={() => onPlayPodcast?.(product)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                podcastPlaying 
                  ? 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200' 
                  : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-xs'
              }`}
            >
              {podcastPlaying ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Stop Guided Commentary</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start Technical Podcast Guide (3:00)</span>
                </>
              )}
            </button>
          </div>

          {/* CO-OP POOL BUYING CARD (Feature #11) */}
          <div id="coop-pool-card" className={`rounded-2xl border p-5 space-y-4 shadow-sm ${
            editorialMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-emerald-50/45'
          }`}>
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <span className="text-[10px] font-bold font-mono text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                Group Discount Finder (Buy Together, Save Big!)
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase animate-pulse">
                Group Deal Active
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-700">
                <span>Active Group Buyers:</span>
                <span className="font-mono font-black text-emerald-700">{poolCount + (joinedPool ? 1 : 0)} joined</span>
              </div>
              <div className="flex justify-between text-xs text-slate-700">
                <span>Current Discount:</span>
                <span className="font-mono font-black text-emerald-700">25% Off Group Discount</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Deal Expiration Limit:</span>
                <span>{formatSeconds(poolTimeLeft)} left</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                id="coop-join-toggle-btn"
                onClick={handleTogglePool}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                  joinedPool 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                }`}
              >
                {joinedPool ? 'Leave Group Buy' : 'Join Group Buy (Get 25% Off!)'}
              </button>

              {joinedPool && (
                <button
                  id="coop-cart-add-btn"
                  onClick={() => {
                    const discountedProd: Product = {
                      ...product,
                      name: `${product.name} (Group Buy 25% Discount Locked)`,
                      price: Math.round(product.price * 0.75)
                    };
                    onAddToCart(discountedProd);
                    alert(`You got 25% off by buying together! Added ${discountedProd.name} to your basket.`);
                  }}
                  className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  title="Claim discount and add to cart"
                >
                  Claim & Add
                </button>
              )}
            </div>

            {/* Vercel KV Real-time State Log (Multi-user sync simulation) */}
            {kvLogs.length > 0 && (
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2 font-mono text-[8px] text-emerald-400 space-y-1">
                <span className="text-[7px] text-slate-500 block uppercase font-bold">Vercel KV Transactions</span>
                {kvLogs.map((log, lidx) => (
                  <p key={lidx} className="truncate">{log}</p>
                ))}
              </div>
            )}
          </div>

          {/* PEER-TO-PEER VERIFIED RESALE LEDGER (Feature #15) */}
          {resaleListings.length > 0 && (
            <div id="p2p-resale-card" className={`rounded-2xl border p-5 space-y-3.5 shadow-sm ${
              editorialMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-amber-50/20'
            }`}>
              <div className="flex items-center justify-between border-b border-amber-100 pb-1.5">
                <span className="text-[10px] font-bold font-mono text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-amber-600" />
                  Peer-to-Peer Resale Ledger
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 uppercase">
                  Verified Original
                </span>
              </div>

              <div className="space-y-2">
                {resaleListings.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-xl border border-dashed border-amber-200/60 bg-white/40">
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">Listed by {item.seller}</p>
                      <p className="text-[10px] text-slate-400 font-mono font-normal">Ref Purchase: {item.orderRef} • Cond: {item.condition}</p>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div className="leading-none">
                        <span className="text-xs font-black text-amber-700 font-mono block">${item.price}</span>
                        <span className="text-[8px] text-slate-400 line-through font-mono block">${product.price}</span>
                      </div>

                      <button
                        onClick={() => handleBuyUsed(item)}
                        className="h-7 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Buy Used
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIVE COUNTER-OFFER BIDDING BARTERING ENGINE (Feature #21) */}
          <div id="bidding-barter-engine" className={`rounded-2xl border p-5 space-y-4 shadow-sm ${
            editorialMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-2.5">
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-teal-600 animate-pulse" />
                Live AI Merchant Haggling Node
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 uppercase">
                Active Session
              </span>
            </div>

            {/* Chat Messages Panel */}
            <div className="h-[150px] overflow-y-auto rounded-xl border border-slate-200/50 bg-white/5 p-3 space-y-3 font-sans text-xs">
              {biddingMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-teal-600 text-white rounded-tr-none font-sans' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50 font-sans'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-slate-400 font-mono mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Bid Input form */}
            {bidStatus !== 'accepted' ? (
              <form onSubmit={handlePlaceBid} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    value={userBid}
                    onChange={(e) => setUserBid(e.target.value)}
                    placeholder="Enter credit offer..."
                    className="w-full rounded-xl border border-slate-200/40 bg-white/5 py-2 pl-6 pr-3 text-xs text-slate-200 outline-none transition-all focus:border-teal-500 focus:bg-white/10"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" /> Submit Bid
                </button>
              </form>
            ) : (
              <div className="rounded-xl bg-emerald-950/40 border border-emerald-800/50 p-3 text-center space-y-2">
                <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                  <UserCheck className="h-4 w-4" /> Bidding Settlement Reached!
                </p>
                <p className="text-[10px] text-emerald-500">
                  Your offer of <span className="font-bold">${negotiatedPrice} credits</span> was approved. Use promo code:
                </p>
                <div className="inline-block bg-slate-900 border border-emerald-500 rounded-lg px-3 py-1 font-mono font-black text-xs text-emerald-400 tracking-wider shadow-xs animate-pulse">
                  {forgedVoucherCode}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">
                  Voucher has been forged in the system registry. Enter it at checkout to claim!
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* DISCUSSIONS & REVIEWS DUAL TABS */}
      <div id="details-discussions-grid" className="grid gap-8 lg:grid-cols-12 border-t border-slate-200/20 pt-10">
        
        {/* REVIEWS SEGMENT (left 7 cols) */}
        <section id="details-reviews-panel" className="lg:col-span-7 space-y-6">
          <div className="border-b border-slate-100/15 pb-3">
            <h3 className="text-lg font-bold tracking-tight">Verified Buyer Review Logs</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sourced from decentralized audit-validated purchases</p>
          </div>

          {/* Rating aggregate panel */}
          <div className={`flex flex-col sm:flex-row gap-6 rounded-2xl border p-5 ${
            editorialMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white shadow-sm'
          }`}>
            <div className="text-center sm:border-r sm:border-slate-200/10 sm:pr-8 flex flex-col justify-center">
              <span className="text-5xl font-black tracking-tight">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Out of 5</span>
              <div className="flex justify-center text-amber-400 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'}`} />
                ))}
              </div>
            </div>

            {/* Progress Bars (Interactive for Star Filtering) */}
            <div className="flex-1 space-y-2">
              {ratingDistribution.map((tier) => {
                const isSelected = selectedStarFilter === tier.stars;
                return (
                  <button
                    id={`filter-star-tier-${tier.stars}`}
                    key={tier.stars}
                    onClick={() => setSelectedStarFilter(isSelected ? null : tier.stars)}
                    className={`w-full flex items-center gap-3 text-xs transition-all p-1.5 rounded-xl cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-950/35 border border-amber-800/40 shadow-xs scale-102' 
                        : 'hover:bg-slate-800 border border-transparent text-slate-400'
                    }`}
                    title={`Click to filter by ${tier.stars} stars`}
                  >
                    <span className="font-mono text-slate-400 w-3 text-left">{tier.stars}</span>
                    <Star className={`h-3.5 w-3.5 ${isSelected ? 'text-amber-500 fill-amber-500' : 'text-amber-400 fill-current'}`} />
                    <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${tier.pct}%` }}></div>
                    </div>
                    <span className="font-mono text-slate-400 w-5 text-right font-semibold">{tier.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Star Filter Indicator */}
          {selectedStarFilter !== null && (
            <div id="active-star-filter-indicator" className="flex items-center justify-between bg-amber-950/40 border border-amber-800/50 rounded-xl p-3 text-xs animate-fade-in text-amber-300">
              <span>
                Showing only <strong>{selectedStarFilter}-Star</strong> reviews
              </span>
              <button
                id="reset-star-filter-btn"
                onClick={() => setSelectedStarFilter(null)}
                className="text-[10px] font-bold text-amber-200 bg-slate-900 border border-amber-800 rounded-lg px-2.5 py-1 hover:bg-amber-900 transition-colors cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* FEATURE 94: SEMANTIC REVIEW SUMMARIZATION */}
          <div className="rounded-2xl border border-teal-850 bg-slate-950 p-4 space-y-3.5 shadow-md">
            <div className="flex justify-between items-center border-b border-teal-950 pb-2">
              <span className="text-[10px] font-bold font-mono text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-teal-500 animate-pulse" />
                Edge AI Semantic Review Insights
              </span>
              <span className="text-[8px] font-mono bg-teal-950 text-teal-300 border border-teal-800/40 px-1.5 py-0.5 rounded uppercase font-bold">
                Local Consensus: {summaryInsights.sentimentPct}% Positive
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-900/50 p-3 border border-slate-800/50 space-y-2">
                <h5 className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  ✓ Highlighted Virtues (Pros)
                </h5>
                <ul className="space-y-1.5">
                  {summaryInsights.pros.map((pro, index) => (
                    <li key={index} className="text-xs text-slate-300 flex items-start gap-1.5 leading-snug">
                      <span className="text-emerald-500 font-bold font-mono text-[10px]">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-slate-900/50 p-3 border border-slate-800/50 space-y-2">
                <h5 className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                  ⚠ Engineering Caveats (Cons)
                </h5>
                <ul className="space-y-1.5">
                  {summaryInsights.cons.map((con, index) => (
                    <li key={index} className="text-xs text-slate-300 flex items-start gap-1.5 leading-snug">
                      <span className="text-rose-500 font-bold font-mono text-[10px]">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-teal-950/20 border border-teal-900/30 rounded-xl p-2.5 text-[10px] text-teal-300/90 leading-normal font-sans">
              <span className="font-bold mr-1">Semantic Consensus:</span>
              Based on client-side NLP token extraction of {productReviews.length} active reviews, this product has a consensus rating of <strong className="text-teal-400">{summaryInsights.consensus}</strong>. Key descriptors indicate a strong focus on materials, acoustic wave resonance, and mechanical longevity.
            </div>
          </div>

          {/* FEATURE #32: TIME-STAMPED VIDEO DEMONSTRATION ATTACHMENT */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3.5 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="text-[10px] font-bold font-mono text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5 text-purple-500 fill-current" />
                Attached Demonstration Reel: Audio/Visual Specifications
              </span>
              <span className="text-[8px] font-mono bg-purple-950 text-purple-300 border border-purple-800/40 px-1.5 py-0.5 rounded uppercase">
                Interactive Timestamps Enabled
              </span>
            </div>

            {/* Simulated Video Feed Frame */}
            <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between p-4 select-none">
              {/* Dynamic video overlay graphics representing timeline seconds */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40 pointer-events-none" />
              
              {/* Spinning/pulsing graphic simulating video state */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {reviewVideoPlaying ? (
                  <div className="relative flex items-center justify-center">
                    <div className="absolute h-20 w-20 rounded-full border-2 border-purple-500/20 animate-ping" />
                    <Disc className="h-12 w-12 text-purple-400/85 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-black/60 border border-slate-750 flex items-center justify-center text-purple-400 backdrop-blur-xs">
                    <Play className="h-6 w-6 fill-current ml-1" />
                  </div>
                )}
              </div>

              {/* Top HUD bar */}
              <div className="flex justify-between items-start z-10 font-mono text-[9px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span>RESOL: 2160p ULTRA-HD</span>
                </div>
                <span>FPS: 60.00</span>
              </div>

              {/* Lower HUD status/overlay text showing content based on timestamp */}
              <div className="z-10 text-center text-[11px] font-bold text-slate-100 tracking-wide bg-black/50 py-1.5 px-3 rounded-lg border border-white/5 backdrop-blur-xs self-center">
                {reviewVideoTime < 15 ? (
                  <span>📦 [0:10] - Initial Outer Packaging & Casing Weight Audit</span>
                ) : reviewVideoTime >= 15 && reviewVideoTime < 45 ? (
                  <span>🎛️ [0:35] - Attenuator Knob Friction Sweep & Dial Resistances</span>
                ) : (
                  <span>🛡️ [1:15] - Active Noise Isolation Chamber Testing & Sound Graphs</span>
                )}
              </div>

              {/* Footer controls */}
              <div className="z-10 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewVideoPlaying(!reviewVideoPlaying)}
                      className="text-purple-400 hover:text-purple-300 font-extrabold uppercase transition-colors cursor-pointer"
                    >
                      {reviewVideoPlaying ? 'Pause Video' : 'Play Video'}
                    </button>
                    <span>|</span>
                    <span>0:{reviewVideoTime.toString().padStart(2, '0')} / 1:30</span>
                  </div>
                  <span className="text-slate-500">SEEK_FRAME: #{(reviewVideoTime * 60).toString().padStart(4, '0')}</span>
                </div>

                {/* Timeline slider */}
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={reviewVideoTime}
                  onChange={(e) => setReviewVideoTime(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </div>

            {/* Quick jump highlights board */}
            <div className="grid grid-cols-3 gap-2 font-mono text-[9px]">
              <button
                type="button"
                onClick={() => { setReviewVideoTime(10); setReviewVideoPlaying(true); }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  reviewVideoTime < 15 ? 'border-purple-500 bg-purple-950/20 text-purple-300 font-bold' : 'border-slate-850 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block text-[8px] text-slate-500 mb-0.5">STEP 1 (0:10)</span>
                Unboxing Frame
              </button>
              <button
                type="button"
                onClick={() => { setReviewVideoTime(35); setReviewVideoPlaying(true); }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  reviewVideoTime >= 15 && reviewVideoTime < 45 ? 'border-purple-500 bg-purple-950/20 text-purple-300 font-bold' : 'border-slate-850 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block text-[8px] text-slate-500 mb-0.5">STEP 2 (0:35)</span>
                Attenuator Sweep
              </button>
              <button
                type="button"
                onClick={() => { setReviewVideoTime(75); setReviewVideoPlaying(true); }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  reviewVideoTime >= 45 ? 'border-purple-500 bg-purple-950/20 text-purple-300 font-bold' : 'border-slate-850 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block text-[8px] text-slate-500 mb-0.5">STEP 3 (1:15)</span>
                Noise Isolation
              </button>
            </div>
          </div>

          {/* List of Reviews */}
          <div className="space-y-4">
            {productReviews.length > 0 ? (
              productReviews.map((rev) => (
                <div id={`review-item-${rev.id}`} key={rev.id} className={`rounded-2xl border p-5 space-y-2 ${
                  editorialMode ? 'border-slate-800 bg-slate-900/20' : 'border-slate-50 bg-white/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{rev.userName}</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <UserCheck className="h-2.5 w-2.5" />
                        <span>Verified Buyer</span>
                      </span>

                      {/* 55. Digital Unbox Achievements Badges */}
                      {(() => {
                        let revBadges: string[] = [];
                        if (rev.userName === 'Emma') revBadges = ['ergonomic_sensei'];
                        else if (rev.userName === 'Alex') revBadges = ['wearables_pioneer'];
                        else if (rev.userName === 'Sarah Connor') revBadges = ['audiophile_veteran'];
                        else if (rev.userName === currentUser.name) {
                          if (typeof window !== 'undefined') {
                            const b = localStorage.getItem('nexus_bazaar_badges');
                            revBadges = b ? JSON.parse(b) : ['audiophile_veteran'];
                          } else {
                            revBadges = ['audiophile_veteran'];
                          }
                        }

                        return revBadges.map(badgeId => {
                          const label = badgeId === 'audiophile_veteran' ? 'Audiophile Veteran' :
                                        badgeId === 'ergonomic_sensei' ? 'Ergonomic Sensei' :
                                        badgeId === 'wearables_pioneer' ? 'Wearables Pioneer' : 'Bug Hunter';
                          const color = badgeId === 'audiophile_veteran' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                                        badgeId === 'ergonomic_sensei' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                        badgeId === 'wearables_pioneer' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                          return (
                            <span key={badgeId} className={`inline-flex items-center gap-0.5 text-[8px] font-mono font-bold border px-1.5 py-0.5 rounded-full ${color}`} title={`${label} Badge`}>
                              ✨ {label}
                            </span>
                          );
                        });
                      })()}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{rev.date}</span>
                  </div>

                  <div className="flex items-center text-amber-400 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-slate-100'}`} />
                    ))}
                  </div>

                  <h4 className="text-xs font-bold">{rev.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{renderReviewText(rev.text)}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">No reviews submitted yet. Be the first to audit-validate this listing.</p>
            )}
          </div>

          {/* Create Review Form */}
          <div className="space-y-4">
            {/* 60. Active Review Bounty Alert */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200">
              <span className="text-xl">💰</span>
              <div className="space-y-1">
                <span className="font-bold block text-amber-300">ACTIVE REVIEW BOUNTY: Earn $15.00 Store Credits!</span>
                <span className="text-[11px] text-slate-400 leading-relaxed block">
                  The community treasury has posted a bounty on this equipment. Submit a detailed client review of <strong className="text-amber-400">40 characters or more</strong> to receive <strong className="text-teal-450">$15.00 in instant store credit</strong> on your loyalty ledger and unlock a digital category achievement badge!
                </span>
              </div>
            </div>

            {bountyClaimed && (
              <div id="review-bounty-claimed-banner" className="rounded-xl bg-teal-950/40 text-teal-400 p-4 text-xs font-semibold border border-teal-800 animate-bounce flex items-center gap-2">
                <span>✨</span>
                <span>Review Bounty Claimed! $15.00 in Store Credits have been wired to your Loyalty Ledger and an Audiophile Veteran achievement badge has been added to your profile!</span>
              </div>
            )}

            <form id="add-review-form" onSubmit={handleReviewSubmit} className={`rounded-2xl border p-5 space-y-4 ${
              editorialMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <h4 className="text-sm font-bold">Publish Client Evaluation</h4>
              
              {reviewSuccess && (
                <div id="review-success-banner" className="rounded-lg bg-emerald-950/40 text-emerald-400 p-3 text-xs font-medium border border-emerald-800">
                  ✓ Evaluation logs committed successfully to the local cache!
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Metric Score:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      id={`review-score-star-${stars}`}
                      key={stars}
                      type="button"
                      onClick={() => setReviewRating(stars)}
                      className={`text-lg transition-colors cursor-pointer ${stars <= reviewRating ? 'text-amber-400' : 'text-slate-700 hover:text-amber-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Headline</label>
                <input
                  id="review-title-input"
                  type="text"
                  required
                  placeholder="e.g. Exceptional response, solid craftsmanship"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/30 bg-white/5 p-2.5 text-xs text-slate-200 outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Evaluation Body</label>
                <textarea
                  id="review-text-input"
                  required
                  rows={3}
                  placeholder="Share your detailed assessment of product ergonomics, latency, design, etc..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/30 bg-white/5 p-2.5 text-xs text-slate-200 outline-none focus:border-teal-500"
                ></textarea>
                
                {/* Dynamic Sentiment AI Tagger */}
                {computedSentiment && (
                  <div 
                    id="evaluation-sentiment-ticker" 
                    className={`mt-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 flex items-center justify-between ${computedSentiment.color}`}
                  >
                    <span>{computedSentiment.label}</span>
                    <span className="opacity-60 text-[8px] font-mono">LIVE AI FEED</span>
                  </div>
                )}
              </div>

              <button
                id="submit-review-btn"
                type="submit"
                className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Commit Evaluation
              </button>
            </form>
          </div>
        </section>

        {/* Q&A SEGMENT (right 5 cols) */}
        <section id="details-qna-panel" className="lg:col-span-5 space-y-6">
          <div className="border-b border-slate-100/10 pb-3 flex flex-col gap-1">
            <h3 className="text-lg font-bold tracking-tight">Active Q&A Forum</h3>
            <p className="text-xs text-slate-400">Peer-to-peer specification clarifications</p>
          </div>

          {/* Q&A Real-time Search input */}
          <div className={`rounded-xl p-3 border ${
            editorialMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Filter Thread</span>
            <input
              id="qa-search-input"
              type="text"
              placeholder="Type keywords (e.g. cable, warranty, setup)..."
              value={qaSearchQuery}
              onChange={(e) => setQaSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-700/30 bg-white/5 p-2.5 text-xs text-slate-200 outline-none focus:border-teal-500"
            />
            {qaSearchQuery.trim() && (
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                <span>Found {productQas.length} relevant questions</span>
                <button
                  id="qa-clear-search-btn"
                  onClick={() => setQaSearchQuery('')}
                  className="font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* STORE CREDIT LEADERBOARD (Feature #16) */}
          <div className="rounded-xl p-3 border border-amber-100 bg-amber-50/20 space-y-2">
            <span className="text-[9px] font-mono font-bold text-amber-800 uppercase tracking-wider block">Contributor Store Credit Leaderboard</span>
            <div className="flex items-center justify-between text-[10px] text-slate-600">
              <span className="font-bold flex items-center gap-1"><span className="text-amber-500">★</span> Emma (Vetted Expert)</span>
              <span className="font-mono text-amber-800">+45 Credits earned</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-600">
              <span className="font-bold flex items-center gap-1"><span className="text-amber-500">★</span> Alex (Mechanical Lead)</span>
              <span className="font-mono text-amber-800">+24 Credits earned</span>
            </div>
          </div>

          {/* List of Questions */}
          <div className="space-y-4">
            {productQas.length > 0 ? (
              productQas.map((qa) => (
                <div id={`qa-item-${qa.id}`} key={qa.id} className={`rounded-2xl border p-4 space-y-3 shadow-xs ${
                  editorialMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-teal-600">
                        <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs font-bold">{qa.question}</span>
                      </div>
                      <p className="text-[9px] font-mono text-slate-500 pl-4.5">Asked by {qa.askedBy} • {qa.date}</p>
                    </div>

                    <button
                      onClick={() => handleUpvoteQa(qa.id)}
                      className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-400 hover:text-teal-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 cursor-pointer"
                    >
                      ▲ {(qaUpvotes[qa.id] || 0) + (qa.id.length % 5)}
                    </button>
                  </div>

                  {qa.answer ? (
                    <div className="bg-slate-800/45 rounded-xl p-3 border border-slate-800 ml-4.5 space-y-1.5 relative overflow-hidden">
                      <span className="absolute top-0 right-0 text-[7px] font-bold tracking-widest text-white uppercase bg-teal-600 px-1.5 py-0.5 rounded-bl-lg">
                        Vetted Reply
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-bold mr-1">A:</span>{qa.answer}
                      </p>
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <span>Answered by</span>
                        <span className="font-bold text-teal-400 inline-flex items-center gap-0.5 bg-teal-950 px-1.5 py-0.5 rounded-full">
                          {qa.answeredBy}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="ml-4.5 pl-1">
                      {/* Only Sellers or Admins can Answer */}
                      {(currentUser.role === UserRole.Seller || currentUser.role === UserRole.Admin) ? (
                        <div className="flex gap-2">
                          <input
                            id={`qa-answer-input-${qa.id}`}
                            type="text"
                            placeholder="Write seller/admin answer..."
                            value={answerTexts[qa.id] || ''}
                            onChange={(e) => setAnswerTexts({ ...answerTexts, [qa.id]: e.target.value })}
                            className="flex-1 rounded-lg border border-slate-700/30 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-teal-500"
                          />
                          <button
                            id={`qa-submit-answer-${qa.id}`}
                            onClick={() => handleAnswerSubmit(qa.id)}
                            className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">Pending vendor response...</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">No enquiries registered for this product.</p>
            )}
          </div>

          {/* Ask Question Form */}
          <form id="add-question-form" onSubmit={handleQuestionSubmit} className={`rounded-2xl border p-5 space-y-3 ${
            editorialMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <h4 className="text-sm font-bold">Register Specification Query</h4>
            
            {questionSuccess && (
              <div id="question-success-banner" className="rounded-lg bg-emerald-950/40 text-emerald-400 p-3 text-xs font-medium border border-emerald-800">
                ✓ Query submitted and awaiting response logs!
              </div>
            )}

            <div className="space-y-1.5">
              <input
                id="question-text-input"
                type="text"
                required
                placeholder="e.g. Does this package contain a spare cable?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full rounded-xl border border-slate-700/30 bg-white/5 p-2.5 text-xs text-slate-200 outline-none focus:border-teal-500"
              />
            </div>

            <button
              id="submit-question-btn"
              type="submit"
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Enquire Spec
            </button>
          </form>
        </section>

      </div>

      {/* FEATURE 91: CLIENT-SIDE SEMANTIC RECOMMENDATIONS */}
      {semanticRecommendations.length > 0 && (
        <section id="semantic-recommendations-section" className="border-t border-slate-200/60 pt-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 pb-3">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-slate-800">
                <Sparkles className="h-5 w-5 text-teal-600 animate-pulse" />
                Edge-Computed Semantic Alternatives
              </h3>
              <p className="text-xs text-slate-500">
                Lightweight, private client-side vector matching based on specification and feature overlap matrices.
              </p>
            </div>
            <span className="text-[9px] font-mono bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest self-start sm:self-auto">
              100% Private Client-Side Matching
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {semanticRecommendations.map((rec) => (
              <div 
                key={rec.id} 
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-teal-500/50"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center p-4">
                    <img 
                      src={rec.image} 
                      alt={rec.name} 
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 rounded-lg bg-teal-600 px-2 py-0.5 text-[8px] font-mono text-white font-extrabold uppercase tracking-widest">
                      Similarity Match
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-teal-600 uppercase tracking-widest block font-bold">{rec.category} • {rec.brand}</span>
                    <h4 className="text-sm font-bold text-slate-850 line-clamp-1 group-hover:text-teal-700 transition-colors">
                      {rec.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {rec.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                  <span className="font-mono font-black text-slate-900 text-sm">
                    ${rec.price}
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => onAddToCart(rec)}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/40 text-[10px] font-bold transition-all uppercase cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        alert(`Analyzing alternative: ${rec.name}`);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold transition-all uppercase cursor-pointer"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
