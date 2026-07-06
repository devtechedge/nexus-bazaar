/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User roles in NexusBazaar
export enum UserRole {
  Buyer = 'Buyer',
  Seller = 'Seller',
  Admin = 'Admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isElite: boolean;
  avatar: string;
  isBanned: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  image: string;
  rating: number;
  reviewsCount: number;
  isElite: boolean; // Elite members can get free/special benefits or pricing
  sellerId: string;
  sellerName: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  text: string;
  date: string;
}

export interface QA {
  id: string;
  productId: string;
  question: string;
  askedBy: string;
  answer?: string;
  answeredBy?: string;
  date: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  promoCodeUsed?: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered';
  date: string;
  trackingNo?: string;
  // --- BATCH 3 NEW OPTIONAL FIELDS ---
  warehouseHoldDays?: number;
  fractionalInvoices?: Record<string, number>;
  predictiveLagDays?: number;
  splitDeliveryAddresses?: Record<string, string>;
  recurringInterval?: string;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  description: string;
  requiresElite: boolean;
  minSubtotal?: number;
}

export interface DatabaseState {
  users: User[];
  products: Product[];
  reviews: Review[];
  qas: QA[];
  orders: Order[];
  promoCodes: PromoCode[];
}

// Global active user key
const DB_STORAGE_KEY = 'nexus_bazaar_simulated_db';
const ACTIVE_USER_ID_KEY = 'nexus_bazaar_active_user_id';

// Default Users Setup
export const defaultUsers: User[] = [
  {
    id: 'usr_buyer',
    name: 'Eager Buyer',
    email: 'buyer@nexusbazaar.com',
    role: UserRole.Buyer,
    isElite: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    isBanned: false,
  },
  {
    id: 'usr_seller',
    name: 'Elite Tech Seller',
    email: 'seller@nexusbazaar.com',
    role: UserRole.Seller,
    isElite: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    isBanned: false,
  },
  {
    id: 'usr_admin',
    name: 'Platform Admin',
    email: 'admin@nexusbazaar.com',
    role: UserRole.Admin,
    isElite: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    isBanned: false,
  },
];

// Default Promo Codes
export const defaultPromoCodes: PromoCode[] = [
  {
    code: 'NEXUS10',
    discountPercent: 10,
    description: 'Save 10% on any order!',
    requiresElite: false,
  },
  {
    code: 'ELITEPRO',
    discountPercent: 20,
    description: 'Exclusive 20% discount for Elite members!',
    requiresElite: true,
  },
  {
    code: 'BIGSAVER',
    discountPercent: 15,
    description: 'Save 15% on orders over $200!',
    requiresElite: false,
    minSubtotal: 200,
  },
];

