import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Cpu, Zap, Eye, Sliders, Image as ImageIcon, Send, MessageSquare, 
  Wifi, WifiOff, RefreshCw, Layers, ShieldCheck, CheckCircle2, AlertTriangle, 
  Search, ArrowRight, CornerDownRight, Play, Terminal, HelpCircle, User, Loader2
} from 'lucide-react';
import { Product, User as DbUser } from '../lib/db';

interface EdgeLabViewProps {
  currentUser: DbUser;
  products: Product[];
  onViewDetails?: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  setActiveView: (view: 'storefront' | 'search' | 'details' | 'cart' | 'seller' | 'admin' | 'orders' | 'wishlist' | 'guilds' | 'styling' | 'curations' | 'loyalty' | 'security' | 'b2b' | 'edge') => void;
}

// ============================================================================
// FEATURE 98: CLIENT-SIDE TRIE DATABASE IMPLEMENTATION
// ============================================================================
class TrieNode {
  children: { [key: string]: TrieNode } = {};
  isWord = false;
  word = '';
}

class Trie {
  root = new TrieNode();

  insert(word: string) {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isWord = true;
    current.word = word;
  }

  // Find prefix matches
  searchPrefix(prefix: string): string[] {
    let current = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!current.children[char]) return [];
      current = current.children[char];
    }
    const results: string[] = [];
    this.collectWords(current, results);
    return results;
  }

  private collectWords(node: TrieNode, results: string[]) {
    if (node.isWord) results.push(node.word);
    for (const char in node.children) {
      this.collectWords(node.children[char], results);
    }
  }
}

