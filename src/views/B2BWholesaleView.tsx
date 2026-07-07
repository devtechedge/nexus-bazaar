import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Users, FileText, Calendar, CheckSquare, Terminal, 
  CreditCard, Plus, Trash2, CheckCircle2, AlertTriangle, ArrowRight, 
  HelpCircle, Sparkles, Send, FileCheck, Layers, Scale, DollarSign,
  ArrowUpDown, RefreshCw, BarChart3, Truck
} from 'lucide-react';
import { User, Product } from '../lib/db';

interface B2BWholesaleViewProps {
  currentUser: User;
  products: Product[];
  onAddToCart: (product: Product, customPrice?: number) => void;
  setActiveView: (view: 'storefront' | 'search' | 'details' | 'cart' | 'seller' | 'admin' | 'orders' | 'wishlist' | 'guilds' | 'styling' | 'curations' | 'loyalty' | 'security' | 'b2b') => void;
}

// Inter-system B2B database items stored locally in RAM / localStorage to keep state consistent
interface RFQ {
  id: string;
  title: string;
  category: string;
  quantity: number;
  specs: string;
  status: 'OPEN' | 'BIDS_RECEIVED' | 'ACCEPTED' | 'CLOSED';
  targetDate: string;
  procurementManager: string;
  bids: RFQBid[];
  complianceRequirements: string[];
}

interface RFQBid {
  id: string;
  supplierName: string;
  unitPrice: number;
  totalQuote: number;
  complianceScore: number;
  deliveryDays: number;
  timestamp: string;
  isAccepted?: boolean;
}

interface Net30Invoice {
  id: string;
  companyName: string;
  poNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  daysRemaining: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

interface CorporateSeat {
  id: string;
  name: string;
  role: string;
  quarterlyBudget: number;
  spent: number;
  needsApprovalOver: number;
  status: 'ACTIVE' | 'SUSPENDED';
}

interface RecurringPO {
  id: string;
  productName: string;
  quantity: number;
  interval: 'Monthly' | 'Quarterly' | 'Bi-Annually';
  nextShipDate: string;
  status: 'ACTIVE' | 'PAUSED';
}

export default function B2BWholesaleView({
  currentUser,
  products,
  onAddToCart,
  setActiveView
}: B2BWholesaleViewProps) {
  // Tabs management
  const [activeTab, setActiveTab] = React.useState<'rfq' | 'pricing' | 'compliance' | 'finance' | 'logistics' | 'api'>('pricing');

  // Multi-seat user identity (simulate switching within the enterprise)
  const [b2bRole, setB2bRole] = React.useState<'procurement_officer' | 'supplier'>('procurement_officer');

  // --- 81. Structured RFQ Hub States ---
  const [rfqs, setRfqs] = React.useState<RFQ[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('nexus_b2b_rfqs');
    if (stored) return JSON.parse(stored);

    // Initial mock RFQs
    return [
      {
        id: 'rfq-1',
        title: 'High-Tensile Titanium Alloy Beams',
        category: 'Heavy Construction Materials',
        quantity: 1500,
        specs: 'Tensile Strength > 950 MPa, ISO 9001 Compliant, Certification required.',
        status: 'BIDS_RECEIVED',
        targetDate: '2026-09-15',
        procurementManager: 'Sarah Jenkins (Procurement Director)',
        complianceRequirements: ['ISO-9001', 'Fair-Labor-Compliance', 'General-Liability-2M'],
        bids: [
          {
            id: 'bid-1-1',
            supplierName: 'TitanForge Industrial Corp',
            unitPrice: 38.50,
            totalQuote: 57750,
            complianceScore: 100,
            deliveryDays: 14,
            timestamp: '2026-07-06T14:32:00Z'
          },
          {
            id: 'bid-1-2',
            supplierName: 'Apex Raw Metals Ltd',
            unitPrice: 34.20,
            totalQuote: 51300,
            complianceScore: 75,
            deliveryDays: 20,
            timestamp: '2026-07-06T18:15:00Z'
          }
        ]
      },
      {
        id: 'rfq-2',
        title: 'Custom Biodegradable Graphene Matrix Sheets',
        category: 'Advanced Nano-Textiles',
        quantity: 5000,
        specs: 'Graphene volume fraction 2.5%, Thickness: 0.15mm, Carbon Neutral Stamp.',
        status: 'OPEN',
        targetDate: '2026-10-01',
        procurementManager: 'Sarah Jenkins (Procurement Director)',
        complianceRequirements: ['ISO-9001', 'ESG-Carbon-Neutral-Audit'],
        bids: []
      }
    ];
  });

  // Create RFQ form states
  const [newRfqTitle, setNewRfqTitle] = React.useState('');
  const [newRfqCategory, setNewRfqCategory] = React.useState('Heavy Construction Materials');
  const [newRfqQty, setNewRfqQty] = React.useState(1000);
  const [newRfqSpecs, setNewRfqSpecs] = React.useState('');
  const [newRfqDate, setNewRfqDate] = React.useState('2026-09-30');
  const [newRfqCompliance, setNewRfqCompliance] = React.useState<string[]>(['ISO-9001']);

  // Supplier Placement Bid states
  const [selectedRfqForBid, setSelectedRfqForBid] = React.useState<RFQ | null>(null);
  const [supplierBidPrice, setSupplierBidPrice] = React.useState(35);
  const [supplierBidDays, setSupplierBidDays] = React.useState(15);

  // --- 82. Dynamic Volume-Tier Pricing Grid States ---
  const b2bBulkInventory = [
    {
      id: 'b2b-p1',
      name: 'Hyper-Alloy Structural Girders',
      description: 'Zero-gravity reinforced carbon matrix beams designed for high-load planetary framing.',
      category: 'Materials',
      basePrice: 120,
      image: 'https://picsum.photos/seed/beams/300/200',
      specs: 'Dimensions: 12m x 0.4m x 0.4m, Weight: 240kg each',
      tiers: [
        { min: 1, max: 99, unitPrice: 120 },
        { min: 100, max: 499, unitPrice: 102 }, // 15% discount
        { min: 500, max: 1999, unitPrice: 90 }, // 25% discount
        { min: 2000, max: 99999, unitPrice: 72 } // 40% discount
      ]
    },
    {
      id: 'b2b-p2',
      name: 'Quantum Solar Substrates',
      description: 'Flexible ultra-conducting photovoltaic matrices capturing 94% solar spectrum energy.',
      category: 'Electronics',
      basePrice: 340,
      image: 'https://picsum.photos/seed/solarsub/300/200',
      specs: 'Power yield: 450W/m², Flex coefficient: 0.08',
      tiers: [
        { min: 1, max: 49, unitPrice: 340 },
        { min: 50, max: 199, unitPrice: 289 }, // 15% discount
        { min: 200, max: 999, unitPrice: 255 }, // 25% discount
        { min: 1000, max: 99999, unitPrice: 204 } // 40% discount
      ]
    },
    {
      id: 'b2b-p3',
      name: 'Bio-degradable Graphene Roll',
      description: 'High-density protective shielding that dissolves safely after 5 cycles of planetary rotation.',
      category: 'Nanomaterials',
      basePrice: 85,
      image: 'https://picsum.photos/seed/graphene/300/200',
      specs: 'Width: 1.5m, Length: 100m, Biodegradability rate: 100%',
      tiers: [
        { min: 1, max: 99, unitPrice: 85 },
        { min: 100, max: 499, unitPrice: 72 }, // 15% discount
        { min: 500, max: 1999, unitPrice: 64 }, // 25% discount
        { min: 2000, max: 99999, unitPrice: 51 } // 40% discount
      ]
    }
  ];

  const [selectedB2bProduct, setSelectedB2bProduct] = React.useState(b2bBulkInventory[0]);
  const [b2bOrderQuantity, setB2bOrderQuantity] = React.useState(150);

  // Recalculate tier details instantly
  const activePriceTier = React.useMemo(() => {
    const qty = b2bOrderQuantity;
    const matchedTier = selectedB2bProduct.tiers.find(t => qty >= t.min && qty <= t.max);
    return matchedTier || selectedB2bProduct.tiers[0];
  }, [selectedB2bProduct, b2bOrderQuantity]);

  const discountPercent = React.useMemo(() => {
    const base = selectedB2bProduct.basePrice;
    const current = activePriceTier.unitPrice;
    return Math.round(((base - current) / base) * 100);
  }, [selectedB2bProduct, activePriceTier]);