// Initial Products Data
export const initialProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Aether-9 ANC Wireless Headphones',
    description: 'Experience pure sonic bliss with hybrid active noise cancellation, custom dynamic 40mm drivers, and an industry-leading 45 hours of continuous battery life. Made with ultra-soft memory foam earcups and an elegant matte finish.',
    price: 299,
    category: 'Electronics',
    brand: 'AuraSound',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&h=450&q=80',
    rating: 4.8,
    reviewsCount: 3,
    isElite: true,
    sellerId: 'usr_seller',
    sellerName: 'Elite Tech Seller',
  },
  {
    id: 'prod_2',
    name: 'Chronos SmartWatch Edition 4',
    description: 'Designed for the modern pathfinder. Featuring a grade-5 aerospace titanium bezel, vibrant always-on AMOLED touchscreen, advanced blood oxygen saturation telemetry, offline map routing, and water resistance up to 100 meters.',
    price: 349,
    category: 'Wearables',
    brand: 'ChronoTech',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&h=450&q=80',
    rating: 4.6,
    reviewsCount: 2,
    isElite: true,
    sellerId: 'usr_seller',
    sellerName: 'Elite Tech Seller',
  },
  {
    id: 'prod_3',
    name: 'Horizon Ultrawide Desk Monitor',
    description: 'Unlock seamless productivity and epic cinematic gaming on this 34-inch curved ultra-wide QHD panel. Boasting a 144Hz refresh rate, 99% sRGB color spectrum accuracy, and dual integrated 5W stereo speakers.',
    price: 699,
    category: 'Workspace',
    brand: 'Lumina',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&h=450&q=80',
    rating: 4.9,
    reviewsCount: 1,
    isElite: false,
    sellerId: 'usr_seller',
    sellerName: 'Elite Tech Seller',
  },
  {
    id: 'prod_4',
    name: 'KeyCraft Pro Mechanical Keyboard',
    description: 'A masterpiece of tactile sensation. Handcrafted solid American walnut wood casing, premium hot-swappable tactile brown switches, dual-mode 2.4Ghz/Bluetooth low latency connectivity, and warm white atmospheric underglow.',
    price: 189,
    category: 'Workspace',
    brand: 'KeyCraft',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&h=450&q=80',
    rating: 4.7,
    reviewsCount: 2,
    isElite: true,
    sellerId: 'usr_seller',
    sellerName: 'Elite Tech Seller',
  },
  {
    id: 'prod_5',
    name: 'Zenith Full-Grain Leather Pack',
    description: 'Masterfully stitched from robust vegetable-tanned steerhide leather. Designed with a padded compartment fitting up to 16" laptops, hidden passport pocket, and expandable sides. Develops a gorgeous vintage patina over time.',
    price: 149,
    category: 'Accessories',
    brand: 'Saddleback',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&h=450&q=80',
    rating: 4.5,
    reviewsCount: 2,
    isElite: false,
    sellerId: 'usr_seller',
    sellerName: 'Elite Tech Seller',
  },
  {
    id: 'prod_6',
    name: 'Apex Ergonomic Mesh Task Chair',
    description: 'Engineered for extended periods of focused flow. Patented lumbar-support system, fully adjustable 3D armrests, dynamic recline tension control, and responsive, hyper-breathable elastomeric mesh.',
    price: 450,
    category: 'Workspace',
    brand: 'ErgoMax',
    stock: 4,
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&h=450&q=80',
    rating: 4.4,
    reviewsCount: 1,
    isElite: false,
    sellerId: 'usr_seller',
    sellerName: 'Elite Tech Seller',
  },
  {
    id: 'prod_7',
    name: 'Nebula Hydrophobic Desk Pad',
    description: 'The definitive foundation for your creative workspace. Coated with advanced hydrophobic microfiber, non-slip textured rubber base, and stitched wear-proof borders. Spills bead up instantly for effortless cleanup.',
    price: 39,
    category: 'Workspace',
    brand: 'Nebula',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&h=450&q=80',
    rating: 4.9,
    reviewsCount: 2,
    isElite: true,
    sellerId: 'usr_seller',
    sellerName: 'Elite Tech Seller',
  },
  {
    id: 'prod_8',
    name: 'Lumina Screenbar Monitor Light',
    description: 'Say goodbye to screen glare and eye strain. Features an asymmetrical optical design that purely illuminates your desktop without reflecting off the glass. Continuous stepless brightness and warm-to-cool temperature adjustments.',
    price: 79,
    category: 'Electronics',
    brand: 'Lumina',
    stock: 22,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=450&q=80',
    rating: 4.7,
    reviewsCount: 1,
    isElite: true,
    sellerId: 'usr_seller',
    sellerName: 'Elite Tech Seller',
  }
];