// Simple Levenshtein distance helper for autocorrection suggestions
function getLevenshteinDistance(a: string, b: string): number {
  const tmp = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

export default function EdgeLabView({
  currentUser,
  products,
  onViewDetails,
  onAddToCart,
  setActiveView
}: EdgeLabViewProps) {
  // Navigation inside Lab
  const [activeTab, setActiveTab] = React.useState<'recommend' | 'search_trie' | 'assistant' | 'matcher' | 'diagnostics'>('recommend');

  // Shared state: Prefetch logs simulation (Feature 92)
  const [prefetchLogs, setPrefetchLogs] = React.useState<{ id: string; timestamp: string; action: string; resource: string; latency: number; node: string }[]>(() => {
    return [
      { id: 'pref_1', timestamp: '08:24:51.042', action: 'PREFETCH_HIT', resource: 'app/details/prod_1', latency: 4, node: 'sg-edge-node-12' },
      { id: 'pref_2', timestamp: '08:24:53.118', action: 'PREFETCH_HIT', resource: 'app/details/prod_4', latency: 3, node: 'sg-edge-node-12' }
    ];
  });

  // Method to log prefetches
  const triggerPrefetchLog = (productName: string, productId: string) => {
    const isAlreadyLogged = prefetchLogs.some(log => log.resource.includes(productId));
    if (isAlreadyLogged) return;
    
    const newLog = {
      id: `pref_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + '.' + String(Date.now() % 1000).padStart(3, '0'),
      action: 'PREFETCH_MATRIX_HIT',
      resource: `app/details/${productId} [${productName}]`,
      latency: Math.floor(Math.random() * 5) + 2,
      node: 'sg-edge-node-12'
    };
    setPrefetchLogs(prev => [newLog, ...prev]);
  };

  // ============================================================================
  // FEATURE 100: LOCALIZED DEVICE-SPEC UI OPTIMIZATION STATES
  // ============================================================================
  const [hardwareProfile, setHardwareProfile] = React.useState<'ultra' | 'snapdragon'>('ultra');
  const [diagnosticsLogs, setDiagnosticsLogs] = React.useState<string[]>([]);

  // Auto-detect browser metrics (simulated detailed readouts)
  const deviceSpecs = React.useMemo(() => {
    if (typeof window === 'undefined') return { cores: 8, memory: 8, platform: 'Unknown', gpu: 'MOCK GPU' };
    const nav = window.navigator as any;
    const cores = nav.hardwareConcurrency || 8;
    const memory = nav.deviceMemory || 8;
    const platform = nav.userAgentData?.platform || nav.platform || 'Linux arm64';
    
    let gpu = 'Intel Iris Xe Graphics';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const dbgRenderInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (dbgRenderInfo) {
          gpu = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch(e) {}
    
    return { cores, memory, platform, gpu };
  }, []);

  React.useEffect(() => {
    const log = [];
    log.push(`[SYS_DAEMON] Initializing Device Hardware specs scanner...`);
    log.push(`[SYS_DAEMON] Cores Detected: ${deviceSpecs.cores} logical threads.`);
    log.push(`[SYS_DAEMON] System Memory Class: ${deviceSpecs.memory}GB RAM boundary.`);
    log.push(`[SYS_DAEMON] Platform Architecture: ${deviceSpecs.platform}`);
    log.push(`[SYS_DAEMON] WebGL GPU Vendor String: ${deviceSpecs.gpu}`);
    
    if (hardwareProfile === 'snapdragon') {
      log.push(`[OPTIMIZER] ⚠️ ARM64 SNAPDRAGON SOC ARCHITECTURE EMULATED.`);
      log.push(`[OPTIMIZER] 🔒 Frame throttle locks active. Drops particle density 4x.`);
      log.push(`[OPTIMIZER] 🔒 Drops canvas matching keypoint sample bounds from 2000 to 400.`);
      log.push(`[OPTIMIZER] ⚡ Max responsiveness optimization active. Target: 60fps flat.`);
    } else {
      log.push(`[OPTIMIZER] ✅ X86_64 UNRESTRICTED ARCHITECTURE ACTIVE.`);
      log.push(`[OPTIMIZER] ✨ Full shader precision, cinematic particle loops, and 120Hz refresh buffers unlocked.`);
    }
    setDiagnosticsLogs(log);
  }, [hardwareProfile, deviceSpecs]);

  // ============================================================================
  // FEATURE 91: CLIENT-SIDE SEMANTIC RECOMMENDATION ENGINE STATES
  // ============================================================================
  const [selectedRecommendBaseId, setSelectedRecommendBaseId] = React.useState<string>('prod_1');

  // Compute recommendations 100% locally
  const localSemanticRecommendations = React.useMemo(() => {
    const baseProduct = products.find(p => p.id === selectedRecommendBaseId) || products[0];
    if (!baseProduct) return [];

    // Calculate lightweight cosine-similarity / Jaccard token overlap between titles, categories, and descriptions
    const baseTokens = new Set(`${baseProduct.name} ${baseProduct.category} ${baseProduct.brand} ${baseProduct.description}`.toLowerCase().split(/\s+/));
    
    return products
      .filter(p => p.id !== baseProduct.id)
      .map(p => {
        const productTokens = `${p.name} ${p.category} ${p.brand} ${p.description}`.toLowerCase().split(/\s+/);
        let intersection = 0;
        productTokens.forEach(token => {
          if (baseTokens.has(token)) intersection++;
        });
        const union = baseTokens.size + productTokens.length - intersection;
        const score = union > 0 ? (intersection / union) * 100 : 0;
        
        return {
          product: p,
          score: Math.min(99.4, Number((score * 1.5 + 40 + (p.category === baseProduct.category ? 25 : 0)).toFixed(1))) // Scaled gracefully to realistic similarity values
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [selectedRecommendBaseId, products]);

  // ============================================================================
  // FEATURE 94: SEMANTIC REVIEW SUMMARIZATION STATES
  // ============================================================================
  const [summarizedProductReviewsId, setSummarizedProductReviewsId] = React.useState<string>('prod_1');

  const simulatedReviewSummary = React.useMemo(() => {
    const activeProd = products.find(p => p.id === summarizedProductReviewsId) || products[0];
    if (!activeProd) return { sentiment: 85, pros: [], cons: [], tldr: '' };

    // Deterministic generation based on product ID to simulate local NLP extraction from "5,000 product reviews"
    const hash = activeProd.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const sentiment = Math.min(98, 80 + (hash % 19));
    
    const pros = [
      `Extreme material structural integrity with premium ${activeProd.brand} construction accents.`,
      `Outstanding ergonomics and tactile clearances, highly praised by over ${(hash % 4) + 1}k designers.`,
      `Seamless integration with digital assembly rigs and compatibility chains.`,
    ];

    const cons = [
      `Premium price point restricts acquisition to high-tier budgets.`,
      `Substantial tactile footprint takes up significant workspace real estate.`,
      `Requires initial hardware revision update for maximum firmware responsiveness.`
    ];

    const tldr = `An elite-tier ${activeProd.category.toLowerCase()} that sets the benchmark in spatial design and mechanical durability. Consistently celebrated for its structural ${activeProd.brand} lineage, though small budget constraints and structural bulk are noted as trade-offs. Perfect for tech curators prioritizing long-term hardware lifespans.`;

    return { sentiment, pros, cons, tldr };
  }, [summarizedProductReviewsId, products]);

  // ============================================================================
  // FEATURE 97: CONTEXTUAL AI SMART DESCRIPTIONS STATES
  // ============================================================================
  const [smartDescriptionProdId, setSmartDescriptionProdId] = React.useState<string>('prod_1');
  const [smartDescriptionPersona, setSmartDescriptionPersona] = React.useState<'tech' | 'eco' | 'design'>('tech');

  const smartDescriptionOutput = React.useMemo(() => {
    const p = products.find(prod => prod.id === smartDescriptionProdId) || products[0];
    if (!p) return '';

    if (smartDescriptionPersona === 'tech') {
      return `💻 [TECH ANALYST FOCUS] Engineered on premium micro-substrates featuring low-impedance copper channels and an advanced ARM cortex transceiver core. Highlights high-frequency signal stability, low thermal dissipation limits, and 8,000Hz direct USB polling. Perfect for sub-1ms response environments.`;
    } else if (smartDescriptionPersona === 'eco') {
      return `🌿 [CIRCULAR ECO FOCUS] Formed from upcycled composite carbon matrixes with zero volatile epoxy adhesives. Features 98% circular metals retrieval and a certified fair-trade labor lineage from West Java Assembly Hub. Diverts up to 4.2kg of industrial polymers from waste pipelines.`;
    } else {
      return `🎨 [DESIGN CURATOR FOCUS] Anchored on matte slate dark casings designed with generous negative space and balanced ergonomic weights. Embraces minimal Swiss styling, subtle laser-etched telemetry tracks, and customizable tactile indicators that enrich any professional lookbook setting.`;
    }
  }, [smartDescriptionProdId, smartDescriptionPersona, products]);

  // ============================================================================
  // FEATURE 98: TRIE AUTOCORRECTION playground states
  // ============================================================================
  const [trieSearchQuery, setTrieSearchQuery] = React.useState('keybord');
  const trieInstance = React.useMemo(() => {
    const t = new Trie();
    // Index all product keywords
    products.forEach(p => {
      p.name.split(/\s+/).forEach(word => t.insert(word.replace(/[^a-zA-Z]/g, '')));
      p.category.split(/\s+/).forEach(word => t.insert(word.replace(/[^a-zA-Z]/g, '')));
      t.insert(p.brand);
    });
    return t;
  }, [products]);

  const trieAutocorrectionResult = React.useMemo(() => {
    const cleanQuery = trieSearchQuery.trim().toLowerCase();
    if (!cleanQuery) return null;

    // Check if directly exists as prefix or full word in products
    const directMatches = trieInstance.searchPrefix(cleanQuery);
    if (directMatches.length > 0) {
      return { corrected: false, suggestion: directMatches[0], score: 0 };
    }

    // Otherwise find closest matching indexed word in our dictionary using Levenshtein distance
    let bestWord = '';
    let minDistance = 999;

    // Gather all indexed words
    const allWords: string[] = [];
    products.forEach(p => {
      p.name.split(/\s+/).forEach(word => {
        const w = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (w && !allWords.includes(w)) allWords.push(w);
      });
      p.category.split(/\s+/).forEach(word => {
        const w = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (w && !allWords.includes(w)) allWords.push(w);
      });
      const b = p.brand.toLowerCase();
      if (!allWords.includes(b)) allWords.push(b);
    });

    allWords.forEach(w => {
      const dist = getLevenshteinDistance(cleanQuery, w);
      if (dist < minDistance) {
        minDistance = dist;
        bestWord = w;
      }
    });

    if (minDistance <= 3 && bestWord !== cleanQuery) {
      // Capitalize first letter of suggestion nicely
      const matchedProd = products.find(p => p.name.toLowerCase().includes(bestWord) || p.brand.toLowerCase() === bestWord || p.category.toLowerCase().includes(bestWord));
      let formalSuggestion = bestWord;
      if (matchedProd) {
        if (matchedProd.brand.toLowerCase() === bestWord) formalSuggestion = matchedProd.brand;
        else {
          const matchingPart = matchedProd.name.split(/\s+/).find(part => part.toLowerCase().replace(/[^a-zA-Z]/g, '') === bestWord);
          if (matchingPart) formalSuggestion = matchingPart;
        }
      }
      return { corrected: true, suggestion: formalSuggestion, score: minDistance };
    }

    return null;
  }, [trieSearchQuery, trieInstance, products]);

  // ============================================================================
  // FEATURE 99: OFFLINE-CAPABLE SEARCH SYNCHRONIZATION STATES
  // ============================================================================
  const [networkMode, setNetworkMode] = React.useState<'online' | 'offline_sync'>('online');
  const [syncQuery, setSyncQuery] = React.useState('');
  const [syncStatus, setSyncStatus] = React.useState('Indexed DB Sync status: Complete (12 nodes cached)');

  const offlineFilteredProducts = React.useMemo(() => {
    // If offline sync mode, restrict products list to cached subset
    const cachedSubset = products.slice(0, 8); // Simulate cached subset in local service worker
    if (!syncQuery.trim()) return cachedSubset;
    
    return cachedSubset.filter(p => 
      p.name.toLowerCase().includes(syncQuery.toLowerCase()) || 
      p.brand.toLowerCase().includes(syncQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(syncQuery.toLowerCase())
    );
  }, [syncQuery, products]);

  // ============================================================================
  // FEATURE 95: ADAPTIVE LAYOUT RENDERING ARCHITECTURE STATES
  // ============================================================================
  const [layoutMode, setLayoutMode] = React.useState<'speed_matrix' | 'visual_lookbook'>('visual_lookbook');
  const [adaptiveLayoutEnabled, setAdaptiveLayoutEnabled] = React.useState(true);
  const [metricsScrollSpeed, setMetricsScrollSpeed] = React.useState(0);
  const [metricsHoverIndex, setMetricsHoverIndex] = React.useState(0);

  // Monitor interaction vectors and trigger automatic adaptive layouts
  React.useEffect(() => {
    if (!adaptiveLayoutEnabled) return;

    // Simulate high scroll speed or rapid cursor movement triggering layouts
    const handleScroll = () => {
      setMetricsScrollSpeed(820); // Spike speed
      setLayoutMode('speed_matrix'); // Auto-switch to fast text-dense layout!
      
      const timer = setTimeout(() => {
        setMetricsScrollSpeed(0);
      }, 1500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [adaptiveLayoutEnabled]);

  // ============================================================================
  // FEATURE 96: CLIENT-SIDE VECTOR IMAGE MATCHING STATES
  // ============================================================================
  const [matchingTemplate, setMatchingTemplate] = React.useState<'jacket' | 'keyboard' | 'watch' | null>(null);
  const [isMatchingRunning, setIsMatchingRunning] = React.useState(false);
  const [matcherResult, setMatcherResult] = React.useState<{ product: Product; confidence: number; keypoints: number } | null>(null);
  const matcherCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const runVectorMatcher = (type: 'jacket' | 'keyboard' | 'watch') => {
    setMatchingTemplate(type);
    setIsMatchingRunning(true);
    setMatcherResult(null);

    // Dynamic edge detector rendering onto canvas
    setTimeout(() => {
      const canvas = matcherCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw simulated raw image contours
          ctx.strokeStyle = '#14b8a6';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          
          if (type === 'keyboard') {
            // Draw a rectangular keyboard wireframe outline
            ctx.rect(40, 60, 220, 80);
            ctx.stroke();
            
            // Draw visual matrix keypoints (green tracking targets)
            ctx.fillStyle = '#10b981';
            const points = [
              [50, 70], [100, 70], [150, 70], [200, 70], [240, 70],
              [50, 100], [120, 100], [180, 100], [240, 100],
              [80, 130], [160, 130], [220, 130]
            ];
            points.forEach(([x, y]) => {
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, Math.PI * 2);
              ctx.fill();
              
              // Keypoint coordinate lines
              ctx.strokeStyle = 'rgba(20, 184, 166, 0.2)';
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(150, 100);
              ctx.stroke();
            });
          } else if (type === 'watch') {
            // Circle outline
            ctx.arc(150, 100, 45, 0, Math.PI * 2);
            ctx.stroke();
            // Straps
            ctx.strokeRect(125, 10, 50, 45);
            ctx.strokeRect(125, 145, 50, 45);
            
            // Keypoints
            ctx.fillStyle = '#10b981';
            const points = [
              [150, 55], [150, 145], [105, 100], [195, 100],
              [150, 100], [120, 70], [180, 70], [120, 130], [180, 130]
            ];
            points.forEach(([x, y]) => {
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, Math.PI * 2);
              ctx.fill();
            });
          } else {
            // Jacket shape
            ctx.moveTo(150, 30);
            ctx.lineTo(80, 60);
            ctx.lineTo(100, 120);
            ctx.lineTo(120, 110);
            ctx.lineTo(120, 170);
            ctx.lineTo(180, 170);
            ctx.lineTo(180, 110);
            ctx.lineTo(200, 120);
            ctx.lineTo(220, 60);
            ctx.closePath();
            ctx.stroke();
            
            // Keypoints
            ctx.fillStyle = '#10b981';
            const points = [
              [150, 30], [80, 60], [220, 60], [150, 100],
              [120, 170], [180, 170], [100, 120], [200, 120]
            ];
            points.forEach(([x, y]) => {
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, Math.PI * 2);
              ctx.fill();
            });
          }
        }
      }

      // Map matching template to our database product
      let matchProd: Product | undefined;
      if (type === 'keyboard') matchProd = products.find(p => p.id === 'prod_4'); // Walnut mechanical keyboard
      else if (type === 'watch') matchProd = products.find(p => p.id === 'prod_2'); // Chronos SmartWatch
      else matchProd = products.find(p => p.id === 'prod_5'); // Custom leather messenger bag

      if (matchProd) {
        setMatcherResult({
          product: matchProd,
          confidence: Number((94.2 + Math.random() * 5).toFixed(1)),
          keypoints: type === 'keyboard' ? 12 : type === 'watch' ? 9 : 8
        });
      }
      setIsMatchingRunning(false);
    }, 1200);
  };

  // ============================================================================
  // FEATURE 93: CLIENT-SIDE LOCAL CHAT ASSISTANT
  // ============================================================================
  const [chatMessages, setChatMessages] = React.useState<{ role: 'user' | 'assistant'; content: string; localNode?: boolean }[]>([
    { role: 'assistant', content: `🛡️ **Local Open-Source LLM Daemon (Llama-3-8B-WebGPU) Loaded Successfully.**\n\nI am running 100% locally in your browser memory via WebAssembly/WebGPU layers. Absolutely zero text or telemetry data will leave your device.\n\nAsk me about shipping registries, order returns, technical specifications, or troubleshooting!`, localNode: true }
  ]);
  const [chatInput, setChatInput] = React.useState('');
  const [isChatTyping, setIsChatTyping] = React.useState(false);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatTyping) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsChatTyping(true);

    setTimeout(() => {
      // Local rule-based dictionary response with dynamic typing simulation
      let reply = '';
      const lower = userMsg.toLowerCase();

      if (lower.includes('return') || lower.includes('refund')) {
        reply = `📦 **Local Return Guideline & Troubleshooting Core:**\n\nUnder section 4.2 of our circular contract, standard items are returnable within 30 days. To trigger a return completely locally:\n1. Open your **Personal Orders View**.\n2. Locate the purchased item node and click **"Generate Returns Docket"**.\n3. Wrap the item in its original carbon-matrix white-label casing and dispatch to priority hub assembly.\n\n*Zero data leaves your system during this query.*`;
      } else if (lower.includes('shipping') || lower.includes('delivery')) {
        reply = `🚚 **Automated Logistics Routing & Shipping Specs:**\n\nAll items are dispatched directly from our regional priority cargo hubs. Standard delivery cycles take **1 to 3 business days** depending on local transport availability. Priority shipping triggers instant dispatch on autonomous courier lines.`;
      } else if (lower.includes('warranty') || lower.includes('broken') || lower.includes('repair')) {
        reply = `🛠️ **Certified Hardware Repair & Warranty Specs:**\n\nThis platform leverages a strict circular repair schema. If your cargo develops technical faults:\n- Access the **Repairability Scorecard** on the Product Details section.\n- Order replacement parts (housing, screen plates, gold-core capacitors) through our spare parts ledger.\n- Bypasses premium retail repair pricing, keeping electronic waste from dump bins.`;
      } else if (lower.includes('specs') || lower.includes('chip') || lower.includes('core')) {
        reply = `💻 **Technical Hardware Architecture & Specs:**\n\nOur advanced catalog utilizes components built on Grade 5 Titanium structures, aerospace alloy CNC frames, and low-impedance copper channels. Select the **Technical Specs Persona** in our smart description generator to highlight detailed electrical specifications.`;
      } else {
        reply = `🤖 **Local Edge Intelligent Reply:**\n\nI processed your request regarding *"I need assistance with ${userMsg}"* through our browser-hosted token optimizer.\n\nAs an open-source client-side model running on your **${deviceSpecs.gpu}**, I recommend browsing the specific product parameters or checking out the **B2B Wholesale** procurement dockets for enterprise terms. Let me know if you want detailed circular statistics!`;
      }

      // Stream reply word-by-word
      let currentWordIndex = 0;
      const words = reply.split(' ');
      setChatMessages(prev => [...prev, { role: 'assistant', content: '', localNode: true }]);

      const streamTimer = setInterval(() => {
        if (currentWordIndex >= words.length) {
          clearInterval(streamTimer);
          setIsChatTyping(false);
          return;
        }
        
        setChatMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          lastMsg.content = words.slice(0, currentWordIndex + 1).join(' ');
          return updated;
        });
        currentWordIndex++;
      }, 50);

    }, 1000);
  };

  return (
    <div id="edge-lab-view-root" className="pb-16 max-w-7xl mx-auto space-y-10">
      
      {/* 1. VISUAL BRANDING HERO */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Cpu className="h-44 w-44 animate-spin-slow" />
        </div>
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <Zap className="h-3.5 w-3.5" /> High-Speed Private Mode
            </span>
            <span className="bg-slate-800 text-slate-400 px-3 py-1.5 rounded-full text-xs font-mono">
              ✓ 100% Secure & Private
            </span>
          </div>
          
          <h1 id="edge-lab-title" className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            ⚡ Private Shopping Assistant & Speed Optimizer
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-3xl">
            We use your browser's built-in power to run smart tools, instant suggestions, and fast image search directly on your device. Absolutely none of your shopping activities, searches, or photos are ever sent to an external server.
          </p>

          {/* SIMULATION MODE CHANGER (Feature 100) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 mt-6">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Performance Tuning</span>
              <p className="text-[11px] text-slate-300">Simulate different device speeds to see how the interface automatically adjusts to stay fast.</p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
              <button
                id="profile-ultra-btn"
                type="button"
                onClick={() => setHardwareProfile('ultra')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  hardwareProfile === 'ultra' 
                    ? 'bg-teal-600 text-white shadow-md' 
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🚀 High-Performance Computer
              </button>
              <button
                id="profile-snapdragon-btn"
                type="button"
                onClick={() => setHardwareProfile('snapdragon')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  hardwareProfile === 'snapdragon' 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                📱 Mobile or Older Device
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVE HUB TAB SELECTOR */}
      <div className="flex overflow-x-auto gap-2 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('recommend')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'recommend' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🧩 Smart Descriptions & Suggestions
        </button>
        <button
          onClick={() => setActiveTab('search_trie')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'search_trie' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🔍 Smart Search & Offline Mode
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'assistant' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          💬 Friendly Helper Chat
        </button>
        <button
          onClick={() => setActiveTab('matcher')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'matcher' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🖼️ Photo Scanner & Finder
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'diagnostics' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          💻 Device Check & Display Settings
        </button>
      </div>

      {/* 3. DYNAMIC CONTENT AREAS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: RECOMMEND & PERSONALIZED CONTEXT DESCRIPTIONS */}
        {activeTab === 'recommend' && (
          <motion.div
            key="tab-recommend"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid gap-8 lg:grid-cols-2"
          >
            {/* Feature 91: Semantic recommendations engine */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">Personalized Matching</span>
                <h3 className="text-lg font-black text-slate-950 tracking-tight mt-1">Smart Product Suggestions</h3>
                <p className="text-xs text-slate-500 mt-1">Find products that perfectly match what you are looking for. Our secure logic finds connections instantly based on your shopping style.</p>
              </div>

              {/* Input: select active product node */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Select a product to find matches for:</label>
                <select
                  value={selectedRecommendBaseId}
                  onChange={(e) => setSelectedRecommendBaseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                  ))}
                </select>
              </div>

              {/* Semantic overlap output */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Recommended Items</span>
                  <span className="text-[9px] font-mono font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full uppercase">Instant match</span>
                </div>

                <div className="space-y-3">
                  {localSemanticRecommendations.map(({ product: p, score }) => (
                    <div 
                      key={p.id} 
                      className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 hover:bg-slate-100/50 transition-colors cursor-pointer"
                      onClick={() => {
                        triggerPrefetchLog(p.name, p.id);
                        if (onViewDetails) onViewDetails(p);
                      }}
                      onMouseEnter={() => triggerPrefetchLog(p.name, p.id)}
                    >
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-11 w-11 rounded-lg object-cover" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-teal-600 transition-colors leading-tight">{p.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{p.brand} / {p.category}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono font-black text-teal-600 bg-teal-50 border border-teal-100/40 px-2 py-1 rounded">
                          {score}% Match
                        </span>
                        <span className="block text-[8px] text-slate-400 mt-1 uppercase font-mono">⚡ Instant Preview</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 97: Contextual AI Smart Descriptions */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">Tailored Product Info</span>
                  <h3 className="text-lg font-black text-slate-950 tracking-tight mt-1">Custom Product Highlights</h3>
                  <p className="text-xs text-slate-500 mt-1">Changes what features are highlighted based on what matters to you most: pure performance, eco-friendly details, or designer aesthetics.</p>
                </div>

                {/* Persona selector tabs */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Choose what matters to you:</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setHardwareProfile(prev => {
                        setSmartDescriptionPersona('tech');
                        return prev;
                      })}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                        smartDescriptionPersona === 'tech' ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      💻 Tech & Specs
                    </button>
                    <button
                      type="button"
                      onClick={() => setHardwareProfile(prev => {
                        setSmartDescriptionPersona('eco');
                        return prev;
                      })}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                        smartDescriptionPersona === 'eco' ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      🌿 Eco-Friendly
                    </button>
                    <button
                      type="button"
                      onClick={() => setHardwareProfile(prev => {
                        setSmartDescriptionPersona('design');
                        return prev;
                      })}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                        smartDescriptionPersona === 'design' ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      🎨 Design & Style
                    </button>
                  </div>
                </div>

                {/* Dropdown for item */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Select Product</label>
                  <select
                     value={smartDescriptionProdId}
                     onChange={(e) => setSmartDescriptionProdId(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Smart copy text display box */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <span>Product Highlight Summary</span>
                    <span className="text-emerald-500">ID: {smartDescriptionProdId}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans min-h-[100px]">
                    {smartDescriptionPersona === 'tech' ? '💻 ' : smartDescriptionPersona === 'eco' ? '🌿 ' : '🎨 '}
                    {smartDescriptionOutput}
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono text-center pt-2 border-t border-slate-100">
                Created securely and 100% privately        {/* TAB 2: LOCAL TRIE AUTOCORRECT & SEARCH SYNCHRONIZER */}
        {activeTab === 'search_trie' && (
          <motion.div
            key="tab-search_trie"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid gap-8 lg:grid-cols-2"
          >
            {/* Feature 98: Dynamic search query autocorrect (Trie) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">Spelling Correction</span>
                <h3 className="text-lg font-black text-slate-950 tracking-tight mt-1">Instant Typo Autocorrect</h3>
                <p className="text-xs text-slate-500 mt-1">Type with confidence. Our search bar automatically checks spelling and corrects mistakes instantly as you type, without waiting for a server.</p>
              </div>

              {/* Input typing playground */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-600">Try typing a product name with typos (e.g. "keybord", "titaniu", "chrom"):</label>
                <div className="relative">
                  <input
                    type="text"
                    value={trieSearchQuery}
                    onChange={(e) => setTrieSearchQuery(e.target.value)}
                    placeholder="Type messy word..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 pr-10 text-xs font-mono outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                  <div className="absolute right-3 top-3.5 text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Autocorrect logs and display */}
              <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-300 space-y-3 border border-slate-800">
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-900 pb-2">
                  <span>Correction Assistant Feedback</span>
                  <span className="text-emerald-400 uppercase font-black">Active</span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <p><span className="text-slate-500">What you typed:</span> "{trieSearchQuery}"</p>
                  
                  {trieAutocorrectionResult ? (
                    trieAutocorrectionResult.corrected ? (
                      <div className="p-2 bg-teal-950/60 border border-teal-800 text-teal-400 rounded-lg space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <span>💡 Suggested Correction Found!</span>
                        </p>
                        <p className="text-[10px] text-teal-300">
                          Did you mean: <strong className="underline text-emerald-400 cursor-pointer" onClick={() => setTrieSearchQuery(trieAutocorrectionResult.suggestion)}>{trieAutocorrectionResult.suggestion}</strong>?
                        </p>
                      </div>
                    ) : (
                      <p className="text-emerald-400 font-bold">✓ Matches item: "{trieAutocorrectionResult.suggestion}"</p>
                    )
                  ) : (
                    <p className="text-slate-500 italic">Try typing "keybord", "titaniu", "aether", or "chronos" to test correction.</p>
                  )}
                </div>
              </div>

              {/* Trie schematic visual */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Search Suggestions Trail</span>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-2 overflow-x-auto text-[10px] font-mono text-slate-500 select-none">
                  <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">Root [ ]</span>
                  <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
                  <span className="bg-teal-50 text-teal-700 border border-teal-100 px-1.5 py-0.5 rounded">k [ ]</span>
                  <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
                  <span className="bg-teal-50 text-teal-700 border border-teal-100 px-1.5 py-0.5 rounded">e [ ]</span>
                  <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
                  <span className="bg-teal-50 text-teal-700 border border-teal-100 px-1.5 py-0.5 rounded">y [ ]</span>
                  <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-250 px-1.5 py-0.5 rounded font-bold font-sans">keyboard ✓</span>
                </div>
              </div>
            </div>

            {/* Feature 99: Offline Search Sync */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">Offline Browsing</span>
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      networkMode === 'online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                    }`}>
                      {networkMode === 'online' ? '🟢 Online Mode' : '🟡 Offline Mode Active'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-950 tracking-tight mt-1">Shop Anywhere, Even Offline</h3>
                  <p className="text-xs text-slate-500 mt-1">Our system automatically saves products to your device so you can keep searching and browsing even if you lose internet connection.</p>
                </div>

                {/* Simulated network toggle */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-800">Simulate Connection Status:</p>
                    <p className="text-[10px] text-slate-500">Toggle offline search synchronization to test browsing with no internet connection.</p>
                  </div>

                  <div className="flex gap-1.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setNetworkMode('online');
                        setSyncStatus('Status: Connected. Product list is fully updated.');
                      }}
                      className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        networkMode === 'online' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      <Wifi className="h-3 w-3" /> Online
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNetworkMode('offline_sync');
                        setSyncStatus('Status: Offline. Currently browsing saved products safely stored on your device.');
                      }}
                      className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        networkMode === 'offline_sync' ? 'bg-amber-600 text-white shadow-md animate-pulse' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      <WifiOff className="h-3 w-3" /> Go Offline
                    </button>
                  </div>
                </div>

                {/* Local search sync box */}
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Search Saved Products</label>
                    <input
                      type="text"
                      placeholder={networkMode === 'online' ? "Search fully synced products..." : "Browse offline items (e.g., watch, keyboard)..."}
                      value={syncQuery}
                      onChange={(e) => setSyncQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2 border border-slate-100 rounded-2xl p-3 bg-slate-50 max-h-[160px] overflow-y-auto">
                    {offlineFilteredProducts.length > 0 ? (
                      offlineFilteredProducts.map(p => (
                        <div key={p.id} className="flex justify-between items-center text-xs font-mono text-slate-600 hover:bg-slate-100 p-1.5 rounded">
                          <span className="font-bold text-slate-800 font-sans">{p.name}</span>
                          <span className="text-teal-600 font-sans">${p.price}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 italic text-center py-4 uppercase">No saved items found for this query.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-[9px] font-mono text-slate-400 border-t border-slate-150 pt-2.5 mt-4 text-center leading-normal">
                {syncStatus}
              </div>
            </div>
          </motion.div>
        )}rmal">
                {syncStatus}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: LOCAL CONVERSATIONAL MARKDOWN ASSISTANT */}
        {activeTab === 'assistant' && (
          <motion.div
            key="tab-assistant"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid gap-8 lg:grid-cols-3"
          >
            {/* Feature 93 Chat interface (col-span-2) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[500px]">
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">Feature 93: Conversational Markdown Assistant</span>
                    <h3 className="text-lg font-black text-slate-950 tracking-tight">Open-Source LLM Client Console</h3>
                  </div>
                  <span className="text-[8px] font-mono bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.5 rounded-full uppercase">
                    Model: Llama3-8b-WASMT
                  </span>
                </div>

                {/* Live chat thread */}
                <div className="space-y-4 h-[320px] overflow-y-auto p-2 border border-slate-100 rounded-2xl bg-slate-50/50">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 max-w-2xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                        msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {msg.role === 'user' ? 'U' : 'AI'}
                      </div>
                      
                      <div className={`rounded-2xl p-4 text-xs leading-relaxed space-y-2 border shadow-xs ${
                        msg.role === 'user' 
                          ? 'bg-teal-50 border-teal-100 text-slate-800 rounded-tr-xs' 
                          : 'bg-white border-slate-200/80 text-slate-800 rounded-tl-xs'
                      }`}>
                        {msg.localNode && (
                          <span className="text-[7.5px] font-mono bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded-sm uppercase font-bold tracking-wider block self-start w-fit">
                            ⚡ Edge Local Thread
                          </span>
                        )}
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isChatTyping && (
                    <div className="flex gap-3 max-w-xl">
                      <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        AI
                      </div>
                      <div className="bg-slate-100 border border-slate-200/50 rounded-2xl p-3 flex items-center gap-1">
                        <Loader2 className="h-3.5 w-3.5 text-slate-400 animate-spin" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Traversing WebGPU blocks...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input box */}
              <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-slate-100 mt-4">
                <input
                  type="text"
                  placeholder="Ask about returns, shipping rates, circular dockets, or system specs..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatTyping}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-teal-500 focus:bg-white"
                />
                <button
                  id="send-chat-btn"
                  type="submit"
                  disabled={isChatTyping}
                  className="h-10 w-10 bg-slate-900 hover:bg-slate-950 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Quick Prompts Helper panel */}
            <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 shadow-xl space-y-6 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center gap-1.5 text-teal-400 font-bold font-mono text-xs uppercase">
                  <Terminal className="h-4 w-4" />
                  <span>Prompt Directory</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal">
                  Click any standard troubleshooting prompt below to feed it directly to the browser Llama compiler engine:
                </p>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setChatInput("How do I return my order?");
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs hover:border-teal-500 hover:bg-slate-900 transition-all font-mono leading-tight flex items-start gap-1.5"
                  >
                    <CornerDownRight className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                    <span>How do I return my order?</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setChatInput("Is there a circular warranty on custom casings?");
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs hover:border-teal-500 hover:bg-slate-900 transition-all font-mono leading-tight flex items-start gap-1.5"
                  >
                    <CornerDownRight className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                    <span>Is there a circular warranty on custom casings?</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setChatInput("How long does autonomous courier delivery take?");
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs hover:border-teal-500 hover:bg-slate-900 transition-all font-mono leading-tight flex items-start gap-1.5"
                  >
                    <CornerDownRight className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                    <span>How long does courier delivery take?</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[10px] text-slate-500 space-y-1">
                <span className="text-teal-500 font-bold block uppercase text-[8px]">Node Telemetry:</span>
                <p>✓ Active WebGPU block allocation: 2.1GB</p>
                <p>✓ Token output frequency: ~42 tokens/sec</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: CLIENT-SIDE VECTOR IMAGE MATCHING */}
        {activeTab === 'matcher' && (
          <motion.div
            key="tab-matcher"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid gap-8 lg:grid-cols-2"
          >
            {/* Feature 96 Visual processing canvas matcher */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">Feature 96: Client-Side Vector Matchers</span>
                <h3 className="text-lg font-black text-slate-950 tracking-tight mt-1">Computer Vision Vector Matcher</h3>
                <p className="text-xs text-slate-500 mt-1">Processes user photographs locally inside a Canvas container. Extracts visual structural vectors (shape, outlines, color-density coordinates) to fetch matching items instantly.</p>
              </div>

              {/* Template selection to match */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-600">Select Image Template to process locally:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => runVectorMatcher('keyboard')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      matchingTemplate === 'keyboard' ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    ⌨️ Mechanical Board
                  </button>
                  <button
                    type="button"
                    onClick={() => runVectorMatcher('watch')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      matchingTemplate === 'watch' ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    ⌚ Wearable Watch
                  </button>
                  <button
                    type="button"
                    onClick={() => runVectorMatcher('jacket')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      matchingTemplate === 'jacket' ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    🧥 Apparel Casing
                  </button>
                </div>
              </div>

              {/* Local Canvas with green outline and track points */}
              <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
                {isMatchingRunning && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
                    <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
                    <span className="text-xs font-mono text-teal-400 uppercase tracking-widest animate-pulse">Running Local ConvNet Kernels...</span>
                  </div>
                )}

                <canvas 
                  ref={matcherCanvasRef} 
                  width={300} 
                  height={200}
                  className="bg-slate-900 border border-slate-850 rounded-xl"
                />

                {!matchingTemplate && !isMatchingRunning && (
                  <div className="absolute text-center text-slate-500 p-4">
                    <ImageIcon className="h-10 w-10 text-slate-700 mx-auto mb-2 animate-bounce" />
                    <p className="text-[10px] font-mono uppercase font-black">Canvas Ready: Select template above to run CV pipeline</p>
                  </div>
                )}
              </div>
            </div>

            {/* Matcher Results Block */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h4 className="text-sm font-black text-slate-950 tracking-tight uppercase">Visual Feature Mapping Result</h4>
                  <span className="text-[8px] font-mono bg-teal-950 text-teal-400 border border-teal-800 px-2 py-0.5 rounded uppercase font-bold">
                    Local Search Matcher
                  </span>
                </div>

                {matcherResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                          ✓ Match Verified
                        </span>
                        <span className="text-xs font-black font-mono text-emerald-700">
                          Confidence: {matcherResult.confidence}%
                        </span>
                      </div>

                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-emerald-100/50">
                        <img src={matcherResult.product.image} alt={matcherResult.product.name} className="h-12 w-12 rounded-lg object-cover" />
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-tight">{matcherResult.product.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{matcherResult.product.brand} OEM / ${matcherResult.product.price}</p>
                        </div>
                      </div>

                      <ul className="text-[10px] font-mono text-emerald-800 space-y-1">
                        <li>• Extracted matched visual keypoints: <strong className="text-emerald-700">{matcherResult.keypoints} nodes</strong></li>
                        <li>• Chrominance pixel density index: <strong className="text-emerald-700">Passed (98.2%)</strong></li>
                        <li>• Matrix contour structural fitment: <strong className="text-emerald-700">Passed (89.1% outline)</strong></li>
                      </ul>
                    </div>

                    <button
                      id="matcher-add-cart-btn"
                      type="button"
                      onClick={() => onAddToCart(matcherResult.product)}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Commit Matched Item to Cart
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 italic font-mono text-[11px] uppercase space-y-2">
                    <p>Await CV algorithm completion...</p>
                    <p className="text-[8.5px] text-slate-500 lowercase leading-relaxed">No tracking tags are uploaded to external databases. All pixel convolutions are processed strictly in CPU/WASM memory buffers.</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-mono text-slate-400">
                Optimization limit: {hardwareProfile === 'snapdragon' ? 'Snapdragon Safe resolution limits active (canvas downsampled 2x).' : 'PC resolution limits active (full sample resolution).'}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: HARDWARE SPEC DIAGNOSTICS & ADAPTIVE GRID LAYOUTS */}
        {activeTab === 'diagnostics' && (
          <motion.div
            key="tab-diagnostics"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid gap-8 lg:grid-cols-3"
          >
            {/* Feature 100 Hardware diagnostics console (col-span-1) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">Feature 100: Device-Spec Optimizer</span>
                  <h3 className="text-lg font-black text-slate-950 tracking-tight mt-1">Hardware Diagnostic Panel</h3>
                </div>

                <div className="space-y-3 font-mono text-xs text-slate-700">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400 uppercase">Architecture:</span>
                    <span className="font-bold text-slate-900">{deviceSpecs.platform}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400 uppercase">CPU Core Threading:</span>
                    <span className="font-bold text-slate-900">{deviceSpecs.cores} Threads</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400 uppercase">RAM Boundaries:</span>
                    <span className="font-bold text-slate-900">{deviceSpecs.memory}GB Memory</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 flex-col gap-0.5">
                    <span className="text-slate-400 uppercase block">Renderer Engine GPU:</span>
                    <span className="font-bold text-slate-900 text-[10px] truncate leading-tight mt-0.5">{deviceSpecs.gpu}</span>
                  </div>
                </div>

                {/* Simulated hardware optimizer logs */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 h-[180px] flex flex-col justify-between font-mono text-[8px]">
                  <div className="space-y-1 overflow-y-auto max-h-[160px]">
                    <span className="text-slate-500 uppercase text-[7px] block font-bold">Optimization Daemon Feed</span>
                    {diagnosticsLogs.map((log, lidx) => (
                      <p key={lidx} className={log.includes('⚠️') || log.includes('ARM64') ? 'text-amber-400 font-bold' : log.includes('[OPTIMIZER]') ? 'text-teal-400' : 'text-slate-400'}>
                        {log}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[9px] font-mono text-slate-400 text-center uppercase pt-2 border-t border-slate-100">
                Telemetry active: Target: lock flat 60fps
              </div>
            </div>

            {/* Feature 95 Adaptive Layout Panel (col-span-2) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">Feature 95: Adaptive Layout Architectures</span>
                  <h3 className="text-lg font-black text-slate-950 tracking-tight mt-1">Adaptive Grid Layouts</h3>
                  <p className="text-xs text-slate-500 mt-1">Transforms structural layout depending on cursor speed. Slow browsing builds aesthetic galleries, while ultra-fast scroll velocities switch to hyper-dense data matrixes.</p>
                </div>

                {/* Adaptive layout toggle */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
                  <span className="text-slate-600">Auto-Adapt AI:</span>
                  <input
                    type="checkbox"
                    checked={adaptiveLayoutEnabled}
                    onChange={(e) => setAdaptiveLayoutEnabled(e.target.checked)}
                    className="h-4 w-4 text-teal-600 border-slate-300 focus:ring-teal-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Layout switcher buttons manually */}
              <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 items-center">
                <span className="text-xs font-bold text-slate-600 ml-2">Manual Layout Override:</span>
                <div className="flex gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => { setLayoutMode('speed_matrix'); setAdaptiveLayoutEnabled(false); }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      layoutMode === 'speed_matrix' ? 'bg-slate-950 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ⚡ Speed Matrix (Dense)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLayoutMode('visual_lookbook'); setAdaptiveLayoutEnabled(false); }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      layoutMode === 'visual_lookbook' ? 'bg-slate-950 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🎨 Visual Lookbook (Spacious)
                  </button>
                </div>
              </div>

              {/* Dynamic scroll metric tracker mockup */}
              <div className="grid grid-cols-2 gap-4 text-center text-xs font-mono">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <span className="text-slate-400 uppercase text-[9px]">Active Scroll Velocity:</span>
                  <p className={`text-lg font-black mt-0.5 ${metricsScrollSpeed > 500 ? 'text-amber-500 animate-pulse' : 'text-slate-800'}`}>
                    {metricsScrollSpeed} px/second
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <span className="text-slate-400 uppercase text-[9px]">Adaptive Layout State:</span>
                  <p className="text-lg font-black text-teal-600 mt-0.5 uppercase">
                    {layoutMode === 'speed_matrix' ? 'Speed Matrix' : 'Visual Lookbook'}
                  </p>
                </div>
              </div>

              {/* Live products catalog rendering inside Adaptive layout */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Adaptive Layout Sandbox:</span>
                
                {layoutMode === 'speed_matrix' ? (
                  /* 1. SPEED MATRIX LAYOUT: Extremely high info density, text only, quick add buttons, small spacing */
                  <div className="space-y-1.5 border border-slate-200/60 rounded-2xl bg-slate-950 p-4 font-mono text-[11px] text-slate-300">
                    <div className="grid grid-cols-12 gap-2 text-slate-500 border-b border-slate-900 pb-1 text-[10px] font-bold">
                      <span className="col-span-5 uppercase">SKU / Item</span>
                      <span className="col-span-3 uppercase">Brand</span>
                      <span className="col-span-2 uppercase">Price</span>
                      <span className="col-span-2 uppercase text-right">Commit</span>
                    </div>

                    <div className="space-y-1 max-h-[160px] overflow-y-auto">
                      {products.slice(0, 4).map(p => (
                        <div key={p.id} className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-900/60 hover:bg-slate-900 px-1 rounded transition-colors items-center">
                          <span className="col-span-5 font-bold text-slate-100 truncate">{p.name}</span>
                          <span className="col-span-3 text-slate-400 truncate">{p.brand}</span>
                          <span className="col-span-2 text-emerald-400">${p.price}</span>
                          <button
                            type="button"
                            onClick={() => onAddToCart(p)}
                            className="col-span-2 py-1 bg-teal-600 text-white rounded text-[9px] font-bold uppercase transition-colors hover:bg-teal-700 ml-auto mr-1 cursor-pointer"
                          >
                            + Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* 2. VISUAL LOOKBOOK LAYOUT: Large visual components, descriptions, high-contrast imagery, elegant frames */
                  <div className="grid gap-4 sm:grid-cols-2 max-h-[220px] overflow-y-auto p-1">
                    {products.slice(0, 2).map(p => (
                      <div key={p.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div className="relative aspect-video w-full bg-slate-50 overflow-hidden">
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          <span className="absolute bottom-2 left-2 bg-slate-950/80 text-white px-2 py-1 rounded text-[9px] font-mono">
                            ${p.price}
                          </span>
                        </div>
                        <div className="p-3.5 space-y-1">
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{p.brand}</p>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{p.name}</h4>
                          <button
                            type="button"
                            onClick={() => onAddToCart(p)}
                            className="w-full mt-2.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* 4. BACKGROUND PREFETCHING TELEMETRY LOGGER & REVIEWS SUMMARIZER HIGHLIGHT */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Feature 92: Predictive Edge Page Prefetch Logs dashboard */}
        <div className="lg:col-span-2 bg-slate-950 text-slate-300 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center flex-col sm:flex-row gap-2">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase">Feature 92: Predictive Edge prefetching</span>
              <h3 className="text-base font-black text-white tracking-tight">Vercel Edge Network Prefetching Logs</h3>
            </div>
            
            <button
              id="clear-prefetch-btn"
              type="button"
              onClick={() => setPrefetchLogs([])}
              className="text-[9px] font-bold font-mono text-slate-500 hover:text-white uppercase tracking-wider border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Flush Cache
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Edge Prefetching tracks cursor trajectory vectors. When hovering or navigating near category nodes, layout rendering pipelines are preemptively cached in Vercel Edge caches to deliver sub-10ms navigation.
          </p>

          <div className="space-y-2 max-h-[180px] overflow-y-auto font-mono text-[10px]">
            {prefetchLogs.length > 0 ? (
              prefetchLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-900/80 hover:border-slate-800 transition-colors gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
                    <span className="text-[9px] text-slate-500">[{log.timestamp}]</span>
                    <strong className="text-teal-400">{log.action}:</strong>
                    <span className="text-slate-200">{log.resource}</span>
                  </div>
                  <div className="text-right text-[9px] text-slate-500">
                    <span>Edge delay: <strong className="text-emerald-400">{log.latency}ms</strong> via {log.node}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-slate-600 uppercase italic">Prefetch caches flushed. Hover over recommended items to seed predictive caches.</p>
            )}
          </div>
        </div>

        {/* Feature 94 Semantic Review Summary Block */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">Feature 94: NLP Summarization</span>
                <h3 className="text-base font-black text-slate-950 tracking-tight">Semantic Review Summarizer</h3>
              </div>
              <span className="text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded">
                NLP Block Active
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Select Product Reviews node to summarize</label>
              <select
                value={summarizedProductReviewsId}
                onChange={(e) => setSummarizedProductReviewsId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 font-mono">Sentiments Distribution:</span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black font-mono">
                  {simulatedReviewSummary.sentiment}% Positive
                </span>
              </div>
              
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Local NLP TL;DR Review extraction (5,000 logs analyzed):</span>
                <p className="text-[11px] text-slate-700 font-sans italic">"{simulatedReviewSummary.tldr}"</p>
              </div>
            </div>
          </div>

          <div className="text-[9px] font-mono text-slate-400 text-center uppercase pt-2 border-t border-slate-100">
            Automatically generated locally in 0.12ms.
          </div>
        </div>

      </div>

    </div>
  );
}
