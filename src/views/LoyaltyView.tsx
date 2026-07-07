/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Award, Coins, Flame, ShieldCheck, HelpCircle, Send, 
  Hourglass, Clock, ExternalLink, Copy, Plus, Check, ChevronRight,
  Vote, Lock, Gift, CheckSquare, Compass, MessageSquare, Star, ArrowRight, Info
} from 'lucide-react';
import { Product, User } from '../lib/db';

interface LoyaltyViewProps {
  currentUser: User;
  products: Product[];
  onAddToCart: (product: Product) => void;
  setActiveView: (view: any) => void;
}

// Interfaces for our interactive loyalty sub-systems
interface LedgerTx {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  date: string;
}

interface Referral {
  id: string;
  friendName: string;
  orderTotal: number;
  commission: number;
  daysRemaining: number;
  status: 'escrow' | 'released';
  date: string;
}

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'sustainability' | 'grant';
  votesCount: number;
  voted: boolean;
  status: 'Active' | 'Passed';
}

interface EarlyReserveItem {
  id: string;
  name: string;
  description: string;
  price: number;
  releaseDays: number;
  depositRequired: number;
  totalReserved: number;
  isReserved: boolean;
  confCode?: string;
  image: string;
}

export default function LoyaltyView({ currentUser, products, onAddToCart, setActiveView }: LoyaltyViewProps) {
  // 1. Core Persistence State - Micro-Loyalty Ledger (Feature 51)
  const [storeCredits, setStoreCredits] = React.useState<number>(() => {
    if (typeof window === 'undefined') return 25.00;
    const stored = localStorage.getItem('nexus_bazaar_store_credit');
    return stored ? parseFloat(stored) : 25.00;
  });

  const [ledgerHistory, setLedgerHistory] = React.useState<LedgerTx[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('nexus_bazaar_loyalty_ledger');
    if (stored) return JSON.parse(stored);
    
    // Default initial transactions
    const defaults: LedgerTx[] = [
      { id: 'tx_1', type: 'earn', amount: 5.00, description: 'Low Return Rate Bonus: Compliant checkout history', date: '2026-06-25' },
      { id: 'tx_2', type: 'earn', amount: 10.00, description: 'High-Effort Review: Aether-9 ANC Wireless Headphones', date: '2026-07-01' },
      { id: 'tx_3', type: 'earn', amount: 10.00, description: 'Verified Bug Report: Fixed mobile responsive navbar margins', date: '2026-07-03' }
    ];
    localStorage.setItem('nexus_bazaar_loyalty_ledger', JSON.stringify(defaults));
    return defaults;
  });

  // 2. Tiers State (Feature 52)
  const [lifetimeSpend, setLifetimeSpend] = React.useState<number>(() => {
    if (typeof window === 'undefined') return 850.00;
    const stored = localStorage.getItem('nexus_bazaar_lifetime_spend');
    return stored ? parseFloat(stored) : 850.00;
  });

  // Calculate current level tier and perks
  const tierInfo = React.useMemo(() => {
    if (lifetimeSpend < 200) {
      return {
        name: 'Bronze Explorer',
        color: 'from-amber-600 to-amber-800',
        textColor: 'text-amber-600',
        bg: 'bg-amber-50',
        nextLevel: 200,
        pct: (lifetimeSpend / 200) * 100,
        perks: ['Standard 14-day return window', 'Access to base discount promo codes'],
        badgeColor: 'border-amber-400 bg-amber-500/10 text-amber-500'
      };
    } else if (lifetimeSpend < 600) {
      return {
        name: 'Silver Pioneer',
        color: 'from-slate-400 to-slate-600',
        textColor: 'text-slate-600',
        bg: 'bg-slate-100',
        nextLevel: 600,
        pct: ((lifetimeSpend - 200) / 400) * 100,
        perks: ['Extended 30-day return window', 'Custom Silver profile aesthetic', '1.5x Multiplier on review bounties'],
        badgeColor: 'border-slate-350 bg-slate-500/10 text-slate-500'
      };
    } else {
      return {
        name: 'Gold Elite',
        color: 'from-amber-400 to-yellow-600',
        textColor: 'text-amber-500',
        bg: 'bg-amber-50/50',
        nextLevel: 1500,
        pct: Math.min(100, ((lifetimeSpend - 600) / 900) * 100),
        perks: ['Extended 45-day return window', 'Shimmering Golden profile aesthetic', 'Early Access Flash Reserves (Zero-Deposit Option)', '2.0x Multiplier on review bounties'],
        badgeColor: 'border-amber-400 bg-amber-500/15 text-amber-500 font-bold animate-pulse'
      };
    }
  }, [lifetimeSpend]);

  // 3. Subscription Streak State (Feature 53)
  const [replenishStreak, setReplenishStreak] = React.useState<number>(() => {
    if (typeof window === 'undefined') return 3;
    const stored = localStorage.getItem('nexus_bazaar_replenish_streak');
    return stored ? parseInt(stored) : 3;
  });

  const compoundingDiscount = React.useMemo(() => {
    // 5% per month, compounding up to 20%
    return Math.min(20, replenishStreak * 5);
  }, [replenishStreak]);

  // 4. Governance Voting Forum State (Feature 54)
  const [proposals, setProposals] = React.useState<GovernanceProposal[]>(() => {
    const defaultProposals: GovernanceProposal[] = [
      { id: 'gov_1', title: 'Transition Logistics to 100% Carbon-Neutral Fleet', description: 'Mandate zero-emission electric vehicles for local postal couriers by Q3 2026. This would offset estimated platform delivery metrics.', category: 'sustainability', votesCount: 342, voted: false, status: 'Active' },
      { id: 'gov_2', title: 'Fund $5,000 Charity Grant for Open-Source CAD Solder Nodes', description: 'Allocate developer community support credits to maintain the web-based PCB solder layout tool used worldwide.', category: 'grant', votesCount: 512, voted: true, status: 'Active' },
      { id: 'gov_3', title: 'Introduce Interactive 3D Augmented Reality previews inside Styling Lab', description: 'Upgrade canvas tools to pull parametric skeletal overlays, allowing immersive spatial mock-fitting of workspace gears.', category: 'feature', votesCount: 219, voted: false, status: 'Active' }
    ];
    if (typeof window === 'undefined') return defaultProposals;
    const stored = localStorage.getItem('nexus_bazaar_gov_proposals');
    return stored ? JSON.parse(stored) : defaultProposals;
  });

  // 5. Digital Badges State (Feature 55)
  const [earnedBadges, setEarnedBadges] = React.useState<string[]>(() => {
    if (typeof window === 'undefined') return ['audiophile_veteran'];
    const stored = localStorage.getItem('nexus_bazaar_badges');
    return stored ? JSON.parse(stored) : ['audiophile_veteran'];
  });

  // All badges catalog
  const badgeCatalog = [
    { id: 'audiophile_veteran', name: 'Audiophile Veteran', desc: 'Verified expertise in high-fidelity acoustics and headphone review structures.', color: 'border-teal-500 bg-teal-500/10 text-teal-400', icon: Award },
    { id: 'ergonomic_sensei', name: 'Ergonomic Sensei', desc: 'Expert in workspace setup layouts, tactile switches, and muscular health optimization.', color: 'border-purple-500 bg-purple-500/10 text-purple-400', icon: ShieldCheck },
    { id: 'wearables_pioneer', name: 'Wearables Pioneer', desc: 'Early tester and telemetry evaluator for smart tracking arrays and health metrics.', color: 'border-orange-500 bg-orange-500/10 text-orange-400', icon: Flame },
    { id: 'bug_hunter', name: 'Bug Hunter', desc: 'Successfully located and verified platform interface defects or ledger errors.', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400', icon: Sparkles }
  ];

  // 6. Referral Engine with Escrow Locks State (Feature 58)
  const [referrals, setReferrals] = React.useState<Referral[]>(() => {
    const defaultReferrals: Referral[] = [
      { id: 'ref_1', friendName: 'CircuitWeaver_99', orderTotal: 150.00, commission: 15.00, daysRemaining: 18, status: 'escrow', date: '2026-06-24' },
      { id: 'ref_2', friendName: 'VoltVandal', orderTotal: 299.00, commission: 29.90, daysRemaining: 0, status: 'released', date: '2026-06-05' }
    ];
    if (typeof window === 'undefined') return defaultReferrals;
    const stored = localStorage.getItem('nexus_bazaar_referrals');
    return stored ? JSON.parse(stored) : defaultReferrals;
  });

  // 7. Early Access Reserves State (Feature 59)
  const [reserves, setReserves] = React.useState<EarlyReserveItem[]>(() => {
    const defaultReserves: EarlyReserveItem[] = [
      {
        id: 'res_1',
        name: 'Nexus Quantum Mechanical Keyboard (Carbon v1)',
        description: 'Sub-millisecond carbon-housing linear switches, solid titanium weight bar, custom dynamic circadian backlights. Extremely limited run of 50 units.',
        price: 450,
        releaseDays: 12,
        depositRequired: 25.00,
        totalReserved: 38,
        isReserved: false,
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=300&h=200&q=80'
      },
      {
        id: 'res_2',
        name: 'Veloce Carbon Fiber Smart Glasses',
        description: 'Bone conduction ambient drivers, dynamic HUD projection overlays, and integrated real-time biofeedback sensors. Releases next month.',
        price: 599,
        releaseDays: 28,
        depositRequired: 50.00,
        totalReserved: 12,
        isReserved: false,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=300&h=200&q=80'
      }
    ];
    if (typeof window === 'undefined') return defaultReserves;
    const stored = localStorage.getItem('nexus_bazaar_early_reserves');
    return stored ? JSON.parse(stored) : defaultReserves;
  });

  // --- BATCH 7: CIRCULAR TRADE-IN EVALUATION ENGINE STATES (Feature #62) ---
  const [tradeStep, setTradeStep] = React.useState<1 | 2 | 3>(1);
  const [selectedTradeItem, setSelectedTradeItem] = React.useState<{ id: string; name: string; originalPrice: number; image: string } | null>(null);
  
  const [diagFunctional, setDiagFunctional] = React.useState<boolean>(true);
  const [diagCosmetic, setDiagCosmetic] = React.useState<boolean>(true);
  const [diagBox, setDiagBox] = React.useState<boolean>(false);
  const [diagBattery, setDiagBattery] = React.useState<boolean>(true);

  const tradeInOptions = [
    { id: 'trade_1', name: 'Aether-9 ANC Headphones (Prev Gen)', originalPrice: 299, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'trade_2', name: 'Pro-Ergo Split Key Assembly', originalPrice: 189, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'trade_3', name: 'Chronos SmartWatch (Prev Gen)', originalPrice: 349, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&h=150&q=80' }
  ];

  const tradeInValue = React.useMemo(() => {
    if (!selectedTradeItem) return 0;
    let multiplier = 0.25; // base trade-in value is 25% of retail
    if (diagFunctional) multiplier += 0.20;
    if (diagCosmetic) multiplier += 0.15;
    if (diagBox) multiplier += 0.05;
    if (diagBattery) multiplier += 0.10;
    return Math.round(selectedTradeItem.originalPrice * multiplier);
  }, [selectedTradeItem, diagFunctional, diagCosmetic, diagBox, diagBattery]);

  const handleExecuteTradeIn = () => {
    if (!selectedTradeItem) return;
    const value = tradeInValue;
    setStoreCredits(prev => prev + value);
    
    // Add transaction to history
    const newTx: LedgerTx = {
      id: `tx_trade_${Date.now()}`,
      type: 'earn',
      amount: value,
      description: `Circular Trade-In Approved: Returned ${selectedTradeItem.name}`,
      date: new Date().toISOString().split('T')[0]
    };
    setLedgerHistory(prev => [newTx, ...prev]);

    // Update spend volume (recycling adds loyalty status credit too!)
    setLifetimeSpend(prev => prev + value * 0.5);

    alert(`♻️ Circular Trade-In Approved!\nInstant credit of $${value.toFixed(2)} has been added to your NexusBazaar store credits balance.`);
    
    // Reset wizard
    setTradeStep(1);
    setSelectedTradeItem(null);
    setDiagFunctional(true);
    setDiagCosmetic(true);
    setDiagBox(false);
    setDiagBattery(true);
  };

  // 8. Active Category Quests (Feature 56)
  const questCatalog = [
    {
      id: 'quest_home_studio',
      title: 'Home Studio Build',
      desc: 'Acquire high-fidelity headphones and circadian wearables to complete the absolute professional audio studio setup.',
      items: [
        { id: 'prod_1', name: 'Aether-9 ANC Wireless Headphones', price: 299 },
        { id: 'prod_2', name: 'Chronos SmartWatch Edition 4', price: 349 }
      ],
      discountPct: 20,
      rewardCredits: 15.00
    },
    {
      id: 'quest_ergonomic_flow',
      title: 'Minimalist Tactile Workspace',
      desc: 'Synergize ergonomics with custom mechanical keys and active desk elements for ultimate daily typing health.',
      items: [
        { id: 'prod_4', name: 'Pro-Ergo Split Mechanical Keyboard', price: 189 },
        { id: 'prod_5', name: 'Lucent circadian desk beam', price: 129 }
      ],
      discountPct: 15,
      rewardCredits: 10.00
    }
  ];

  // Sync to local storage
  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_store_credit', storeCredits.toFixed(2));
  }, [storeCredits]);

  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_loyalty_ledger', JSON.stringify(ledgerHistory));
  }, [ledgerHistory]);

  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_lifetime_spend', lifetimeSpend.toFixed(2));
  }, [lifetimeSpend]);

  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_replenish_streak', String(replenishStreak));
  }, [replenishStreak]);

  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_gov_proposals', JSON.stringify(proposals));
  }, [proposals]);

  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_badges', JSON.stringify(earnedBadges));
  }, [earnedBadges]);

  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_referrals', JSON.stringify(referrals));
  }, [referrals]);

  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_early_reserves', JSON.stringify(reserves));
  }, [reserves]);

  // Active inputs / actions states
  const [bugDesc, setBugDesc] = React.useState('');
  const [bugSuccess, setBugSuccess] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [advancingDays, setAdvancingDays] = React.useState(false);

  // Actions
  const handleFileBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugDesc.trim()) return;

    const rewardAmount = 5.00;
    const newTx: LedgerTx = {
      id: `tx_${Date.now()}`,
      type: 'earn',
      amount: rewardAmount,
      description: `Verified Bug Report: "${bugDesc.substring(0, 50)}${bugDesc.length > 50 ? '...' : ''}"`,
      date: new Date().toISOString().split('T')[0]
    };

    setStoreCredits(prev => prev + rewardAmount);
    setLedgerHistory(prev => [newTx, ...prev]);
    
    // Also award "Bug Hunter" badge if not already earned
    if (!earnedBadges.includes('bug_hunter')) {
      setEarnedBadges(prev => [...prev, 'bug_hunter']);
      alert(`🎉 Congratulations! You have unlocked the "Bug Hunter" badge for identifying system anomalies!`);
    }

    setBugDesc('');
    setBugSuccess(true);
    setTimeout(() => setBugSuccess(false), 3000);
  };

  const handleVote = (id: string) => {
    // Check membership eligibility (Requires Silver/Gold or Elite toggle)
    const isEligible = lifetimeSpend >= 200 || currentUser.isElite;
    if (!isEligible) {
      alert(`🔒 Access Denied: Platform governance voting is exclusive to Silver, Gold Tiers, or active Elite members.`);
      return;
    }

    setProposals(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextVoted = !p.voted;
          return {
            ...p,
            voted: nextVoted,
            votesCount: p.votesCount + (nextVoted ? 1 : -1)
          };
        }
        return p;
      })
    );
  };

  const handleCopyReferral = () => {
    const link = `https://nexusbazaar.com/invite?ref=${currentUser.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Simulate passing of 30 days to clear escrow (Feature 58)
  const handleSimulateTime = () => {
    setAdvancingDays(true);
    setTimeout(() => {
      let releasedCredits = 0;
      const updatedRefs = referrals.map(ref => {
        if (ref.status === 'escrow') {
          releasedCredits += ref.commission;
          return { ...ref, daysRemaining: 0, status: 'released' as const };
        }
        return ref;
      });

      if (releasedCredits > 0) {
        setStoreCredits(prev => prev + releasedCredits);
        const newTx: LedgerTx = {
          id: `tx_release_${Date.now()}`,
          type: 'earn',
          amount: releasedCredits,
          description: `Referral Escrow Cleared: Commissions released to available balance`,
          date: new Date().toISOString().split('T')[0]
        };
        setLedgerHistory(prev => [newTx, ...prev]);
        alert(`📅 Time Simulator: 30 days have elapsed! Cleared and released $${releasedCredits.toFixed(2)} from affiliate escrow into your active store credits.`);
      } else {
        alert(`📅 Time Simulator: 30 days have elapsed! There were no pending referral orders in escrow.`);
      }
      setReferrals(updatedRefs);
      setAdvancingDays(false);
    }, 1000);
  };

  // Advance auto-replenish streak
  const handleAdvanceStreak = () => {
    const nextStreak = replenishStreak + 1;
    setReplenishStreak(nextStreak);
    
    // Earn 5 store credit as incentive bonus
    const incentiveBonus = 5.00;
    const newTx: LedgerTx = {
      id: `tx_streak_${Date.now()}`,
      type: 'earn',
      amount: incentiveBonus,
      description: `Streak Reward: Auto-replenish subscription stays active (Month ${nextStreak})`,
      date: new Date().toISOString().split('T')[0]
    };
    
    setStoreCredits(prev => prev + incentiveBonus);
    setLedgerHistory(prev => [newTx, ...prev]);
    alert(`🔥 Streak Advanced! You hit a ${nextStreak}-Month consecutive subscription milestone! Unlocked a compounding discount of ${Math.min(20, nextStreak * 5)}% and earned +$5.00 Store Credit.`);
  };

  const handleReserveEarly = (item: EarlyReserveItem) => {
    // Check eligibility: Requires Gold Tier or Elite toggle
    const isEligible = lifetimeSpend >= 600 || currentUser.isElite;
    if (!isEligible) {
      alert(`🔒 Lock Active: Early Access Reserves are highly limited drops exclusive to Gold Tiers or Elite members.`);
      return;
    }

    if (item.isReserved) {
      alert(`You have already secured a reserve for this item!`);
      return;
    }

    if (storeCredits < item.depositRequired) {
      alert(`Insufficient Store Credits! You need $${item.depositRequired.toFixed(2)} store credit to cover the early holding deposit.`);
      return;
    }

    // Deduct deposit
    setStoreCredits(prev => prev - item.depositRequired);
    const newTx: LedgerTx = {
      id: `tx_dep_${Date.now()}`,
      type: 'spend',
      amount: item.depositRequired,
      description: `Holding Deposit: Early access lock on ${item.name}`,
      date: new Date().toISOString().split('T')[0]
    };
    setLedgerHistory(prev => [newTx, ...prev]);

    setReserves(prev =>
      prev.map(r => {
        if (r.id === item.id) {
          return {
            ...r,
            isReserved: true,
            totalReserved: r.totalReserved + 1,
            confCode: `NB-RESERVE-${Math.floor(Math.random() * 9000 + 1000)}`
          };
        }
        return r;
      })
    );

    alert(`🎉 Success! Early Access Deposit paid. Your reserve is secured. Confirmation Code: NB-RESERVE-${Math.floor(Math.random() * 9000 + 1000)}.`);
  };

  // Add category quest bundle to cart (Feature 56)
  const handleBuyQuestBundle = (quest: typeof questCatalog[0]) => {
    // Calculate total bundle price with quest discount
    const totalOriginal = quest.items.reduce((sum, item) => sum + item.price, 0);
    const totalDiscounted = totalOriginal * (1 - quest.discountPct / 100);

    // Prompt user
    if (confirm(`Would you like to purchase the complete "${quest.title}" Bundle at a single-click discount of ${quest.discountPct}%? Total: $${totalDiscounted.toFixed(2)} (Save $${(totalOriginal - totalDiscounted).toFixed(2)})`)) {
      
      // Add each item to the cart as a bundle special rate
      quest.items.forEach(item => {
        const fullProd = products.find(p => p.id === item.id);
        if (fullProd) {
          onAddToCart({
            ...fullProd,
            name: `${fullProd.name} (${quest.title} Bundle Discount)`,
            price: Math.round(fullProd.price * (1 - quest.discountPct / 100))
          });
        }
      });

      // Reward them with category quest credits
      setStoreCredits(prev => prev + quest.rewardCredits);
      const newTx: LedgerTx = {
        id: `tx_quest_${Date.now()}`,
        type: 'earn',
        amount: quest.rewardCredits,
        description: `Quest Completed: Completed "${quest.title}" interactive gear combination`,
        date: new Date().toISOString().split('T')[0]
      };
      setLedgerHistory(prev => [newTx, ...prev]);

      alert(`🛍️ Bundle Added! We have added both premium components with a ${quest.discountPct}% rate to your shopping cart. Completed Quest rewards you +$${quest.rewardCredits.toFixed(2)} Store Credits!`);
    }
  };

  return (
    <div id="loyalty-hub-container" className="space-y-8 pb-16 animate-fade-in">
      
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 text-white shadow-lg">
        <div className="absolute inset-0 bg-radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.15),transparent_50%)"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-[10px] font-mono font-bold text-teal-400 border border-teal-500/20 uppercase tracking-widest">
              <Award className="h-3.5 w-3.5" />
              Nexus Gamification & Loyalty Engine
            </span>
            <h2 className="text-3xl font-black tracking-tight leading-none">
              Client Rewards & <span className="text-teal-400">Retention Arena</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Unlock cumulative tiers, participate in governance votes, secure early hardware reserves, complete gear quests, and earn real store-credit payouts via verified contributions.
            </p>
          </div>

          {/* ACTIVE STORE CREDIT WIDGET */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-xl min-w-[220px]">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
              <Coins className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Store Credits</p>
              <p className="text-3xl font-black text-white font-mono leading-none mt-1">
                ${storeCredits.toFixed(2)}
              </p>
              <span className="text-[9px] font-mono text-emerald-400 mt-1 block">✓ 100% Secure Ledger</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* LEFT COLUMN: TRANSACTIONS & SYSTEM TIERS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 52. CUSTOMER TIERS WIDGET */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-500" />
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Customer Loyalty Tier</h3>
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase border px-2.5 py-0.5 rounded-full ${tierInfo.badgeColor}`}>
                {tierInfo.name}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>Lifetime Volume</span>
                <span className="font-mono">${lifetimeSpend.toFixed(2)}</span>
              </div>
              {/* Progress Bar */}
              <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative flex items-center">
                <div 
                  className={`h-full bg-gradient-to-r ${tierInfo.color} rounded-full transition-all duration-1000`} 
                  style={{ width: `${tierInfo.pct}%` }}
                />
                <span className="absolute inset-0 text-center text-[9px] font-mono font-bold text-slate-700 flex items-center justify-center">
                  {tierInfo.pct >= 100 ? 'Milestone Cleared' : `${tierInfo.pct.toFixed(0)}% to Next Perk`}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Bronze: $0</span>
                <span>Silver: $200</span>
                <span>Gold: $600+</span>
              </div>
            </div>

            {/* Unlocked Perks List */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Active Functional Perks:</p>
              <ul className="space-y-1.5">
                {tierInfo.perks.map((perk, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              {/* Custom aesthetics visual demonstration */}
              {lifetimeSpend >= 600 ? (
                <div className="mt-2.5 pt-2 border-t border-slate-200 text-center">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 animate-pulse">
                    ✨ Gold Shimmer Profile Active ✨
                  </span>
                </div>
              ) : lifetimeSpend >= 200 ? (
                <div className="mt-2.5 pt-2 border-t border-slate-200 text-center">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-600 bg-slate-300/30 px-3 py-1 rounded-full border border-slate-400/20">
                    💿 Silver Glow Active
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* 51. MICRO-LOYALTY LEDGER TRANSACTIONS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-600" />
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Ledger Balance Statements</h3>
              </div>
              <span className="text-[9px] font-mono text-slate-400">KV STORE</span>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {ledgerHistory.map((tx) => (
                <div key={tx.id} className="flex justify-between items-start text-xs border-b border-slate-50 pb-2">
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-semibold text-slate-700 leading-tight">{tx.description}</p>
                    <p className="text-[9px] font-mono text-slate-400">{tx.date}</p>
                  </div>
                  <span className={`font-mono font-bold ${tx.type === 'earn' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'earn' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Interactive earning via Bug Reporting */}
            <form onSubmit={handleFileBug} className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">File Verified Bug Report</label>
                <span className="text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Earn +$5.00 Store Credit
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken spacing on checkout page..."
                  value={bugDesc}
                  onChange={(e) => setBugDesc(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  Submit
                </button>
              </div>
              {bugSuccess && (
                <p className="text-[9px] text-emerald-600 font-bold animate-fade-in">
                  ✓ Bug log verified by sandbox core! +$5.00 ledger credits released.
                </p>
              )}
            </form>
          </div>

          {/* 55. DIGITAL UNBOX ACHIEVEMENTS / BADGES */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Unbox Achievements</h3>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Verified Profiles</span>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Unlock category badges on your reviewer profile by publishing verified, high-effort reviews for newly launched gear.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {badgeCatalog.map((b) => {
                  const Icon = b.icon;
                  const isEarned = earnedBadges.includes(b.id);
                  return (
                    <div 
                      key={b.id} 
                      className={`rounded-xl border p-2.5 flex flex-col justify-between h-[105px] transition-all relative ${
                        isEarned 
                          ? `${b.color} border-current shadow-xs` 
                          : 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60'
                      }`}
                      title={b.desc}
                    >
                      <div className="flex justify-between items-start">
                        <Icon className="h-4 w-4" />
                        {isEarned ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                        ) : (
                          <Lock className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-tight">{b.name}</p>
                        <p className="text-[8px] opacity-75 mt-0.5 line-clamp-2 leading-tight">{b.desc}</p>
                      </div>
                      {isEarned && (
                        <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full p-0.5 text-[6px]">
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* MIDDLE COLUMN: SUB INCENTIVES, GOVERNANCE, FLASH RESERVES */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* 53. STREAK-BASED PURCHASE INCENTIVES */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500 fill-current animate-pulse" />
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Replenish Streak Incentives</h3>
                  </div>
                  <span className="text-[9px] font-mono text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full font-bold">
                    Streak Bonus
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-orange-50/45 border border-orange-100 rounded-xl p-4">
                  <div className="text-3xl font-black text-orange-600 font-mono flex items-center leading-none">
                    {replenishStreak}
                    <span className="text-xs font-normal text-slate-500 uppercase ml-1">Months</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Compounding Discount Status</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sustaining sequential replenishment adds <strong>5% discount per consecutive month</strong>.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span>Active Subscription Discount:</span>
                    <span className="font-mono font-bold text-orange-600">-{compoundingDiscount}% Off</span>
                  </div>
                  {/* Streak progress nodes */}
                  <div className="flex items-center justify-between gap-1">
                    {[1, 2, 3, 4, 5].map((m) => (
                      <div key={m} className="flex-1 text-center space-y-1">
                        <div className={`h-2.5 rounded-full ${
                          m <= replenishStreak 
                            ? 'bg-gradient-to-r from-orange-400 to-orange-500' 
                            : 'bg-slate-100 border border-slate-200/60'
                        }`} />
                        <span className="text-[8px] font-mono text-slate-400 block">Mo {m} (-{Math.min(20, m*5)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-3">
                <span className="text-[9px] font-mono text-slate-400 max-w-[60%] leading-tight">
                  Auto-replenish subscriptions stay locked into this compounding discount index.
                </span>
                <button
                  onClick={handleAdvanceStreak}
                  className="rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  Simulate Next Month
                </button>
              </div>
            </div>

            {/* 54. PLATFORM GOVERNANCE VOTING FORUMS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Vote className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Governance Forum</h3>
                  </div>
                  <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full font-bold">
                    Decentralized Proposals
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Allows premium/Elite members to cast platform hash-votes on future catalog additions, grants, and environmental initiatives.
                </p>

                {/* Proposals list */}
                <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {proposals.map((prop) => (
                    <div key={prop.id} className="border border-slate-100 rounded-xl p-2.5 space-y-1 bg-slate-50/65">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] font-bold text-slate-800 leading-tight block">{prop.title}</span>
                        <button
                          onClick={() => handleVote(prop.id)}
                          className={`rounded-lg px-2 py-0.5 text-[9px] font-bold transition-all shrink-0 cursor-pointer ${
                            prop.voted 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'
                          }`}
                        >
                          {prop.voted ? '✓ Casted' : 'Cast Vote'}
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                        <span className="uppercase text-indigo-500">{prop.category}</span>
                        <span>{prop.votesCount} Hash-Votes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50">
                <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                  Voting weight is dynamically scaled by lifetime spend.
                </span>
              </div>
            </div>

          </div>

          {/* 56. CURATED CATEGORY QUESTS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-500" />
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Curated Category Quests</h3>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Click to Purchase Bundles</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Equip complete workflow configurations with single-click combined package discounts and store credit bonuses.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {questCatalog.map((q) => (
                <div key={q.id} className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-gradient-to-br from-white to-slate-50/50 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{q.title}</h4>
                      <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0">
                        -{q.discountPct}% Bundle rate
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{q.desc}</p>
                    
                    <div className="bg-white/80 border border-slate-100 rounded-xl p-2.5 space-y-1.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Included Components:</p>
                      {q.items.map((it) => (
                        <div key={it.id} className="flex justify-between items-center text-[10px] text-slate-600">
                          <span className="truncate max-w-[80%]">• {it.name}</span>
                          <span className="font-mono text-slate-400 line-through">${it.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100/50 flex items-center justify-between gap-2 mt-2">
                    <span className="text-[9px] font-mono text-emerald-600 font-bold">
                      Earn +${q.rewardCredits.toFixed(2)} Store Credits
                    </span>
                    <button
                      onClick={() => handleBuyQuestBundle(q)}
                      className="rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 text-[10px] font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      Buy Bundle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            
            {/* 58. REFERRAL ENGINE WITH ESCROW LOCKS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Affiliate Referral Escrow</h3>
                  </div>
                  <span className="text-[9px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-bold">
                    Escrow Locked
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Commissions remain safely locked in escrow until the standard 30-day return window clears.
                </p>

                {/* Referral Links Copy */}
                <div className="bg-slate-50 border border-slate-250/50 rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-[9px] text-slate-400 truncate flex-1">
                    https://nexusbazaar.com/invite?ref={currentUser.id}
                  </span>
                  <button
                    onClick={handleCopyReferral}
                    className="rounded-lg bg-white border border-slate-200 text-slate-500 p-1.5 hover:text-teal-600 transition-colors shrink-0 cursor-pointer"
                    title="Copy affiliate link"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Referral Escrow List */}
                <div className="space-y-2">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="flex justify-between items-center text-[10px] border border-slate-50 rounded-xl p-2 bg-slate-50/50">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-700 block">{ref.friendName}</span>
                        <span className="text-slate-400 text-[8px]">Order Total: ${ref.orderTotal} • {ref.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-700 block">+${ref.commission.toFixed(2)}</span>
                        {ref.status === 'escrow' ? (
                          <span className="inline-flex items-center gap-0.5 text-[8px] text-amber-600 font-mono">
                            <Hourglass className="h-2 w-2 animate-spin" /> {ref.daysRemaining} days left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[8px] text-emerald-600 font-bold">
                            ✓ Released
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[9px] font-mono text-slate-400 max-w-[60%] leading-tight">
                  Simulate passing 30 days to release funds from escrow.
                </span>
                <button
                  onClick={handleSimulateTime}
                  disabled={advancingDays}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-3 py-2 text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                >
                  {advancingDays ? 'Simulating...' : 'Simulate 30 Days'}
                </button>
              </div>
            </div>

            {/* 59. EARLY ACCESS FLASH RESERVES */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Early Access Flash Reserves</h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">Gold/Elite Lock</span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Lock in early holding deposits on highly anticipated hardware or limited-run fashion drops.
                </p>

                {/* Reserves list */}
                <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                  {reserves.map((res) => (
                    <div key={res.id} className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50 space-y-2">
                      <div className="flex gap-2.5 items-start">
                        <img src={res.image} alt={res.name} className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                        <div className="flex-1 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-800 leading-tight block">{res.name}</span>
                          <p className="text-[8px] text-slate-400 line-clamp-1 leading-tight">{res.description}</p>
                          <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-1">
                            <span>Retail: ${res.price}</span>
                            <span>Release in {res.releaseDays} Days</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100/50">
                        <div>
                          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wide block">Deposit Fee:</span>
                          <span className="font-mono text-xs font-bold text-slate-800">${res.depositRequired.toFixed(2)} Store Credits</span>
                        </div>
                        {res.isReserved ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 text-[8px] font-bold">
                              ✓ Locked & Secured
                            </span>
                            <span className="block text-[7px] font-mono text-slate-400 mt-0.5">{res.confCode}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleReserveEarly(res)}
                            className="rounded-lg bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1 text-[9px] font-bold transition-all cursor-pointer"
                          >
                            Reserve Early
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50 text-[9px] font-mono text-slate-400">
                <span>🔒 Deposit goes to escrow; fully refundable if cancelled.</span>
              </div>
            </div>

            {/* 62. CIRCULAR TRADE-IN EVALUATION ENGINE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 text-slate-800">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">♻️</span>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Circular Trade-In Evaluation Engine</h3>
                </div>
                <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
                  Instant Credit
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Repurpose past purchases and divert physical hardware from landfills. Use our automated diagnostic engine to generate an instant marketplace credit quote.
              </p>

              {/* Progress Steps Indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-mono text-[9px] text-slate-400">
                <div className={`flex items-center gap-1 ${tradeStep === 1 ? 'text-teal-600 font-bold' : ''}`}>
                  <span className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center border text-[8px]">1</span>
                  <span>Select Unit</span>
                </div>
                <div className="h-px bg-slate-200 flex-1 mx-2" />
                <div className={`flex items-center gap-1 ${tradeStep === 2 ? 'text-teal-600 font-bold' : ''}`}>
                  <span className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center border text-[8px]">2</span>
                  <span>Diagnostics</span>
                </div>
                <div className="h-px bg-slate-200 flex-1 mx-2" />
                <div className={`flex items-center gap-1 ${tradeStep === 3 ? 'text-teal-600 font-bold' : ''}`}>
                  <span className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center border text-[8px]">3</span>
                  <span>Claim Credit</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {tradeStep === 1 && (
                  <motion.div
                    key="trade-step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Select a registered past purchase:</p>
                    <div className="grid gap-2.5">
                      {tradeInOptions.map((opt) => {
                        const isSelected = selectedTradeItem?.id === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedTradeItem(opt)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-teal-500 bg-teal-500/5' 
                                : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                            }`}
                          >
                            <img src={opt.image} alt={opt.name} className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                            <div className="flex-1 min-w-0 text-left">
                              <span className="text-[10px] font-bold text-slate-800 block truncate">{opt.name}</span>
                              <span className="text-[9px] font-mono text-slate-400">Original Price: ${opt.originalPrice}</span>
                            </div>
                            {isSelected && (
                              <span className="h-5 w-5 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        disabled={!selectedTradeItem}
                        onClick={() => setTradeStep(2)}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        Run Diagnostics <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {tradeStep === 2 && selectedTradeItem && (
                  <motion.div
                    key="trade-step-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center gap-2 text-xs text-slate-700">
                      <span className="font-bold">Target Cargo:</span>
                      <span className="truncate text-slate-500">{selectedTradeItem.name}</span>
                    </div>

                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide text-left">Select current unit diagnostics:</p>
                    
                    <div className="grid gap-2 text-xs text-slate-700 text-left">
                      
                      <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={diagFunctional}
                          onChange={(e) => setDiagFunctional(e.target.checked)}
                          className="rounded border-slate-350 text-teal-600 focus:ring-teal-500 h-4.5 w-4.5 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold block text-slate-800">Functional Integrity</span>
                          <span className="text-[9px] text-slate-400">All drivers, inputs, and components boot up and respond instantly.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={diagCosmetic}
                          onChange={(e) => setDiagCosmetic(e.target.checked)}
                          className="rounded border-slate-350 text-teal-600 focus:ring-teal-500 h-4.5 w-4.5 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold block text-slate-800">Cosmetic Score (Grade-A)</span>
                          <span className="text-[9px] text-slate-400">No deep hairline structural cracks, only minor aesthetic wear.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={diagBattery}
                          onChange={(e) => setDiagBattery(e.target.checked)}
                          className="rounded border-slate-350 text-teal-600 focus:ring-teal-500 h-4.5 w-4.5 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold block text-slate-800">Battery Capacity (&gt;80% SoC)</span>
                          <span className="text-[9px] text-slate-400">Internal battery retains original discharge cycles cleanly.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={diagBox}
                          onChange={(e) => setDiagBox(e.target.checked)}
                          className="rounded border-slate-350 text-teal-600 focus:ring-teal-500 h-4.5 w-4.5 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold block text-slate-800">Retained Retail Packaging</span>
                          <span className="text-[9px] text-slate-400">Ships in the original clean packaging with accessories.</span>
                        </div>
                      </label>

                    </div>

                    <div className="bg-slate-950 rounded-xl p-3 flex items-center justify-between border border-slate-850">
                      <div className="text-left">
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wide block">Estimated Return Value:</span>
                        <span className="text-xl font-mono font-black text-emerald-400">${tradeInValue}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        {Math.round((tradeInValue / selectedTradeItem.originalPrice) * 100)}% of original retail
                      </span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setTradeStep(1)}
                        className="rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setTradeStep(3)}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        Generate Quote <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {tradeStep === 3 && selectedTradeItem && (
                  <motion.div
                    key="trade-step-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/30 border border-emerald-200/60 rounded-2xl p-5 text-center space-y-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center text-base mx-auto animate-pulse">
                        🛡️
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-emerald-700 uppercase tracking-widest block font-bold text-center">Verified Instantly</span>
                        <h4 className="text-xs font-extrabold text-slate-800 text-center">{selectedTradeItem.name}</h4>
                        <p className="text-[10px] text-slate-500 text-center">
                          Diagnostics check confirmed. Instant circular ledger release prepared.
                        </p>
                      </div>

                      <div className="bg-white border border-emerald-100 rounded-xl py-3 px-4 inline-block font-mono">
                        <span className="text-[8px] text-slate-400 uppercase tracking-wider block">Claimable Store Credit:</span>
                        <span className="text-3xl font-black text-emerald-600">${tradeInValue.toFixed(2)}</span>
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-400 text-center leading-normal">
                      By confirming, your credit is immediately activated on the platform. A pre-paid, zero-emission carbon-neutral cargo label will be generated for your mailer automatically.
                    </p>

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setTradeStep(2)}
                        className="rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
                      >
                        Adjust Specs
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteTradeIn}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-[0_0_8px_rgba(16,185,129,0.3)] hover:shadow-[0_0_12px_rgba(16,185,129,0.5)] cursor-pointer"
                      >
                        Confirm Trade-In & Claim Credit
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