// Initial Reviews Data
export const initialReviews: Review[] = [
  {
    id: 'rev_1',
    productId: 'prod_1',
    userName: 'Jane Doe',
    rating: 5,
    title: 'Absolute game changer!',
    text: 'The unboxing experience is phenomenal [0:10] and is a complete game changer! I use these for 8 hours a day in a busy open-plan office. The noise cancellation is magical. Soundstage is wide and punchy.',
    date: '2026-06-12',
  },
  {
    id: 'rev_2',
    productId: 'prod_1',
    userName: 'Alex Carter',
    rating: 4,
    title: 'Superb sound, minor headband tightness',
    text: 'Audio profile is gorgeous. The volume attenuator dial [0:35] turns with incredible tactile resistance. Bass is deep without muddying mids. It gets slightly tight around my ears after about 3 hours, but otherwise flawless.',
    date: '2026-06-25',
  },
  {
    id: 'rev_3',
    productId: 'prod_1',
    userName: 'Sam Miller',
    rating: 5,
    title: 'Unbelievable Battery Life',
    text: 'Truly hits the 45 hours claimed. In our acoustic chamber isolation sweep [1:15], noise absorption was absolutely state-of-the-art! High quality build, nice premium hard case included.',
    date: '2026-07-01',
  },
  {
    id: 'rev_4',
    productId: 'prod_2',
    userName: 'Renee Smith',
    rating: 5,
    title: 'Best adventurer smartwatch on the market',
    text: 'The titanium body has taken a beating on hikes and looks brand new. AMOLED screen is super bright in direct midday sun. GPS track is pinpoint accurate.',
    date: '2026-05-18',
  },
  {
    id: 'rev_5',
    productId: 'prod_2',
    userName: 'Tom Davis',
    rating: 4,
    title: 'Brilliant features, bulky on small wrists',
    text: 'Incredible biometric data, integration is flawless. Only downside is the size - it is quite a thick casing, but necessary for the 100m waterproofing.',
    date: '2026-06-02',
  },
  {
    id: 'rev_6',
    productId: 'prod_3',
    userName: 'TechSavvy',
    rating: 5,
    title: 'Pure Workspace Luxury',
    text: 'Replacing my dual monitor setup with this curved ultrawide was the best decision. Having spreadsheets, chat, and browser open side-by-side without bezels is pure heaven.',
    date: '2026-06-19',
  },
  {
    id: 'rev_7',
    productId: 'prod_4',
    userName: 'KeyClack Enthusiast',
    rating: 5,
    title: 'Visual and tactile masterpiece',
    text: 'The solid walnut wood frame is gorgeous on my desk. Brown switches have just the right amount of bump. Underglow creates an incredibly cozy workspace ambiance.',
    date: '2026-06-30',
  },
  {
    id: 'rev_8',
    productId: 'prod_4',
    userName: 'Vicky Chen',
    rating: 4,
    title: 'Lovely sound, heavy keyboard',
    text: 'Looks stunning and has a delightful typing clack. Keep in mind it is quite heavy due to the solid wood, which makes it slip-proof but not ideal for traveling.',
    date: '2026-07-02',
  },
  {
    id: 'rev_9',
    productId: 'prod_5',
    userName: 'Marcus Aurelius',
    rating: 4,
    title: 'Premium leather smell, high capacity',
    text: 'The craftsmanship is phenomenal. It is heavy, thick leather that smells amazing. Fits my MacBook Pro 16 with ease. Deducted one star because the metal buckles are initially stiff.',
    date: '2026-06-10',
  },
  {
    id: 'rev_10',
    productId: 'prod_5',
    userName: 'Elena Petrova',
    rating: 5,
    title: 'Stunning craftsmanship',
    text: 'Perfect for business travels or casual outings. It looks incredibly expensive and elite. Already developing a beautiful dark shine on the handle.',
    date: '2026-06-22',
  },
  {
    id: 'rev_11',
    productId: 'prod_6',
    userName: 'PostureChecker',
    rating: 4,
    title: 'Saves my spine during long coding sprints',
    text: 'Excellent adjustable lower lumbar tension. The mesh material keeps you cool. Took some time to find the perfect tension settings but worth the effort.',
    date: '2026-05-24',
  },
  {
    id: 'rev_12',
    productId: 'prod_7',
    userName: 'MinimalistGeek',
    rating: 5,
    title: 'Spills literally slide off!',
    text: 'Spilled my morning espresso on it. Beaded up perfectly. I just dabbed a dry paper towel and there is absolutely zero stain! Mouse tracking is silky smooth too.',
    date: '2026-06-29',
  },
  {
    id: 'rev_13',
    productId: 'prod_7',
    userName: 'Oliver Twist',
    rating: 5,
    title: 'Great quality desk accessory',
    text: 'Thick pad, stable rubber underside, sleek stitching. Instantly elevated my desks aesthetic.',
    date: '2026-07-03',
  },
  {
    id: 'rev_14',
    productId: 'prod_8',
    userName: 'CoderByNight',
    rating: 5,
    title: 'Saved my eyes from severe fatigue',
    text: 'I work late hours. This light focuses entirely downwards on my keyboard/papers. No monitor reflections. Highly recommend.',
    date: '2026-06-21',
  }
];

// Initial Q&As Data
export const initialQAs: QA[] = [
  {
    id: 'qa_1',
    productId: 'prod_1',
    question: 'Can you use these wired when the battery dies?',
    askedBy: 'FrugalTech',
    answer: 'Yes, absolutely! The package includes a braided 3.5mm AUX audio cable so you can continue listening passively in wired mode even when the battery is completely flat.',
    answeredBy: 'Elite Tech Seller',
    date: '2026-06-14',
  },
  {
    id: 'qa_2',
    productId: 'prod_1',
    question: 'How fast does it charge?',
    askedBy: 'ChargeLover',
    answer: 'It features USB-C fast charging. Just 10 minutes of charging gives you up to 5 hours of audio playback!',
    answeredBy: 'Elite Tech Seller',
    date: '2026-06-28',
  },
  {
    id: 'qa_3',
    productId: 'prod_2',
    question: 'Does the GPS feature require an active cellular subscription?',
    askedBy: 'HikerDave',
    answer: 'No cellular plan is required! It features a dedicated multi-band GPS chip that communicates directly with global satellites. You can download vector maps offline before setting out.',
    answeredBy: 'Elite Tech Seller',
    date: '2026-05-20',
  },
  {
    id: 'qa_4',
    productId: 'prod_3',
    question: 'What is the power delivery rating of the USB-C port?',
    askedBy: 'LaptopUser',
    answer: 'The onboard USB-C port provides up to 65W Power Delivery (PD) to charge compatible laptops, smartphones, and devices directly via the monitor cord.',
    answeredBy: 'Elite Tech Seller',
    date: '2026-06-20',
  },
  {
    id: 'qa_5',
    productId: 'prod_4',
    question: 'Is this compatible with macOS/iPadOS function keys?',
    askedBy: 'MacFanatic',
    answer: 'Yes, there is a dedicated hardware toggle switch on the back to toggle between Windows/Android layout and macOS/iOS mode. System function keys map perfectly.',
    answeredBy: 'Elite Tech Seller',
    date: '2026-07-02',
  },
  {
    id: 'qa_6',
    productId: 'prod_5',
    question: 'Is the bag rainproof or water resistant?',
    askedBy: 'CommuterSafe',
    answer: 'The natural oil infusion gives the full-grain leather incredible natural water resistance. It will easily shield contents in a moderate rain shower, though we recommend occasionally treating it with natural beeswaxes.',
    answeredBy: 'Elite Tech Seller',
    date: '2026-06-15',
  }
];