  // --- 83. Corporate Multi-Seat Account Controls States ---
  const [corporateSeats, setCorporateSeats] = React.useState<CorporateSeat[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('nexus_b2b_corporate_seats');
    if (stored) return JSON.parse(stored);
    return [
      { id: 'seat-1', name: 'Sarah Jenkins', role: 'Chief Procurement Officer (Admin)', quarterlyBudget: 500000, spent: 341200, needsApprovalOver: 100000, status: 'ACTIVE' },
      { id: 'seat-2', name: 'Michael Reynolds', role: 'Field Supply Manager', quarterlyBudget: 80000, spent: 74200, needsApprovalOver: 15000, status: 'ACTIVE' },
      { id: 'seat-3', name: 'Linda Vance', role: 'Associate Buyer', quarterlyBudget: 30000, spent: 28500, needsApprovalOver: 5000, status: 'ACTIVE' }
    ];
  });

  const [approvalAlertThresholdEnabled, setApprovalAlertThresholdEnabled] = React.useState<boolean>(true);
  const [seatNameInput, setSeatNameInput] = React.useState('');
  const [seatRoleInput, setSeatRoleInput] = React.useState('Associate Buyer');
  const [seatBudgetInput, setSeatBudgetInput] = React.useState(50000);
  const [seatApprovalInput, setSeatApprovalInput] = React.useState(10000);

  // --- 84. Net-30 Invoicing Credit Framework States ---
  const [creditLimit, setCreditLimit] = React.useState<number>(100000);
  const [usedCredit, setUsedCredit] = React.useState<number>(42800);
  const [net30Invoices, setNet30Invoices] = React.useState<Net30Invoice[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('nexus_b2b_net30_ledger');
    if (stored) return JSON.parse(stored);
    return [
      { id: 'inv-9002', companyName: 'Bazaar Enterprise', poNumber: 'PO-2026-881', amount: 24000, issueDate: '2026-06-25', dueDate: '2026-07-25', daysRemaining: 18, status: 'PENDING' },
      { id: 'inv-8911', companyName: 'Bazaar Enterprise', poNumber: 'PO-2026-724', amount: 18800, issueDate: '2026-06-10', dueDate: '2026-07-10', daysRemaining: 3, status: 'PENDING' },
      { id: 'inv-8201', companyName: 'Bazaar Enterprise', poNumber: 'PO-2026-440', amount: 31000, issueDate: '2026-05-15', dueDate: '2026-06-15', daysRemaining: 0, status: 'PAID' }
    ];
  });

  const [paymentOption, setPaymentOption] = React.useState<'direct' | 'net30'>('direct');

  // --- 85. Automated Tax-Exemption Verification States ---
  const [taxExemptStatus, setTaxExemptStatus] = React.useState<'NOT_SUBMITTED' | 'PARSING' | 'VERIFIED' | 'EXPIRED'>(() => {
    if (typeof window === 'undefined') return 'NOT_SUBMITTED';
    const stored = localStorage.getItem('nexus_b2b_tax_exempt_status');
    return (stored as any) || 'NOT_SUBMITTED';
  });

  const [parsedExemptionCertificate, setParsedExemptionCertificate] = React.useState<{
    stateId?: string;
    legalEntity?: string;
    exemptionCode?: string;
    expiryDate?: string;
  } | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('nexus_b2b_exemption_certificate');
    return stored ? JSON.parse(stored) : null;
  });

  const [exemptUploadProgress, setExemptUploadProgress] = React.useState(0);

  // --- 86. Custom Pallet Logistics Configurator Outputs ---
  // Pallet Dimensions: 48" x 40" x 48" high
  // Weight capacity: 4600 lbs, Volume capacity: 53.3 cubic feet
  const palletMetrics = React.useMemo(() => {
    const unitWeight = selectedB2bProduct.id === 'b2b-p1' ? 240 : selectedB2bProduct.id === 'b2b-p2' ? 12 : 45; // weight in lbs
    const unitVolume = selectedB2bProduct.id === 'b2b-p1' ? 10.5 : selectedB2bProduct.id === 'b2b-p2' ? 0.8 : 2.5; // volume in cu ft

    const totalWeight = b2bOrderQuantity * unitWeight;
    const totalVolume = b2bOrderQuantity * unitVolume;

    // A single pallet can hold up to 2000 lbs or 45 cubic feet comfortably
    const palletsNeededByWeight = Math.ceil(totalWeight / 2000);
    const palletsNeededByVolume = Math.ceil(totalVolume / 45);
    const palletsNeeded = Math.max(palletsNeededByWeight, palletsNeededByVolume, 1);

    // Standard 40ft High Cube Container fits ~20 pallets
    const containerUtilization = Math.min(100, Math.round((palletsNeeded / 20) * 100));

    // Heavy Freight Cost calculation: $150 base + $75 per pallet + distance factor
    const miles = 420;
    const baseFreightCost = 150 + (palletsNeeded * 75) + (miles * 0.45);

    return {
      totalWeight,
      totalVolume,
      palletsNeeded,
      containerUtilization,
      baseFreightCost: Math.round(baseFreightCost)
    };
  }, [selectedB2bProduct, b2bOrderQuantity]);

  // --- 87. Scheduled Bulk Purchase Orders States ---
  const [scheduledPOs, setScheduledPOs] = React.useState<RecurringPO[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('nexus_b2b_recurring_pos');
    if (stored) return JSON.parse(stored);
    return [
      { id: 'po-rec-1', productName: 'Hyper-Alloy Structural Girders', quantity: 250, interval: 'Quarterly', nextShipDate: '2026-10-01', status: 'ACTIVE' },
      { id: 'po-rec-2', productName: 'Bio-degradable Graphene Roll', quantity: 1200, interval: 'Monthly', nextShipDate: '2026-08-01', status: 'ACTIVE' }
    ];
  });

  const [recPoProduct, setRecPoProduct] = React.useState('Hyper-Alloy Structural Girders');
  const [recPoQty, setRecPoQty] = React.useState(500);
  const [recPoInterval, setRecPoInterval] = React.useState<'Monthly' | 'Quarterly' | 'Bi-Annually'>('Quarterly');

  // --- 88. B2B Vendor Compliance Checklists States ---
  const [complianceMatrix, setComplianceMatrix] = React.useState({
    iso9001: true,
    fairLabor: true,
    generalLiability: true,
    esgAudit: false,
  });

  const complianceScore = React.useMemo(() => {
    let score = 0;
    if (complianceMatrix.iso9001) score += 25;
    if (complianceMatrix.fairLabor) score += 25;
    if (complianceMatrix.generalLiability) score += 25;
    if (complianceMatrix.esgAudit) score += 25;
    return score;
  }, [complianceMatrix]);

  // --- 89. Direct API Product Feeds States ---
  const [apiToken, setApiToken] = React.useState('nk_b2b_live_9a2f1c8d3e5b107c89bf16d7a4f9e1e2d');
  const [apiConsoleResponse, setApiConsoleResponse] = React.useState<string | null>(null);
  const [apiLoading, setApiLoading] = React.useState(false);

  // --- 90. Split-Payment Corporate Funding Gateways States ---
  const [paymentSplits, setPaymentSplits] = React.useState<Array<{
    id: string;
    cardName: string;
    cardNumber: string;
    allocatedAmount: number;
    validated: boolean;
  }>>([
    { id: 'split-1', cardName: 'Primary Tech Expense Card', cardNumber: '•••• •••• •••• 9901', allocatedAmount: 0, validated: true },
    { id: 'split-2', cardName: 'Secondary Logistics Budget', cardNumber: '•••• •••• •••• 4210', allocatedAmount: 0, validated: true }
  ]);

  const [newSplitCardName, setNewSplitCardName] = React.useState('');
  const [newSplitCardNum, setNewSplitCardNum] = React.useState('4111 2222 3333 ');

  const b2bOrderTotal = React.useMemo(() => {
    return (activePriceTier.unitPrice * b2bOrderQuantity) + (taxExemptStatus === 'VERIFIED' ? 0 : Math.round((activePriceTier.unitPrice * b2bOrderQuantity) * 0.088)) + palletMetrics.baseFreightCost;
  }, [activePriceTier, b2bOrderQuantity, taxExemptStatus, palletMetrics]);

  // Auto-fill splits equally as default when order total changes
  React.useEffect(() => {
    if (b2bOrderTotal > 0 && paymentSplits.length > 0) {
      const splitShare = Math.round((b2bOrderTotal / paymentSplits.length) * 100) / 100;
      setPaymentSplits(prev => prev.map((split, i) => ({
        ...split,
        allocatedAmount: i === prev.length - 1 ? Math.round((b2bOrderTotal - (splitShare * (prev.length - 1))) * 100) / 100 : splitShare
      })));
    }
  }, [b2bOrderTotal, paymentSplits.length]);

  const allocatedTotal = React.useMemo(() => {
    return paymentSplits.reduce((sum, s) => sum + s.allocatedAmount, 0);
  }, [paymentSplits]);

  // Sync to localStorage
  React.useEffect(() => {
    localStorage.setItem('nexus_b2b_rfqs', JSON.stringify(rfqs));
  }, [rfqs]);

  React.useEffect(() => {
    localStorage.setItem('nexus_b2b_corporate_seats', JSON.stringify(corporateSeats));
  }, [corporateSeats]);

  React.useEffect(() => {
    localStorage.setItem('nexus_b2b_net30_ledger', JSON.stringify(net30Invoices));
  }, [net30Invoices]);

  React.useEffect(() => {
    localStorage.setItem('nexus_b2b_tax_exempt_status', taxExemptStatus);
  }, [taxExemptStatus]);

  React.useEffect(() => {
    if (parsedExemptionCertificate) {
      localStorage.setItem('nexus_b2b_exemption_certificate', JSON.stringify(parsedExemptionCertificate));
    }
  }, [parsedExemptionCertificate]);

  React.useEffect(() => {
    localStorage.setItem('nexus_b2b_recurring_pos', JSON.stringify(scheduledPOs));
  }, [scheduledPOs]);


  // --- Event Handlers ---
  
  // Submit new RFQ (Procurement Officer side)
  const handleCreateRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRfqTitle.trim() || !newRfqSpecs.trim()) {
      alert('Please fill out the RFQ title and technical specifications.');
      return;
    }

    const newRfq: RFQ = {
      id: `rfq-${Date.now()}`,
      title: newRfqTitle,
      category: newRfqCategory,
      quantity: newRfqQty,
      specs: newRfqSpecs,
      status: 'OPEN',
      targetDate: newRfqDate,
      procurementManager: currentUser.name,
      complianceRequirements: newRfqCompliance,
      bids: []
    };

    setRfqs(prev => [newRfq, ...prev]);
    setNewRfqTitle('');
    setNewRfqSpecs('');
    
    // Log to security ledger in localStorage
    const logs = (() => {
      const stored = localStorage.getItem('nexus_bazaar_security_ledger');
      return stored ? JSON.parse(stored) : [];
    })();
    logs.unshift({
      id: `sec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      source: 'RFQ_HUB',
      message: `Structured RFQ posted by ${currentUser.name} for ${newRfqQty}x "${newRfqTitle}". Required: [${newRfqCompliance.join(', ')}].`,
      hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    });
    localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));

    alert('🏆 RFQ created and dispatched to verified suppliers on the platform!');
  };

  // Supplier places competitive bid on open RFQ
  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfqForBid) return;

    if (complianceScore < 100) {
      alert('❌ RFQ BID REJECTED: Your vendor profile is currently not 100% compliant. Please complete all checklist certificates in the Compliance Hub tab.');
      return;
    }

    const newBid: RFQBid = {
      id: `bid-${Date.now()}`,
      supplierName: `${currentUser.name} Corp (Wholesale Division)`,
      unitPrice: supplierBidPrice,
      totalQuote: supplierBidPrice * selectedRfqForBid.quantity,
      complianceScore: complianceScore,
      deliveryDays: supplierBidDays,
      timestamp: new Date().toISOString()
    };

    setRfqs(prev => prev.map(rfq => {
      if (rfq.id === selectedRfqForBid.id) {
        return {
          ...rfq,
          status: 'BIDS_RECEIVED',
          bids: [newBid, ...rfq.bids]
        };
      }
      return rfq;
    }));

    // Log event to security ledger
    const logs = (() => {
      const stored = localStorage.getItem('nexus_bazaar_security_ledger');
      return stored ? JSON.parse(stored) : [];
    })();
    logs.unshift({
      id: `sec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      source: 'RFQ_HUB',
      message: `Supplier Bid of $${supplierBidPrice}/unit submitted on RFQ "${selectedRfqForBid.title}" by ${currentUser.name}.`,
      hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    });
    localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));

    setSelectedRfqForBid(null);
    alert('✓ Competitive Quote bid recorded and submitted to Procurement Team evaluation.');
  };

  // Accept a Bid (Procurement Officer Side)
  const handleAcceptBid = (rfqId: string, bidId: string) => {
    setRfqs(prev => prev.map(rfq => {
      if (rfq.id === rfqId) {
        return {
          ...rfq,
          status: 'ACCEPTED',
          bids: rfq.bids.map(b => b.id === bidId ? { ...b, isAccepted: true } : b)
        };
      }
      return rfq;
    }));

    const rfq = rfqs.find(r => r.id === rfqId);
    const bid = rfq?.bids.find(b => b.id === bidId);

    if (rfq && bid) {
      // Add items as custom bid rate order directly to user cart
      const bidItem: Product = {
        id: `bid-fulfilled-${rfqId}`,
        name: `${rfq.title} (RFQ Fulfilled Contract)`,
        description: `RFQ specifications contracted rate with ${bid.supplierName}.`,
        price: bid.unitPrice,
        brand: bid.supplierName,
        category: rfq.category,
        image: 'https://picsum.photos/seed/rfqwin/300/200',
        sellerId: 'b2b-contract',
        stock: rfq.quantity,
        isAuction: false,
        specs: rfq.specs
      };

      onAddToCart(bidItem, rfq.quantity);

      // Log event
      const logs = (() => {
        const stored = localStorage.getItem('nexus_bazaar_security_ledger');
        return stored ? JSON.parse(stored) : [];
      })();
      logs.unshift({
        id: `sec_${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'SECURE',
        source: 'RFQ_HUB',
        message: `Contract Awarded: RFQ "${rfq.title}" bid from ${bid.supplierName} accepted at $${bid.unitPrice}/unit ($${bid.totalQuote} total). Staged in checkout.`,
        hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      });
      localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));

      alert(`🤝 Contract Awarded to ${bid.supplierName}! Custom contract order rate added to cart.`);
    }
  };

  // Add bulk items to standard cart from Dynamic volume table
  const handleAddBulkToCart = () => {
    // Check if Corporate Multi-Seat rules block this order
    const buyerSeat = corporateSeats.find(s => s.name === currentUser.name) || corporateSeats[0];
    const totalOrderCost = activePriceTier.unitPrice * b2bOrderQuantity;

    if (approvalAlertThresholdEnabled && totalOrderCost > buyerSeat.needsApprovalOver) {
      const confirmApproval = window.confirm(
        `⚠️ APPROVAL WORKFLOW REQUIRED: This bulk order totaling $${totalOrderCost.toLocaleString()} exceeds your individual single-purchase approval threshold of $${buyerSeat.needsApprovalOver.toLocaleString()}.\n\nDo you want to route an automated Multi-Seat Request to Chief Procurement Admin Sarah Jenkins for immediate digital sign-off?`
      );

      if (!confirmApproval) return;

      // Add approval request entry on corporate ledgers
      alert(`🕒 Verification routed! Request sent to Sarah Jenkins. Standard dispatch temporarily locked.`);
    }

    const taxRate = taxExemptStatus === 'VERIFIED' ? 0 : 0.088;
    const taxes = Math.round(totalOrderCost * taxRate);
    const finalPriceWithFreight = totalOrderCost + taxes + palletMetrics.baseFreightCost;

    // Direct add custom rate
    const bulkProduct: Product = {
      id: `${selectedB2bProduct.id}-bulk`,
      name: `${selectedB2bProduct.name} (Bulk Tier Discount)`,
      description: selectedB2bProduct.description,
      price: activePriceTier.unitPrice,
      brand: 'Nexus Wholesale',
      category: selectedB2bProduct.category,
      image: selectedB2bProduct.image,
      sellerId: 'b2b-warehouse',
      stock: b2bOrderQuantity + 1000,
      isAuction: false,
      specs: selectedB2bProduct.specs
    };

    onAddToCart(bulkProduct, b2bOrderQuantity);

    // If Net-30 selected, inject invoice ledger
    if (paymentOption === 'net30') {
      const currentOutstanding = net30Invoices.reduce((sum, inv) => inv.status === 'PENDING' ? sum + inv.amount : sum, 0);
      if (currentOutstanding + finalPriceWithFreight > creditLimit) {
        alert(`❌ NET-30 CREDIT OVERLIMIT: This order total of $${finalPriceWithFreight.toLocaleString()} exceeds your available Net-30 credit headroom of $${(creditLimit - currentOutstanding).toLocaleString()}. Please repay outstanding invoices or choose direct card payment.`);
        return;
      }

      const newInvoice: Net30Invoice = {
        id: `inv-${Math.floor(1000 + Math.random() * 8999)}`,
        companyName: 'Bazaar Enterprise',
        poNumber: `PO-2026-${Math.floor(100 + Math.random() * 899)}`,
        amount: finalPriceWithFreight,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysRemaining: 30,
        status: 'PENDING'
      };

      setNet30Invoices(prev => [newInvoice, ...prev]);
      setUsedCredit(prev => prev + finalPriceWithFreight);

      // Log invoice creation
      const logs = (() => {
        const stored = localStorage.getItem('nexus_bazaar_security_ledger');
        return stored ? JSON.parse(stored) : [];
      })();
      logs.unshift({
        id: `sec_${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'SECURE',
        source: 'FINANCE_LEDGER',
        message: `Net-30 purchase authorized: ${newInvoice.poNumber} for $${finalPriceWithFreight}. Available credit adjusted.`,
        hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      });
      localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));
    }

    // Direct redirection message
    alert(`🛒 Bulk wholesale load successful!\n\nVolume target: ${b2bOrderQuantity} units\nUnit price: $${activePriceTier.unitPrice}\nPallets required: ${palletMetrics.palletsNeeded}\nFreight Freight Cost: $${palletMetrics.baseFreightCost}\nTax Exemption status: ${taxExemptStatus === 'VERIFIED' ? 'Tax Free (0%)' : 'Standard (8.8%)'}\nPayment Scheme: ${paymentOption === 'net30' ? 'Net-30 Invoice' : 'Direct Card Split'}`);
    setActiveView('cart');
  };

  // Repay Invoice
  const handleRepayInvoice = (id: string, amount: number) => {
    setNet30Invoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'PAID', daysRemaining: 0 } : inv));
    setUsedCredit(prev => Math.max(0, prev - amount));

    // Log payment
    const logs = (() => {
      const stored = localStorage.getItem('nexus_bazaar_security_ledger');
      return stored ? JSON.parse(stored) : [];
    })();
    logs.unshift({
      id: `sec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'SECURE',
      source: 'FINANCE_LEDGER',
      message: `Invoice ${id} paid in full. Recycled $${amount} into enterprise Net-30 credit availability.`,
      hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    });
    localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));

    alert(`✓ Net-30 Invoice ${id} repaid. Credit limit line updated!`);
  };

  // Corporate Seats budget adjustments
  const handleUpdateSeatLimit = (id: string, field: 'quarterlyBudget' | 'needsApprovalOver', value: number) => {
    setCorporateSeats(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Create Corporate Seat
  const handleAddCorporateSeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatNameInput.trim()) return;

    const newSeat: CorporateSeat = {
      id: `seat-${Date.now()}`,
      name: seatNameInput,
      role: seatRoleInput,
      quarterlyBudget: seatBudgetInput,
      spent: 0,
      needsApprovalOver: seatApprovalInput,
      status: 'ACTIVE'
    };

    setCorporateSeats(prev => [...prev, newSeat]);
    setSeatNameInput('');
    alert(`👤 Multi-seat access key provisioned for ${seatNameInput}!`);
  };

  // Simulated Document Parser for Tax-Exemption
  const handleSimulatedTaxExemptUpload = () => {
    setTaxExemptStatus('PARSING');
    setExemptUploadProgress(10);

    const interval = setInterval(() => {
      setExemptUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTaxExemptStatus('VERIFIED');
          const certificate = {
            stateId: `ST-${Math.floor(100000 + Math.random() * 899999)}`,
            legalEntity: 'Nexus Enterprise Guild LLC',
            exemptionCode: 'EX-SE-2026',
            expiryDate: '2028-12-31'
          };
          setParsedExemptionCertificate(certificate);

          // Log event
          const logs = (() => {
            const stored = localStorage.getItem('nexus_bazaar_security_ledger');
            return stored ? JSON.parse(stored) : [];
          })();
          logs.unshift({
            id: `sec_${Date.now()}`,
            timestamp: new Date().toISOString(),
            level: 'SECURE',
            source: 'TAX_EXEMPT_SERVICE',
            message: `OCR Verification Succeeded. Tax Exemption Code Registered: EX-SE-2026. Legal Entity: Nexus Enterprise Guild LLC. Taxes: 0.0%.`,
            hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
          });
          localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));

          alert('🎉 State Exemption Certificate Parsed successfully! Sales tax is now locked to 0.0% for all enterprise purchases.');
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  };

  // Add Recurring scheduled PO
  const handleSchedulePo = (e: React.FormEvent) => {
    e.preventDefault();
    const po: RecurringPO = {
      id: `po-rec-${Date.now()}`,
      productName: recPoProduct,
      quantity: recPoQty,
      interval: recPoInterval,
      nextShipDate: recPoInterval === 'Monthly' ? '2026-08-01' : recPoInterval === 'Quarterly' ? '2026-10-01' : '2027-01-01',
      status: 'ACTIVE'
    };

    setScheduledPOs(prev => [po, ...prev]);

    // Log scheduled PO
    const logs = (() => {
      const stored = localStorage.getItem('nexus_bazaar_security_ledger');
      return stored ? JSON.parse(stored) : [];
    })();
    logs.unshift({
      id: `sec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      source: 'LOGISTICS_DAEMON',
      message: `Automated Standing Bulk Order created: ${recPoQty}x "${recPoProduct}" on a ${recPoInterval} schedule.`,
      hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    });
    localStorage.setItem('nexus_bazaar_security_ledger', JSON.stringify(logs));

    alert(`📅 Automated Standing PO established! Future shipments scheduled on standard quarterly calendar rotations.`);
  };

  // Direct ERP Feed Simulation Console
  const handleTriggerApiFeed = () => {
    setApiLoading(true);
    setApiConsoleResponse(null);

    setTimeout(() => {
      const feedData = b2bBulkInventory.map(prod => ({
        sku: prod.id,
        name: prod.name,
        category: prod.category,
        base_unit_rate: prod.basePrice,
        on_hand_stock: Math.floor(450 + Math.random() * 2000),
        discounts: prod.tiers.map(t => ({
          min_qty: t.min,
          max_qty: t.max === 99999 ? 'UNLIMITED' : t.max,
          rate_per_unit: t.unitPrice
        })),
        logistics: {
          standard_pallet_count: 1,
          weight_per_pallet_lbs: prod.id === 'b2b-p1' ? 2400 : 1200,
          hazardous_material: false
        }
      }));

      setApiConsoleResponse(JSON.stringify({
        status: "success",
        timestamp: new Date().toISOString(),
        request_ip: "10.144.92.115",
        erp_gateway: "SAP-S4HANA-v9.4",
        records_loaded: feedData.length,
        results: feedData
      }, null, 2));

      setApiLoading(false);
    }, 800);
  };

  // Card split allocation helper
  const handleUpdateSplitAmount = (id: string, amount: number) => {
    setPaymentSplits(prev => prev.map(s => s.id === id ? { ...s, allocatedAmount: Math.max(0, amount) } : s));
  };

  const handleAddSplitCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSplitCardName.trim()) return;

    const newCard = {
      id: `split-${Date.now()}`,
      cardName: newSplitCardName,
      cardNumber: newSplitCardNum.includes('•') ? newSplitCardNum : `•••• •••• •••• ${newSplitCardNum.slice(-4)}`,
      allocatedAmount: 0,
      validated: true
    };

    setPaymentSplits(prev => [...prev, newCard]);
    setNewSplitCardName('');
    setNewSplitCardNum('4111 2222 3333 ');
    alert(`💳 Corporate expense gateway routed: Added "${newCard.cardName}"`);
  };

  return (
    <div className="pb-16 max-w-7xl mx-auto space-y-8 animate-fade-in text-left">
      
      {/* 1. JUMBO HERO TITLE */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/15 text-teal-400 font-bold font-mono text-[10px] uppercase px-3 py-1 rounded-full border border-teal-500/30">
                Wholesale Hub
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-1 rounded">
                Welcome, {currentUser.name}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Building2 className="h-8 w-8 text-teal-400" /> Wholesale & Bulk Orders
            </h1>
            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              Order in bulk to get large discounts. Request custom prices, manage your team's budget, pay with Net-30 business credit, and set up recurring deliveries.
            </p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 w-full md:w-auto font-mono text-xs flex flex-col gap-1.5 min-w-[260px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Tax Status:</span>
              <span className={taxExemptStatus === 'VERIFIED' ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
                {taxExemptStatus === 'VERIFIED' ? '✓ Tax Exempt' : '8.8% State Tax'}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-700/50 pt-1.5 mt-1">
              <span className="text-slate-400">Business Credit Limit:</span>
              <span className="text-white font-bold">${creditLimit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-slate-400">Available Business Credit:</span>
              <span className="text-teal-400 font-bold">${(creditLimit - usedCredit).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 bg-slate-150 p-1.5 rounded-xl border border-slate-200 max-w-max">
        {[
          { id: 'pricing', label: '📊 Bulk Price Calculator', icon: Layers },
          { id: 'rfq', label: '📢 Custom Price Requests', icon: FileText },
          { id: 'finance', label: '💳 Business Credit & Pay Later', icon: CreditCard },
          { id: 'logistics', label: '🚚 Shipping & Delivery Calculator', icon: Truck },
          { id: 'compliance', label: '🛡️ Team Budget & Tax Settings', icon: CheckSquare },
          { id: 'api', label: '⚡ Developer API Feeds', icon: Terminal },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-md scale-102 border-b-2 border-teal-500'
                  : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. CORE INTERACTIVE TABS */}
      <div className="grid gap-8 grid-cols-1">

        {/* ==================== TAB: PRICING (82, 85, 86, 90) ==================== */}
        {activeTab === 'pricing' && (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Catalog Selector */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="h-5 w-5 text-indigo-500" />
                    Bulk Discounts & Prices
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Select any item below, then adjust the slider to see how your price drops as you buy more units.
                  </p>
                </div>

                {/* Bulk Items Grid */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {b2bBulkInventory.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedB2bProduct(item);
                        setB2bOrderQuantity(150); // reset slider to average
                      }}
                      className={`text-left rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer ${
                        selectedB2bProduct.id === item.id 
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                        {item.category}
                      </span>
                      <strong className="text-xs text-slate-800 block mt-1 font-black truncate">{item.name}</strong>
                      <p className="text-[10px] text-slate-500 mt-1.5 leading-snug truncate-2-lines">{item.description}</p>
                      <span className="text-xs font-mono font-bold block mt-3 text-indigo-700">Base Rate: ${item.basePrice}/unit</span>
                    </button>
                  ))}
                </div>

                {/* Main Recalculator Area */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-widest block">Adjust Quantity</span>
                      <h3 className="text-base font-bold text-slate-800 mt-0.5">{selectedB2bProduct.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-500">Units:</label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={b2bOrderQuantity}
                        onChange={(e) => setB2bOrderQuantity(Math.max(1, Number(e.target.value)))}
                        className="bg-white border border-slate-300 rounded px-3 py-1.5 font-mono text-xs font-bold w-24 text-center focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="space-y-1.5 pt-2">
                    <input
                      type="range"
                      min="1"
                      max="5000"
                      value={b2bOrderQuantity}
                      onChange={(e) => setB2bOrderQuantity(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between font-mono text-[9px] text-slate-400">
                      <span>1 Unit</span>
                      <span>100 Units</span>
                      <span>500 Units</span>
                      <span>2,000+ Units</span>
                    </div>
                  </div>

                  {/* TIERS DATA GRID */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase">
                          <th className="px-4 py-2.5">Tier Volume Band</th>
                          <th className="px-4 py-2.5">Unit Price</th>
                          <th className="px-4 py-2.5">Discount %</th>
                          <th className="px-4 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedB2bProduct.tiers.map((tier, index) => {
                          const isActive = b2bOrderQuantity >= tier.min && b2bOrderQuantity <= tier.max;
                          const saving = Math.round(((selectedB2bProduct.basePrice - tier.unitPrice) / selectedB2bProduct.basePrice) * 100);
                          return (
                            <tr 
                              key={index} 
                              className={`border-b border-slate-100 last:border-0 transition-colors ${
                                isActive ? 'bg-emerald-50/50 text-emerald-900 font-bold' : 'text-slate-600'
                              }`}
                            >
                              <td className="px-4 py-3">
                                {tier.min === 1 ? '1 - 99' : tier.max === 99999 ? `${tier.min}+` : `${tier.min} - ${tier.max}`} units
                              </td>
                              <td className="px-4 py-3">${tier.unitPrice}/ea</td>
                              <td className="px-4 py-3 text-emerald-600 font-extrabold">{saving}% Off</td>
                              <td className="px-4 py-3">
                                {isActive ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                                    ✓ Applied Rate
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Inactive</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Savings summary */}
                  <div className="bg-indigo-950 text-white rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-indigo-300 block">TOTAL CONTRACT SAVINGS DETECTED</span>
                      <strong className="text-xl font-black text-emerald-400">
                        ${((selectedB2bProduct.basePrice - activePriceTier.unitPrice) * b2bOrderQuantity).toLocaleString()} Saved!
                      </strong>
                    </div>
                    <div className="text-right sm:border-l sm:border-indigo-800 sm:pl-6">
                      <span className="text-[9px] font-mono text-indigo-300 block">TIER UNIT QUOTE</span>
                      <strong className="text-xl font-black text-white">
                        ${activePriceTier.unitPrice} <span className="text-xs font-normal text-slate-300">/ea</span>
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 85. AUTOMATED TAX EXEMPTION DOCUMENT PORTAL */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                        <FileCheck className="h-4.5 w-4.5 text-teal-600" />
                        Tax Exemption Settings
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Upload your tax exemption certificate to remove the standard 8.8% state sales tax from your orders.
                      </p>
                    </div>
                    {taxExemptStatus === 'VERIFIED' ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded border border-emerald-200 font-mono uppercase">
                        ✓ Tax Exempt (0% Tax)
                      </span>
                    ) : (
                      <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-3 py-1 rounded border border-rose-200 font-mono uppercase">
                        Standard Tax Applies (8.8%)
                      </span>
                    )}
                  </div>

                  {taxExemptStatus === 'NOT_SUBMITTED' && (
                    <div 
                      onClick={handleSimulatedTaxExemptUpload}
                      className="border-2 border-dashed border-slate-250 hover:border-teal-500 rounded-xl p-8 text-center bg-slate-50 hover:bg-teal-50/20 cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="bg-white rounded-full h-11 w-11 flex items-center justify-center border border-slate-200 shadow-sm mx-auto group-hover:scale-105 transition-transform">
                        📄
                      </div>
                      <p className="text-xs font-bold text-slate-700">Drag or click to upload tax exemption PDF</p>
                      <p className="text-[10px] text-slate-400">Supports standard State Revenue Certs, max 10MB.</p>
                    </div>
                  )}

                  {taxExemptStatus === 'PARSING' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />
                          Running OCR Document Scan & Cross-Authority Check...
                        </span>
                        <strong className="text-teal-600">{exemptUploadProgress}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-500 transition-all duration-300" 
                          style={{ width: `${exemptUploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">Extracting legal entity headers, issuing authority signatures, and serial numbers...</p>
                    </div>
                  )}

                  {taxExemptStatus === 'VERIFIED' && parsedExemptionCertificate && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-xs text-emerald-800"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] text-emerald-600 uppercase font-black tracking-wider block">SUCCESSFULLY PARSED EXEMPTION PROFILE</span>
                        <p className="font-extrabold text-slate-800">State Code: {parsedExemptionCertificate.stateId}</p>
                        <p className="text-[11px] text-slate-600">Legal Name: {parsedExemptionCertificate.legalEntity}</p>
                        <p className="text-[11px] text-slate-600">Form Reference: {parsedExemptionCertificate.exemptionCode}</p>
                      </div>
                      <div className="sm:text-right flex flex-col gap-1">
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-1 rounded">✓ PARSING PASSED</span>
                        <button
                          onClick={() => {
                            setTaxExemptStatus('NOT_SUBMITTED');
                            setParsedExemptionCertificate(null);
                          }}
                          className="text-[9.5px] text-slate-500 hover:text-rose-600 font-bold underline"
                        >
                          Revoke Exemption Certificate
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Pricing Ledger Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Checkout Summary</span>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Order Summary</h3>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Items Total:</span>
                    <span className="text-slate-800">${(selectedB2bProduct.basePrice * b2bOrderQuantity).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bulk Discount:</span>
                    <span className="text-emerald-600 font-bold">
                      -${((selectedB2bProduct.basePrice - activePriceTier.unitPrice) * b2bOrderQuantity).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Freight Shipping:</span>
                    <span className="text-slate-800">${palletMetrics.baseFreightCost}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
                    <span className="text-slate-500 flex items-center gap-1">
                      Estimated Tax:
                      {taxExemptStatus === 'VERIFIED' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.2 rounded font-mono">EXEMPT</span>
                      )}
                    </span>
                    <span className="text-slate-800">
                      {taxExemptStatus === 'VERIFIED' ? '$0' : `$${Math.round((activePriceTier.unitPrice * b2bOrderQuantity) * 0.088).toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2">
                    <span className="font-bold text-slate-800">Total Price:</span>
                    <span className="text-base font-black text-slate-900">${b2bOrderTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* 84. SELECT PAYMENT MECHANISM TOGGLE */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Choose How to Pay</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentOption('direct')}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        paymentOption === 'direct' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Split Card Payment</span>
                      <span className="text-[8px] text-slate-400 font-normal">Pay with Multiple Cards</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentOption('net30')}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        paymentOption === 'net30' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Net-30 Business Credit</span>
                      <span className="text-[8px] text-slate-400 font-normal">Pay within 30 days</span>
                    </button>
                  </div>
                </div>

                {/* 90. SPLIT PAYMENT GATEWAY SECTION */}
                {paymentOption === 'direct' && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                        Split Your Payment
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                        SPLITTING ACTIVE
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      {paymentSplits.map(card => (
                        <div key={card.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-sm">
                          <div>
                            <p className="font-bold text-slate-800 text-[11px] truncate w-32">{card.cardName}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{card.cardNumber}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400">$</span>
                            <input
                              type="number"
                              value={card.allocatedAmount}
                              onChange={(e) => handleUpdateSplitAmount(card.id, Number(e.target.value))}
                              className="w-20 bg-slate-50 border border-slate-350 rounded px-1.5 py-1 text-center font-bold font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (paymentSplits.length <= 1) return;
                                setPaymentSplits(prev => prev.filter(c => c.id !== card.id));
                              }}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Split Card form */}
                    <form onSubmit={handleAddSplitCard} className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                      <input
                        type="text"
                        placeholder="Card Name"
                        value={newSplitCardName}
                        onChange={(e) => setNewSplitCardName(e.target.value)}
                        className="bg-white border border-slate-350 rounded px-2 py-1 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded py-1 cursor-pointer transition-colors"
                      >
                        + Add Another Card
                      </button>
                    </form>

                    <div className="border-t border-slate-200/50 pt-2 text-[10px] space-y-1 font-mono">
                      <div className="flex justify-between text-slate-500">
                        <span>Splits Allocation:</span>
                        <span className={allocatedTotal === b2bOrderTotal ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                          ${allocatedTotal.toLocaleString()} / ${b2bOrderTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-[9px]">
                        <span>Remaining Remainder:</span>
                        <strong className="text-slate-800">
                          ${Math.max(0, b2bOrderTotal - allocatedTotal).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {paymentOption === 'net30' && (
                  <div className="bg-indigo-950 text-indigo-300 rounded-xl p-4 border border-indigo-900 space-y-2 font-mono text-[10px] leading-relaxed">
                    <span className="text-[9px] font-black text-indigo-200 uppercase tracking-wider block border-b border-indigo-900 pb-1.5 mb-1.5">
                      ✓ Net-30 Purchase Authorization Active
                    </span>
                    <p>
                      Your enterprise billing profile is pre-approved for Net-30 credit line invoicing.
                    </p>
                    <p>
                      Placing this order will generate an internal corporate PO and ledger invoice in our finance records, due on 30-day payment margins.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddBulkToCart}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wide shadow-lg border border-slate-700"
                >
                  <Building2 className="h-4.5 w-4.5 text-teal-400 animate-pulse" /> Confirm Enterprise Dispatch
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ==================== TAB: RFQ HUB (81, 88) ==================== */}
        {activeTab === 'rfq' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              {/* Dual Role switch */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    Custom Price Requests
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Post what you need and what quantity you want. Suppliers will send you their best custom offers.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setB2bRole('procurement_officer')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${
                      b2bRole === 'procurement_officer' 
                        ? 'bg-white text-indigo-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Buyer View
                  </button>
                  <button
                    onClick={() => setB2bRole('supplier')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${
                      b2bRole === 'supplier' 
                        ? 'bg-white text-indigo-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Seller View
                  </button>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-12">
                {/* Form column */}
                <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  
                  {b2bRole === 'procurement_officer' ? (
                    <form onSubmit={handleCreateRfq} className="space-y-4">
                      <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-widest block">Buyer Panel</span>
                      <h3 className="text-xs font-bold text-slate-800">Create a Custom Price Request</h3>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">What do you need?</label>
                        <input
                          type="text"
                          placeholder="e.g. Biodegradable Graphene Matrix"
                          value={newRfqTitle}
                          onChange={(e) => setNewRfqTitle(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Category</label>
                          <select
                            value={newRfqCategory}
                            onChange={(e) => setNewRfqCategory(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                          >
                            <option>Heavy Construction Materials</option>
                            <option>Advanced Nano-Textiles</option>
                            <option>Bio-Electronics</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Quantity</label>
                          <input
                            type="number"
                            value={newRfqQty}
                            onChange={(e) => setNewRfqQty(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-center"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Details & Requirements</label>
                        <textarea
                          placeholder="Specify dimensions, quality grades, certified standards, and any special delivery instructions..."
                          value={newRfqSpecs}
                          onChange={(e) => setNewRfqSpecs(e.target.value)}
                          rows={4}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Target Date</label>
                        <input
                          type="date"
                          value={newRfqDate}
                          onChange={(e) => setNewRfqDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Requirements & Certifications</label>
                        <div className="space-y-1.5 text-[11px] text-slate-600 font-mono">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newRfqCompliance.includes('ISO-9001')}
                              onChange={(e) => {
                                if (e.target.checked) setNewRfqCompliance(prev => [...prev, 'ISO-9001']);
                                else setNewRfqCompliance(prev => prev.filter(c => c !== 'ISO-9001'));
                              }}
                              className="accent-indigo-600"
                            />
                            <span>ISO-9001 Certified</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newRfqCompliance.includes('Fair-Labor-Compliance')}
                              onChange={(e) => {
                                if (e.target.checked) setNewRfqCompliance(prev => [...prev, 'Fair-Labor-Compliance']);
                                else setNewRfqCompliance(prev => prev.filter(c => c !== 'Fair-Labor-Compliance'));
                              }}
                              className="accent-indigo-600"
                            />
                            <span>Fair Labor Compliant</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newRfqCompliance.includes('ESG-Carbon-Neutral-Audit')}
                              onChange={(e) => {
                                if (e.target.checked) setNewRfqCompliance(prev => [...prev, 'ESG-Carbon-Neutral-Audit']);
                                else setNewRfqCompliance(prev => prev.filter(c => c !== 'ESG-Carbon-Neutral-Audit'));
                              }}
                              className="accent-indigo-600"
                            />
                            <span>Carbon Neutral certified</span>
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-colors"
                      >
                        Publish Price Request
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-widest block">Seller Panel</span>
                      <h3 className="text-xs font-bold text-slate-800">Send a Custom Price Offer</h3>
                      
                      {selectedRfqForBid ? (
                        <form onSubmit={handlePlaceBid} className="space-y-4">
                          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                            <span className="text-[8.5px] font-mono text-slate-400 block uppercase">Selected Price Request:</span>
                            <p className="font-bold text-xs text-slate-800 truncate">{selectedRfqForBid.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Quantity Requested: {selectedRfqForBid.quantity} units</p>
                          </div>

                          {complianceScore < 100 && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1.5 text-[10px] text-rose-700">
                              <p className="font-extrabold flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Required Certifications Missing
                              </p>
                              <p>
                                Your business has {complianceScore}% of the certifications required for this request.
                              </p>
                              <button
                                type="button"
                                onClick={() => setActiveTab('compliance')}
                                className="text-rose-900 font-bold underline"
                              >
                                Update Business Profile
                              </button>
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Price per Unit ($)</label>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-mono">$</span>
                              <input
                                type="number"
                                step="0.10"
                                value={supplierBidPrice}
                                onChange={(e) => setSupplierBidPrice(Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Delivery Time (Days)</label>
                            <input
                              type="number"
                              value={supplierBidDays}
                              onChange={(e) => setSupplierBidDays(Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                            />
                          </div>

                          <div className="bg-slate-900 text-teal-400 p-3 rounded-lg font-mono text-[10px] flex justify-between">
                            <span>TOTAL OFFER PRICE:</span>
                            <strong>${(supplierBidPrice * selectedRfqForBid.quantity).toLocaleString()}</strong>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedRfqForBid(null)}
                              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={complianceScore < 100}
                              className={`flex-1 text-white py-2 rounded-lg text-xs font-bold transition-colors ${
                                complianceScore < 100 ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                              }`}
                            >
                              Submit Offer
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="text-center py-10 space-y-2 text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl">
                          <span className="text-2xl block">📢</span>
                          <p className="text-[11px] font-bold">No Request Selected</p>
                          <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto">
                            Click on any open price request in the feed and click "Send Offer" to offer your price.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* RFQ Listings Column */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider font-mono">Open Price Requests</h3>
                  
                  {rfqs.map(rfq => (
                    <div 
                      key={rfq.id} 
                      className={`bg-white rounded-2xl border p-5 space-y-4 transition-all shadow-sm ${
                        rfq.status === 'ACCEPTED' ? 'border-emerald-300 ring-1 ring-emerald-300' : 'border-slate-250'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block uppercase">{rfq.category}</span>
                          <strong className="text-sm text-slate-800 block mt-0.5">{rfq.title}</strong>
                          <span className="text-[10.5px] text-slate-500 block font-mono mt-1">Requested by: {rfq.procurementManager}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {rfq.status === 'OPEN' && (
                            <span className="bg-blue-50 text-blue-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-blue-200 uppercase">
                              Open for Offers
                            </span>
                          )}
                          {rfq.status === 'BIDS_RECEIVED' && (
                            <span className="bg-amber-50 text-amber-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-amber-200 uppercase">
                              {rfq.bids.length} Offers Received
                            </span>
                          )}
                          {rfq.status === 'ACCEPTED' && (
                            <span className="bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase">
                              ✓ Deal Completed
                            </span>
                          )}
                          {b2bRole === 'supplier' && rfq.status !== 'ACCEPTED' && (
                            <button
                              type="button"
                              onClick={() => setSelectedRfqForBid(rfq)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition-colors"
                            >
                              Send Offer
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-4 font-mono text-[10px] text-slate-600">
                          <div>
                            <span className="text-slate-400 uppercase block">Quantity Required</span>
                            <strong className="text-slate-800 text-xs">{rfq.quantity.toLocaleString()} units</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase block">Delivery Target</span>
                            <strong className="text-slate-800 text-xs">{rfq.targetDate}</strong>
                          </div>
                        </div>
                        <div className="border-t border-slate-200/50 pt-2 text-[11px] text-slate-600">
                          <strong className="text-slate-500 block uppercase text-[9px] font-mono">Requirements:</strong>
                          <p className="mt-0.5 font-medium leading-relaxed">{rfq.specs}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {rfq.complianceRequirements.map(req => (
                            <span key={req} className="bg-slate-200 text-slate-700 text-[8.5px] font-bold px-2 py-0.5 rounded font-mono uppercase border border-slate-300">
                              🛡️ {req}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* RFQ Bids Grid */}
                      {rfq.bids.length > 0 && (
                        <div className="border-t border-slate-100 pt-4 space-y-2.5">
                          <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Supplier Offers</h4>
                          <div className="grid gap-2 text-xs font-mono">
                            {rfq.bids.map(bid => (
                              <div 
                                key={bid.id} 
                                className={`p-3 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${
                                  bid.isAccepted ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <strong className="text-slate-800 font-extrabold">{bid.supplierName}</strong>
                                    <span className="bg-slate-200 text-slate-700 text-[8px] font-bold px-1.5 rounded">
                                      {bid.complianceScore}% Compliant
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Delivery in {bid.deliveryDays} days | Logged: {new Date(bid.timestamp).toLocaleTimeString()}</p>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                  <div className="sm:text-right">
                                    <span className="text-[9px] text-slate-400 block uppercase">Offer Total</span>
                                    <strong className="text-slate-800 text-sm font-black">${bid.totalQuote.toLocaleString()}</strong>
                                    <span className="text-[10px] text-slate-400 block mt-0.2">${bid.unitPrice}/unit</span>
                                  </div>

                                  {b2bRole === 'procurement_officer' && rfq.status !== 'ACCEPTED' && (
                                    <button
                                      type="button"
                                      onClick={() => handleAcceptBid(rfq.id, bid.id)}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded cursor-pointer transition-colors"
                                    >
                                      ✓ Accept & Add to Cart
                                    </button>
                                  )}

                                  {bid.isAccepted && (
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded border border-emerald-200">
                                      ✓ Accepted Offer
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}

                </div>
              </div>

            </div>
          </div>
        )}


        {/* ==================== TAB: CORPORATE LEDGER NET-30 (83, 84) ==================== */}
        {activeTab === 'finance' && (
          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* Net-30 credit status and invoicing list */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-500" />
                    Business Credit (Net-30)
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Approved businesses can purchase products now and pay within 30 days.
                  </p>
                </div>

                {/* Progress bar of limit */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3.5">
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-slate-500 uppercase font-bold">Credit Line Limit & Utilization</span>
                    <strong className="text-slate-800">
                      ${usedCredit.toLocaleString()} Used of ${creditLimit.toLocaleString()} Total
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        (usedCredit / creditLimit) > 0.85 ? 'bg-rose-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${(usedCredit / creditLimit) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[9px] text-slate-400">
                    <span>Available Business Credit: ${(creditLimit - usedCredit).toLocaleString()}</span>
                    <span>Status: Excellent</span>
                  </div>
                </div>

                {/* Ledger invoice list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider font-mono">Your Credit Invoices</h3>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="bg-slate-150 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase">
                          <th className="px-4 py-2.5">Invoice ID</th>
                          <th className="px-4 py-2.5">Issued</th>
                          <th className="px-4 py-2.5">Due Date</th>
                          <th className="px-4 py-2.5">Balance</th>
                          <th className="px-4 py-2.5">Status / Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {net30Invoices.map((inv) => (
                          <tr key={inv.id} className="border-b border-slate-150 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-extrabold text-slate-800">{inv.id}</span>
                              <p className="text-[9px] text-slate-400 mt-0.5">{inv.poNumber}</p>
                            </td>
                            <td className="px-4 py-3">{inv.issueDate}</td>
                            <td className="px-4 py-3">
                              {inv.dueDate}
                              {inv.status === 'PENDING' && (
                                <p className="text-[9px] text-indigo-600 mt-0.5">{inv.daysRemaining} days remaining</p>
                              )}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-800">${inv.amount.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {inv.status === 'PENDING' && (
                                  <>
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-amber-200">
                                      Pending Payment
                                    </span>
                                    <button
                                      onClick={() => handleRepayInvoice(inv.id, inv.amount)}
                                      className="bg-slate-900 hover:bg-slate-800 text-white text-[9.5px] font-bold px-2.5 py-1 rounded cursor-pointer transition-colors"
                                    >
                                      Repay Invoice
                                    </button>
                                  </>
                                )}
                                {inv.status === 'PAID' && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-emerald-200">
                                    ✓ Settled Paid
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

            {/* Corporate approval control settings column */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 83. Multi-seat accounts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <Users className="h-4.5 w-4.5 text-indigo-500" />
                    Team Budget & Access
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Invite employees, assign team budgets, and set purchase approval limits.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  
                  {/* Approval threshold trigger */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-2 flex justify-between items-start">
                    <div className="space-y-0.5">
                      <strong className="text-slate-800 text-[11px] block font-bold">Require Manager Approval</strong>
                      <p className="text-[10px] text-slate-400">Require a manager's approval for orders over a specific dollar amount.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={approvalAlertThresholdEnabled}
                      onChange={(e) => setApprovalAlertThresholdEnabled(e.target.checked)}
                      className="accent-indigo-600 h-4.5 w-4.5 cursor-pointer rounded"
                    />
                  </div>

                  {/* Seat listings */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Team Members ({corporateSeats.length})</span>
                    
                    {corporateSeats.map(seat => (
                      <div key={seat.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-800 font-bold block">{seat.name}</strong>
                            <span className="text-[9.5px] text-slate-400 block font-mono">{seat.role}</span>
                          </div>
                          <span className="bg-teal-50 text-teal-800 text-[8px] font-black px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-teal-200">
                            Active Access
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-1 font-mono text-[10px]">
                          <div className="flex justify-between text-slate-500">
                            <span>Quarterly Budget Limit:</span>
                            <span className="text-slate-800 font-extrabold">${seat.quarterlyBudget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Approval Required for Orders Over:</span>
                            <span className="text-slate-800 font-extrabold">${seat.needsApprovalOver.toLocaleString()}</span>
                          </div>
                          
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                            <div 
                              className="h-full bg-indigo-500"
                              style={{ width: `${(seat.spent / seat.quarterlyBudget) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Seat Creation Form */}
                  <form onSubmit={handleAddCorporateSeat} className="border-t border-slate-100 pt-4 space-y-3">
                    <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-widest block">Add a New Team Member</span>
                    
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Employee Name"
                        value={seatNameInput}
                        onChange={(e) => setSeatNameInput(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Quarterly Budget ($)"
                        onChange={(e) => setSeatBudgetInput(Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Approval Limit ($)"
                        onChange={(e) => setSeatApprovalInput(Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded text-xs cursor-pointer transition-colors"
                    >
                      + Invite Team Member
                    </button>
                  </form>

                </div>
              </div>

            </div>
          </div>
        )}


        {/* ==================== TAB: PALLET FREIGHT LOGISTICS (86, 87) ==================== */}
        {activeTab === 'logistics' && (
          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* 3D Pallet visual spatial configurator */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Truck className="h-5 w-5 text-indigo-500" />
                    Shipping & Delivery Calculator
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    See how your bulk items fit onto standard shipping pallets and calculate freight delivery details.
                  </p>
                </div>

                {/* 3D representation mock */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 text-slate-100 flex flex-col items-center justify-center space-y-4">
                  <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-black">
                    Pallet Spatial Grid
                  </span>

                  {/* CSS visual stacking of cargo cubes based on pallets needed */}
                  <div className="grid grid-cols-5 gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl w-full max-w-lg min-h-[160px] items-center justify-center">
                    {Array.from({ length: palletMetrics.palletsNeeded }).map((_, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.6, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-teal-600/45 border-2 border-teal-400 text-teal-300 rounded-lg p-2 flex flex-col justify-between h-18 text-center font-mono text-[9px] relative group"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="bg-teal-400/25 py-0.5 rounded text-[8px] font-extrabold uppercase">PALLET #{idx + 1}</div>
                        <span>📦 STACKED</span>
                        <div className="absolute bottom-1 right-1 text-[8.5px] font-bold text-slate-200">MAX</div>
                      </motion.div>
                    ))}

                    {/* Filling remainder empty container slots */}
                    {Array.from({ length: Math.max(0, 10 - palletMetrics.palletsNeeded) }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className="border border-dashed border-slate-800 rounded-lg h-18 flex items-center justify-center text-slate-700 font-mono text-[8px]"
                      >
                        EMPTY
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 max-w-md text-center leading-normal">
                    Standard Pallet size: 48" x 40". Maximum weight: 2,000 lbs. One cargo container holds 20 pallets.
                  </p>
                </div>

                {/* Mathematical layout metrics output */}
                <div className="grid gap-4 sm:grid-cols-4 font-mono text-xs">
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center">
                    <span className="text-slate-400 uppercase text-[9px] block">Pallets Needed</span>
                    <strong className="text-slate-800 text-base font-black mt-1 block">
                      {palletMetrics.palletsNeeded} Standard
                    </strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center">
                    <span className="text-slate-400 uppercase text-[9px] block">Total Weight</span>
                    <strong className="text-slate-800 text-base font-black mt-1 block">
                      {palletMetrics.totalWeight.toLocaleString()} lbs
                    </strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center">
                    <span className="text-slate-400 uppercase text-[9px] block">Total Volume</span>
                    <strong className="text-slate-800 text-base font-black mt-1 block">
                      {palletMetrics.totalVolume.toLocaleString()} cu ft
                    </strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center">
                    <span className="text-slate-400 uppercase text-[9px] block">Container Space Used</span>
                    <strong className="text-indigo-600 text-base font-black mt-1 block">
                      {palletMetrics.containerUtilization}% Full
                    </strong>
                  </div>
                </div>

              </div>
            </div>

            {/* 87. Recurring PO schedule timeline */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                    Automated Orders
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Set up recurring shipments of materials automatically.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Current schedule listings */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Active Automated Orders</span>
                    
                    {scheduledPOs.map(po => (
                      <div key={po.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3 font-mono text-xs">
                        <div>
                          <strong className="text-slate-800 text-[11px] block font-extrabold truncate w-40">{po.productName}</strong>
                          <span className="text-[9.5px] text-slate-400 block mt-0.5">
                            Qty: {po.quantity} | {po.interval} Interval
                          </span>
                        </div>
                        <div className="text-right flex flex-col gap-1 items-end">
                          <span className="bg-indigo-100 text-indigo-800 text-[8px] font-black px-1.5 py-0.2 rounded">
                            AUTOMATED ORDER
                          </span>
                          <span className="text-[8.5px] text-slate-400 block">{po.nextShipDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Schedule New PO form */}
                  <form onSubmit={handleSchedulePo} className="border-t border-slate-100 pt-4 space-y-3 text-xs">
                    <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-widest block">Schedule a Recurring Order</span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Select Item</label>
                      <select
                        value={recPoProduct}
                        onChange={(e) => setRecPoProduct(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5"
                      >
                        {b2bBulkInventory.map(item => (
                          <option key={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Quantity</label>
                        <input
                          type="number"
                          value={recPoQty}
                          onChange={(e) => setRecPoQty(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded p-1 text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">How Often</label>
                        <select
                          value={recPoInterval}
                          onChange={(e) => setRecPoInterval(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded p-1"
                        >
                          <option>Monthly</option>
                          <option>Quarterly</option>
                          <option>Bi-Annually</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded text-xs cursor-pointer transition-colors"
                    >
                      📅 Create Automated Order
                    </button>
                  </form>
                </div>

              </div>

            </div>
          </div>
        )}


        {/* ==================== TAB: COMPLIANCE WORKFLOWS (88) ==================== */}
        {activeTab === 'compliance' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-indigo-500" />
                  Business Profile & Compliance
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Verify your company's credentials to unlock full selling capabilities on the marketplace.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Verification Status</span>
                    <strong className="text-xs text-slate-800">Verification Progress</strong>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black font-mono block ${
                      complianceScore === 100 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {complianceScore}% Certified
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono uppercase font-bold">
                      {complianceScore === 100 ? '✓ APPROVED TO BID' : '🚫 BIDDING LOCKED'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  
                  {/* ISO 9001 */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-800 font-bold">ISO-9001 Certification</strong>
                        {complianceMatrix.iso9001 && <span className="text-emerald-600 text-[10px]">✓ PASSED</span>}
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-normal">
                        Verify that your production and quality management processes meet international standards.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={complianceMatrix.iso9001}
                      onChange={(e) => setComplianceMatrix(prev => ({ ...prev, iso9001: e.target.checked }))}
                      className="accent-indigo-600 h-4.5 w-4.5 cursor-pointer rounded"
                    />
                  </div>

                  {/* Fair Labor */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-800 font-bold">Fair Labor Declaration</strong>
                        {complianceMatrix.fairLabor && <span className="text-emerald-600 text-[10px]">✓ PASSED</span>}
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-normal">
                        Declare that your company operates under fair labor practices and safe working conditions.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={complianceMatrix.fairLabor}
                      onChange={(e) => setComplianceMatrix(prev => ({ ...prev, fairLabor: e.target.checked }))}
                      className="accent-indigo-600 h-4.5 w-4.5 cursor-pointer rounded"
                    />
                  </div>

                  {/* General Liability */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-800 font-bold">Liability Insurance ($2M)</strong>
                        {complianceMatrix.generalLiability && <span className="text-emerald-600 text-[10px]">✓ PASSED</span>}
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-normal">
                        Provide proof of active general liability insurance up to $2,000,000.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={complianceMatrix.generalLiability}
                      onChange={(e) => setComplianceMatrix(prev => ({ ...prev, generalLiability: e.target.checked }))}
                      className="accent-indigo-600 h-4.5 w-4.5 cursor-pointer rounded"
                    />
                  </div>

                  {/* ESG */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-800 font-bold">Carbon Neutral Certification</strong>
                        {complianceMatrix.esgAudit && <span className="text-emerald-600 text-[10px]">✓ PASSED</span>}
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-normal">
                        Provide audit documentation proving carbon-neutral production offsets.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={complianceMatrix.esgAudit}
                      onChange={(e) => setComplianceMatrix(prev => ({ ...prev, esgAudit: e.target.checked }))}
                      className="accent-indigo-600 h-4.5 w-4.5 cursor-pointer rounded"
                    />
                  </div>

                </div>

                {complianceScore < 100 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[11px] text-amber-800 space-y-1.5">
                    <span className="font-extrabold flex items-center gap-1 uppercase text-[10px] tracking-wider font-mono">
                      🚫 Selling Capabilities Locked
                    </span>
                    <p>
                      You must meet all verification criteria listed above to activate bidding and selling capabilities.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}


        {/* ==================== TAB: PROCUREMENT API FEEDS (89) ==================== */}
        {activeTab === 'api' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-indigo-500" />
                  Developer API Feeds
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Connect our product data directly to your company's system using secure API feeds.
                </p>
              </div>

              {/* Developer dashboard layout */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 space-y-6 font-mono text-xs leading-relaxed">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-[9px] uppercase tracking-widest font-black text-indigo-400">
                    API Feed Console
                  </span>
                  <span className="text-[8.5px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Live Feed Active
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Secret Access Token:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={apiToken}
                        className="bg-slate-950 border border-slate-800 text-teal-400 rounded-lg p-2 text-xs font-mono w-full focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(apiToken);
                          alert('✓ API Access Token copied to clipboard!');
                        }}
                        className="bg-slate-800 hover:bg-slate-750 text-white font-bold px-3 py-2 rounded-lg text-xs font-mono cursor-pointer transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">API URL:</span>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 select-all text-indigo-300">
                      https://nexus-bazaar.api/v1/procurement/feeds/bulk-rates?token={apiToken}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-400 text-[10px]">Test the API Response:</span>
                    <button
                      onClick={handleTriggerApiFeed}
                      disabled={apiLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      {apiLoading ? '⚡ Connecting...' : '⚡ Try API Call'}
                    </button>
                  </div>

                  {apiConsoleResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-800 overflow-x-auto text-[10.5px] max-h-[300px]"
                    >
                      <pre>{apiConsoleResponse}</pre>
                    </motion.div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
