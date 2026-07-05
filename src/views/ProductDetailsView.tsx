/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  Star, 
  Crown, 
  MessageSquare, 
  HelpCircle,
  Clock,
  UserCheck,
  Sparkles,
  Cpu,
  Send,
  Eye,
  Settings
} from 'lucide-react';
import { Product, Review, QA, User, UserRole } from '../lib/db';

interface ProductDetailsViewProps {
  product: Product;
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
}

export default function ProductDetailsView({
  product,
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
}: ProductDetailsViewProps) {
  // Image Hover Zoom effect
  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties>({ transform: 'scale(1)' });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
    if (!holoEnabled) return;
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
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 25) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let i = 0; i < h; i += 20) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }

      // Projection Beam Glow
      const beamGrad = ctx.createLinearGradient(cx, h, cx, cy - 10);
      let coreColor = 'rgba(6, 182, 212, '; // cyan
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
  }, [holoEnabled, holoColor, holoRotSpeed, holoBeamDensity, holoNoise]);

  // Live Counter-Offer Bidding Bartering Engine (Feature #21)
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
          // Import/execute direct to localStorage to keep it consistent
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

  // Real-time keyword sentiment heuristics (Feature #14)
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

  // State variables for review star-filter & Q&A search query
  const [selectedStarFilter, setSelectedStarFilter] = React.useState<number | null>(null);
  const [qaSearchQuery, setQaSearchQuery] = React.useState('');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewText.trim()) return;
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

  // Filter dynamic review records for the current product
  const rawProductReviews = reviews.filter((r) => r.productId === product.id);
  const productReviews = selectedStarFilter !== null
    ? rawProductReviews.filter((r) => r.rating === selectedStarFilter)
    : rawProductReviews;

  // Filter and search active product Q&As
  const rawProductQas = qas.filter((q) => q.productId === product.id);
  const productQas = qaSearchQuery.trim()
    ? rawProductQas.filter((qa) => 
        qa.question.toLowerCase().includes(qaSearchQuery.toLowerCase()) || 
        (qa.answer && qa.answer.toLowerCase().includes(qaSearchQuery.toLowerCase()))
      )
    : rawProductQas;

  // Dynamic pricing
  const finalPrice = product.isElite && currentUser.isElite 
    ? Math.round(product.price * 0.9) 
    : product.price;

  // Calculate percentages based on raw unfiltered reviews count
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const matchingCount = rawProductReviews.filter((r) => r.rating === stars).length;
    const pct = rawProductReviews.length > 0 ? (matchingCount / rawProductReviews.length) * 100 : 0;
    return { stars, count: matchingCount, pct };
  });

  return (
    <div id="product-details-container" className="pb-16 space-y-12 animate-fade-in">
      
      {/* Back button */}
      <button
        id="details-back-btn"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 uppercase tracking-wider transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Listing</span>
      </button>

      {/* PRIMARY COLUMN GRID */}
      <div id="details-main-grid" className="grid gap-8 md:grid-cols-2">
        
        {/* LEFT COLUMN: Zoomable Image Card & Holographic AR Projection Sandbox */}
        <div className="space-y-6">
          <div id="details-image-card" className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm p-4 flex flex-col justify-center">
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
            <p className="text-[10px] text-center text-slate-400 mt-3 font-mono">
              Hover or slide cursor over image to zoom and inspect quality details
            </p>
          </div>

          {/* HOLOGRAPHIC AR PROJECTION SANDBOX (Feature #20) */}
          <div id="holo-ar-sandbox" className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                AR Projection Node
              </span>
              <button
                type="button"
                onClick={() => setHoloEnabled(!holoEnabled)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  holoEnabled ? 'bg-cyan-500 hover:bg-cyan-600 text-slate-900 shadow-md shadow-cyan-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {holoEnabled ? 'Online (Click to Shut Down)' : 'Activate Hologram'}
              </button>
            </div>

            {holoEnabled ? (
              <div className="space-y-4">
                <div className="relative rounded-xl border border-slate-800 bg-slate-950/80 p-1 flex justify-center items-center h-[240px]">
                  <canvas ref={holoCanvasRef} width={340} height={230} className="w-full h-[230px] block" />
                  
                  {/* Visual controls overlays */}
                  <div className="absolute top-3 left-3 text-[9px] font-mono text-slate-500 flex flex-col gap-0.5 pointer-events-none">
                    <span>GRID: LOCK_SECURE</span>
                    <span>BEAMS: {holoBeamDensity * 4} PTS</span>
                    <span>CYCLES: {holoRotSpeed.toFixed(1)}Hz</span>
                  </div>

                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setHoloColor('cyan')}
                      className={`h-4 w-4 rounded-full bg-cyan-400 border-2 transition-all cursor-pointer ${holoColor === 'cyan' ? 'border-white scale-110' : 'border-transparent'}`}
                    />
                    <button 
                      type="button"
                      onClick={() => setHoloColor('amber')}
                      className={`h-4 w-4 rounded-full bg-amber-500 border-2 transition-all cursor-pointer ${holoColor === 'amber' ? 'border-white scale-110' : 'border-transparent'}`}
                    />
                    <button 
                      type="button"
                      onClick={() => setHoloColor('emerald')}
                      className={`h-4 w-4 rounded-full bg-emerald-500 border-2 transition-all cursor-pointer ${holoColor === 'emerald' ? 'border-white scale-110' : 'border-transparent'}`}
                    />
                  </div>

                  <div className="absolute bottom-3 left-3 text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800/30">
                    {product.name.split(' ')[0]} 3D Matrix Model
                  </div>
                </div>

                {/* Sliders panel */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold font-mono text-slate-400 block uppercase">Rot. Speed</label>
                    <input 
                      type="range" min="0.2" max="3" step="0.1" value={holoRotSpeed} 
                      onChange={(e) => setHoloRotSpeed(Number(e.target.value))}
                      className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold font-mono text-slate-400 block uppercase">Beam Density</label>
                    <input 
                      type="range" min="1" max="5" step="1" value={holoBeamDensity} 
                      onChange={(e) => setHoloBeamDensity(Number(e.target.value))}
                      className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold font-mono text-slate-400 block uppercase">Glitch Factor</label>
                    <input 
                      type="range" min="0" max="4" step="1" value={holoNoise} 
                      onChange={(e) => setHoloNoise(Number(e.target.value))}
                      className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-slate-800 bg-slate-950/20 text-center space-y-2">
                <Cpu className="h-8 w-8 text-slate-700 animate-pulse" />
                <p className="text-xs font-semibold text-slate-400">Tactile Dimension Projection Node Offline</p>
                <p className="text-[10px] text-slate-600 max-w-xs px-4">
                  Boot up the simulated quantum wireframe projection device to inspect exact mechanical and structural schematics.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: DETAILS CONTROLS */}
        <div id="details-controls-card" className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category and brand path */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest leading-none">
              <span>{product.brand}</span>
              <span>/</span>
              <span className="text-teal-600 font-bold">{product.category}</span>
            </div>

            {/* Title */}
            <h2 id="details-product-title" className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h2>

            {/* Rating overview */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({productReviews.length} Verified Reviewers)</span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-500 leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Specs Specs list */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Specifications Log</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Manufacturer</span><span className="font-semibold text-slate-700">{product.brand}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Stock Available</span><span className={`font-semibold ${product.stock <= 3 ? 'text-red-500' : 'text-slate-700'}`}>{product.stock} units</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Category segment</span><span className="font-semibold text-slate-700">{product.category}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Merchant</span><span className="font-semibold text-teal-600">{product.sellerName}</span></div>
              </div>
            </div>
          </div>

          {/* Pricing Box & Call-To-Action */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider mb-1">Pricing Ledger</span>
                {product.isElite && currentUser.isElite ? (
                  <div className="flex items-baseline gap-2">
                    <span id="details-price-tag" className="text-3xl font-black text-teal-600">${finalPrice}</span>
                    <span className="text-sm text-slate-400 line-through">${product.price}</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">Elite 10% Discount applied!</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span id="details-price-tag" className="text-3xl font-black text-slate-800">${product.price}</span>
                    {product.isElite && !currentUser.isElite && (
                      <span className="text-[10px] text-amber-600 font-medium">Join Elite to save 10%!</span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Logistics Class</span>
                <span className="text-xs font-bold text-slate-700">Priority Hub Delivery</span>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Wishlist Button */}
              <button
                id="details-wishlist-toggle"
                onClick={() => onToggleWishlist(product)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all ${
                  isWishlisted 
                    ? 'border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100' 
                    : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>

              {/* Add to Cart Button */}
              <button
                id="details-add-to-cart-btn"
                onClick={() => onAddToCart(product)}
                disabled={product.stock <= 0}
                className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold text-white shadow-sm transition-all ${
                  product.stock > 0
                    ? 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{product.stock > 0 ? 'Commit to Cart' : 'Currently Out of Stock'}</span>
              </button>
            </div>
          </div>

          {/* LIVE COUNTER-OFFER BIDDING BARTERING ENGINE (Feature #21) */}
          <div id="bidding-barter-engine" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-teal-600 animate-pulse" />
                Live AI Merchant Haggling Node
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 uppercase">
                Active Session
              </span>
            </div>

            {/* Chat Messages Panel */}
            <div className="h-[150px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 space-y-3 font-sans text-xs">
              {biddingMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-teal-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
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
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-6 pr-3 text-xs text-slate-800 outline-none transition-all focus:border-teal-500"
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
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center space-y-2">
                <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                  <UserCheck className="h-4 w-4" /> Bidding Settlement Reached!
                </p>
                <p className="text-[10px] text-emerald-600">
                  Your offer of <span className="font-bold">${negotiatedPrice} credits</span> was approved. Use promo code:
                </p>
                <div className="inline-block bg-white border border-emerald-300 rounded-lg px-3 py-1 font-mono font-black text-xs text-emerald-700 tracking-wider shadow-xs animate-pulse">
                  {forgedVoucherCode}
                </div>
                <p className="text-[9px] text-slate-400">
                  Voucher has been forged in the system registry. Enter it at checkout to claim!
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* DISCUSSIONS & REVIEWS DUAL TABS */}
      <div id="details-discussions-grid" className="grid gap-8 lg:grid-cols-12 border-t border-slate-100 pt-10">
        
        {/* REVIEWS SEGMENT (left 7 cols) */}
        <section id="details-reviews-panel" className="lg:col-span-7 space-y-6">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Verified Buyer Review Logs</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sourced from decentralized audit-validated purchases</p>
          </div>

          {/* Rating aggregate panel */}
          <div className="flex flex-col sm:flex-row gap-6 rounded-2xl border border-slate-100 p-5 bg-white shadow-sm">
            <div className="text-center sm:border-r sm:border-slate-100 sm:pr-8 flex flex-col justify-center">
              <span className="text-5xl font-black text-slate-800 tracking-tight">{product.rating.toFixed(1)}</span>
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
                        ? 'bg-amber-50/70 border border-amber-200 shadow-xs scale-102' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                    title={`Click to filter by ${tier.stars} stars`}
                  >
                    <span className="font-mono text-slate-400 w-3 text-left">{tier.stars}</span>
                    <Star className={`h-3.5 w-3.5 ${isSelected ? 'text-amber-500 fill-amber-500' : 'text-amber-400 fill-current'}`} />
                    <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
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
            <div id="active-star-filter-indicator" className="flex items-center justify-between bg-amber-50/75 border border-amber-200 rounded-xl p-3 text-xs animate-fade-in shadow-xs">
              <span className="text-amber-900 font-medium">
                Showing only <strong>{selectedStarFilter}-Star</strong> reviews
              </span>
              <button
                id="reset-star-filter-btn"
                onClick={() => setSelectedStarFilter(null)}
                className="text-[10px] font-bold text-amber-700 bg-white border border-amber-200 rounded-lg px-2.5 py-1 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* List of Reviews */}
          <div className="space-y-4">
            {productReviews.length > 0 ? (
              productReviews.map((rev) => (
                <div id={`review-item-${rev.id}`} key={rev.id} className="rounded-2xl border border-slate-50 bg-white/50 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <UserCheck className="h-2.5 w-2.5" />
                        <span>Verified Buyer</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{rev.date}</span>
                  </div>

                  <div className="flex items-center text-amber-400 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-slate-100'}`} />
                    ))}
                  </div>

                  <h4 className="text-xs font-bold text-slate-800">{rev.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{rev.text}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">No reviews submitted yet. Be the first to audit-validate this listing.</p>
            )}
          </div>

          {/* Create Review Form */}
          <form id="add-review-form" onSubmit={handleReviewSubmit} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Publish Client Evaluation</h4>
            
            {reviewSuccess && (
              <div id="review-success-banner" className="rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-100 animate-fade-in">
                ✓ Evaluation logs committed successfully to the local cache!
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Metric Score:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    id={`review-score-star-${stars}`}
                    key={stars}
                    type="button"
                    onClick={() => setReviewRating(stars)}
                    className={`text-lg transition-colors ${stars <= reviewRating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Headline</label>
              <input
                id="review-title-input"
                type="text"
                required
                placeholder="e.g. Exceptional response, solid craftsmanship"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Evaluation Body</label>
              <textarea
                id="review-text-input"
                required
                rows={3}
                placeholder="Share your detailed assessment of product ergonomics, latency, design, etc..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
              ></textarea>
              
              {/* Dynamic Sentiment AI Tagger */}
              {computedSentiment && (
                <div 
                  id="evaluation-sentiment-ticker" 
                  className={`mt-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 animate-fade-in flex items-center justify-between ${computedSentiment.color}`}
                >
                  <span>{computedSentiment.label}</span>
                  <span className="opacity-60 text-[8px] font-mono">LIVE AI FEED</span>
                </div>
              )}
            </div>

            <button
              id="submit-review-btn"
              type="submit"
              className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors"
            >
              Commit Evaluation
            </button>
          </form>
        </section>

        {/* Q&A SEGMENT (right 5 cols) */}
        <section id="details-qna-panel" className="lg:col-span-5 space-y-6">
          <div className="border-b border-slate-50 pb-3 flex flex-col gap-1">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active Q&A Forum</h3>
            <p className="text-xs text-slate-400">Peer-to-peer specification clarifications</p>
          </div>

          {/* Q&A Real-time Search input */}
          <div className="space-y-1.5 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Filter Thread</span>
            <input
              id="qa-search-input"
              type="text"
              placeholder="Type keywords (e.g. cable, warranty, setup)..."
              value={qaSearchQuery}
              onChange={(e) => setQaSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
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

          {/* List of Questions */}
          <div className="space-y-4">
            {productQas.length > 0 ? (
              productQas.map((qa) => (
                <div id={`qa-item-${qa.id}`} key={qa.id} className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-teal-600">
                      <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs font-bold text-slate-800">{qa.question}</span>
                    </div>
                    <p className="text-[9px] font-mono text-slate-400 pl-4.5">Asked by {qa.askedBy} • {qa.date}</p>
                  </div>

                  {qa.answer ? (
                    <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 ml-4.5 space-y-1.5 relative overflow-hidden">
                      <span className="absolute top-0 right-0 text-[7px] font-bold tracking-widest text-white uppercase bg-teal-600 px-1.5 py-0.5 rounded-bl-lg">
                        Vetted Reply
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-800 mr-1">A:</span>{qa.answer}
                      </p>
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <span>Answered by</span>
                        <span className="font-bold text-teal-600 inline-flex items-center gap-0.5 bg-teal-50 px-1.5 py-0.5 rounded-full">
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
                            className="flex-1 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                          />
                          <button
                            id={`qa-submit-answer-${qa.id}`}
                            onClick={() => handleAnswerSubmit(qa.id)}
                            className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">Pending vendor response...</p>
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
          <form id="add-question-form" onSubmit={handleQuestionSubmit} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Register Specification Query</h4>
            
            {questionSuccess && (
              <div id="question-success-banner" className="rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-100 animate-fade-in">
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
                className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
              />
            </div>

            <button
              id="submit-question-btn"
              type="submit"
              className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors"
            >
              Enquire Spec
            </button>
          </form>
        </section>

      </div>

    </div>
  );
}