// Initial Orders Data (Seeded Orders)
export const initialOrders: Order[] = [
  {
    id: 'ord_1001',
    userId: 'usr_buyer',
    userName: 'Eager Buyer',
    items: [
      {
        productId: 'prod_1',
        name: 'Aether-9 ANC Wireless Headphones',
        price: 299,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&h=450&q=80',
      },
      {
        productId: 'prod_7',
        name: 'Nebula Hydrophobic Desk Pad',
        price: 39,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&h=450&q=80',
      }
    ],
    subtotal: 377,
    discount: 37.7,
    tax: 27.14,
    shipping: 15,
    total: 381.44,
    promoCodeUsed: 'NEXUS10',
    shippingAddress: {
      fullName: 'Eager Buyer',
      street: '427 Quantum Boulevard, Suite 9',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
    },
    status: 'Delivered',
    date: '2026-06-28',
    trackingNo: 'TRK-98317492-NX',
  },
  {
    id: 'ord_1002',
    userId: 'usr_buyer',
    userName: 'Eager Buyer',
    items: [
      {
        productId: 'prod_4',
        name: 'KeyCraft Pro Mechanical Keyboard',
        price: 189,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&h=450&q=80',
      }
    ],
    subtotal: 189,
    discount: 0,
    tax: 15.12,
    shipping: 0,
    total: 204.12,
    shippingAddress: {
      fullName: 'Eager Buyer',
      street: '427 Quantum Boulevard, Suite 9',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
    },
    status: 'Shipped',
    date: '2026-07-03',
    trackingNo: 'TRK-10293754-NX',
  }
];

// Load full state from localStorage, or seed it if missing
export function loadDatabase(): DatabaseState {
  if (typeof window === 'undefined') {
    return {
      users: defaultUsers,
      products: initialProducts,
      reviews: initialReviews,
      qas: initialQAs,
      orders: initialOrders,
      promoCodes: defaultPromoCodes,
    };
  }

  const stored = localStorage.getItem(DB_STORAGE_KEY);
  if (!stored) {
    const initialState: DatabaseState = {
      users: defaultUsers,
      products: initialProducts,
      reviews: initialReviews,
      qas: initialQAs,
      orders: initialOrders,
      promoCodes: defaultPromoCodes,
    };
    saveDatabase(initialState);
    return initialState;
  }

  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing localStorage database, resetting to default.', e);
    const initialState: DatabaseState = {
      users: defaultUsers,
      products: initialProducts,
      reviews: initialReviews,
      qas: initialQAs,
      orders: initialOrders,
      promoCodes: defaultPromoCodes,
    };
    saveDatabase(initialState);
    return initialState;
  }
}

// Save database state back to localStorage
export function saveDatabase(state: DatabaseState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(state));
}

// Reset Database completely
export function resetDatabaseToDefault(): DatabaseState {
  const initialState: DatabaseState = {
    users: defaultUsers,
    products: initialProducts,
    reviews: initialReviews,
    qas: initialQAs,
    orders: initialOrders,
    promoCodes: defaultPromoCodes,
  };
  saveDatabase(initialState);
  return initialState;
}

// Get Active Logged-In User
export function getActiveUser(usersList: User[]): User {
  if (typeof window === 'undefined') return defaultUsers[0];
  const activeId = localStorage.getItem(ACTIVE_USER_ID_KEY);
  if (!activeId) {
    localStorage.setItem(ACTIVE_USER_ID_KEY, defaultUsers[0].id);
    return defaultUsers[0];
  }
  const user = usersList.find((u) => u.id === activeId);
  if (!user || user.isBanned) {
    // Revert to first unbanned user
    const fallback = usersList.find((u) => !u.isBanned) || defaultUsers[0];
    localStorage.setItem(ACTIVE_USER_ID_KEY, fallback.id);
    return fallback;
  }
  return user;
}

// Set Active Logged-In User ID
export function setActiveUserInStorage(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
}
