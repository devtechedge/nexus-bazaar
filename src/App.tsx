/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  loadDatabase, 
  saveDatabase, 
  getActiveUser, 
  setActiveUserInStorage,
  DatabaseState, 
  User, 
  UserRole, 
  Product, 
  Order, 
  Review, 
  QA,
  PromoCode
} from './lib/db';

import Header from './components/Header';
import StorefrontView from './views/StorefrontView';
import SearchView from './views/SearchView';
import ProductDetailsView from './views/ProductDetailsView';
import CartCheckoutView from './views/CartCheckoutView';
import SellerView from './views/SellerView';
import AdminView from './views/AdminView';
import OrdersView from './views/OrdersView';
import WishlistView from './views/WishlistView';
import GuildsView from './views/GuildsView';
import StylingRoomView from './views/StylingRoomView';
import CurationsView from './views/CurationsView';
import ConciergeChatbot from './components/ConciergeChatbot';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function App() {
  // 1. Core State loaded from simulated database
  const [dbState, setDbState] = React.useState<DatabaseState>(() => loadDatabase());
  const [currentUser, setCurrentUser] = React.useState<User>(() => getActiveUser(dbState.users));

  // 2. Shopping Cart and Wishlist client states
  const [cart, setCart] = React.useState<{ productId: string; quantity: number }[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('nexus_bazaar_cart');
    return stored ? JSON.parse(stored) : [];
  });

  const [wishlist, setWishlist] = React.useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('nexus_bazaar_wishlist');
    return stored ? JSON.parse(stored) : [];
  });

  // 3. Routing views
  const [activeView, setActiveView] = React.useState<'storefront' | 'search' | 'details' | 'cart' | 'seller' | 'admin' | 'orders' | 'wishlist' | 'guilds' | 'styling' | 'curations'>('storefront');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  // 4. Shared filters search inputs
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  // Sync client structures with localStorage
  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_cart', JSON.stringify(cart));
  }, [cart]);

  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Save full state on db changes
  const updateDbState = (updater: (prev: DatabaseState) => DatabaseState) => {
    setDbState((prev) => {
      const next = updater(prev);
      saveDatabase(next);
      return next;
    });
  };

  // Switch role handler
  const handleSwitchUser = (userId: string) => {
    const target = dbState.users.find((u) => u.id === userId);
    if (!target) return;
    
    setActiveUserInStorage(userId);
    setCurrentUser(target);
    setActiveView('storefront');
  };

  // Toggle Elite membership for self
  const handleToggleSelfElite = () => {
    if (currentUser.isBanned) return;
    
    const updatedElite = !currentUser.isElite;
    setCurrentUser(prev => ({ ...prev, isElite: updatedElite }));
    
    updateDbState((prev) => ({
      ...prev,
      users: prev.users.map((u) => u.id === currentUser.id ? { ...u, isElite: updatedElite } : u)
    }));
  };

  // Security gatekeeper check
  const isSuspended = currentUser.isBanned;

  // Shopping cart modifiers
  const handleAddToCart = (product: Product) => {
    if (isSuspended) return;
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        // Prevent exceeding stock capacity
        const newQty = Math.min(product.stock, existing.quantity + 1);
        return prev.map((item) => item.productId === product.id ? { ...item, quantity: newQty } : item);
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    if (isSuspended) return;
    if (qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const prod = dbState.products.find((p) => p.id === productId);
    if (!prod) return;

    // Cap qty at stock limits
    const finalQty = Math.min(prod.stock, qty);

    setCart((prev) =>
      prev.map((item) => item.productId === productId ? { ...item, quantity: finalQty } : item)
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleToggleWishlist = (product: Product) => {
    if (isSuspended) return;
    setWishlist((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      }
      return [...prev, product.id];
    });
  };

  const handleMoveToCart = (productId: string) => {
    if (isSuspended) return;
    const prod = dbState.products.find((p) => p.id === productId);
    if (!prod || prod.stock <= 0) return;

    handleAddToCart(prod);
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  // Review Submissions
  const handleAddReview = (productId: string, rating: number, title: string, text: string) => {
    if (isSuspended) return;
    
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId,
      userName: currentUser.name,
      rating,
      title,
      text,
      date: new Date().toISOString().split('T')[0],
    };

    updateDbState((prev) => {
      const nextReviews = [newReview, ...prev.reviews];
      // Recalculate average rating of products
      const matchingReviews = nextReviews.filter((r) => r.productId === productId);
      const avg = matchingReviews.reduce((sum, r) => sum + r.rating, 0) / matchingReviews.length;

      return {
        ...prev,
        reviews: nextReviews,
        products: prev.products.map((p) => 
          p.id === productId 
            ? { ...p, rating: avg, reviewsCount: matchingReviews.length } 
            : p
        )
      };
    });

    // Refresh selectedProduct state if active to update specs instantly
    setSelectedProduct((prev) => {
      if (!prev || prev.id !== productId) return prev;
      const matchingReviews = [newReview, ...dbState.reviews].filter((r) => r.productId === productId);
      const avg = matchingReviews.reduce((sum, r) => sum + r.rating, 0) / matchingReviews.length;
      return { ...prev, rating: avg, reviewsCount: matchingReviews.length };
    });
  };

  // Q&A forum submissions
  const handleAddQuestion = (productId: string, question: string) => {
    if (isSuspended) return;

    const newQa: QA = {
      id: `qa_${Date.now()}`,
      productId,
      question,
      askedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
    };

    updateDbState((prev) => ({
      ...prev,
      qas: [newQa, ...prev.qas],
    }));
  };

  const handleAddAnswer = (qaId: string, answer: string) => {
    if (isSuspended) return;

    updateDbState((prev) => ({
      ...prev,
      qas: prev.qas.map((qa) => 
        qa.id === qaId 
          ? { ...qa, answer, answeredBy: currentUser.name } 
          : qa
      ),
    }));
  };

  // Inventory Management
  const handleAddProduct = (prodData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviewsCount'>) => {
    if (isSuspended) return;

    const newProd: Product = {
      ...prodData,
      id: `prod_${Date.now()}`,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      rating: 5.0,
      reviewsCount: 0,
    };

    updateDbState((prev) => ({
      ...prev,
      products: [newProd, ...prev.products],
    }));
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    if (isSuspended) return;

    updateDbState((prev) => ({
      ...prev,
      products: prev.products.map((p) => p.id === id ? { ...p, ...updates } : p),
    }));
  };

  const handleDeleteProduct = (id: string) => {
    if (isSuspended) return;

    updateDbState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  // Checkout and orders placement
  const handlePlaceOrder = (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    if (isSuspended) return;

    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      status: 'Placed',
      date: new Date().toISOString().split('T')[0],
    };

    updateDbState((prev) => {
      // Deduct purchased quantities from inventory stocks
      const updatedProducts = prev.products.map((p) => {
        const orderItem = orderData.items.find((item) => item.productId === p.id);
        if (orderItem) {
          return { ...p, stock: Math.max(0, p.stock - orderItem.quantity) };
        }
        return p;
      });

      return {
        ...prev,
        orders: [newOrder, ...prev.orders],
        products: updatedProducts,
      };
    });

    // Clear Cart
    setCart([]);
  };

  // Admin users management
  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    if (isSuspended && currentUser.role !== UserRole.Admin) return;

    updateDbState((prev) => ({
      ...prev,
      users: prev.users.map((u) => u.id === userId ? { ...u, ...updates } : u),
    }));

    // If we updated our own account info
    if (userId === currentUser.id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const handleAddCategory = (categoryName: string) => {
    if (isSuspended) return;
    // Categories are added dynamically inside input fields/filters, but we can verify catalogs easily
  };

  const handleAddPromoCode = (promo: PromoCode) => {
    if (isSuspended) return;

    updateDbState((prev) => ({
      ...prev,
      promoCodes: [...prev.promoCodes, promo],
    }));
  };

  const handleRemovePromoCode = (code: string) => {
    if (isSuspended) return;

    updateDbState((prev) => ({
      ...prev,
      promoCodes: prev.promoCodes.filter((p) => p.code !== code),
    }));
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status'], tracking?: string) => {
    if (isSuspended) return;

    updateDbState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => o.id === orderId ? { ...o, status, trackingNo: tracking } : o),
    }));
  };

  // Dynamic state views router
  const renderActiveView = () => {
    if (isSuspended) {
      return (
        <div id="suspended-gate" className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center space-y-4 my-12 animate-pulse">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-black text-rose-900 tracking-tight">Access Control Suspension</h3>
          <p className="text-xs text-rose-600 leading-relaxed">
            Your security coordinates have been suspended by the platform administrator. Transactions, cart additions, review commits, and product creations are disabled.
          </p>
          <div className="pt-2">
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider mb-2">Simulate Access Override</span>
            <p className="text-xs text-slate-500">
              Use the role switcher in the upper header to select another active user account (e.g. <strong>Platform Admin</strong>) to reinstate access.
            </p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'storefront':
        return (
          <StorefrontView
            products={dbState.products}
            onViewDetails={(p) => { setSelectedProduct(p); setActiveView('details'); }}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            currentUser={currentUser}
            setSelectedCategory={(cat) => { setSelectedCategory(cat); setActiveView('search'); }}
            promoCodes={dbState.promoCodes}
            setActiveView={setActiveView}
            onToggleElite={handleToggleSelfElite}
          />
        );
      case 'search':
        return (
          <SearchView
            products={dbState.products}
            onViewDetails={(p) => { setSelectedProduct(p); setActiveView('details'); }}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            currentUser={currentUser}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case 'details':
        return selectedProduct ? (
          <ProductDetailsView
            product={selectedProduct}
            onBack={() => setActiveView('storefront')}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlist.includes(selectedProduct.id)}
            currentUser={currentUser}
            reviews={dbState.reviews}
            qas={dbState.qas}
            onAddReview={handleAddReview}
            onAddQuestion={handleAddQuestion}
            onAddAnswer={handleAddAnswer}
          />
        ) : (
          <div className="text-center text-slate-400 py-10">No product selected.</div>
        );
      case 'cart':
        return (
          <CartCheckoutView
            products={dbState.products}
            cart={cart}
            wishlist={wishlist}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveFromCart={handleRemoveFromCart}
            onMoveToCart={handleMoveToCart}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            currentUser={currentUser}
            promoCodes={dbState.promoCodes}
            onPlaceOrder={handlePlaceOrder}
            setActiveView={setActiveView}
          />
        );
      case 'seller':
        return (
          <SellerView
            products={dbState.products}
            orders={dbState.orders}
            currentUser={currentUser}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            promoCodes={dbState.promoCodes}
            onAddPromoCode={handleAddPromoCode}
            onRemovePromoCode={handleRemovePromoCode}
          />
        );
      case 'admin':
        return (
          <AdminView
            dbState={dbState}
            onUpdateUser={handleUpdateUser}
            onAddCategory={handleAddCategory}
            onAddPromoCode={handleAddPromoCode}
            onRemovePromoCode={handleRemovePromoCode}
          />
        );
      case 'orders':
        return (
          <OrdersView
            orders={dbState.orders}
            currentUser={currentUser}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        );
      case 'wishlist':
        return (
          <WishlistView
            products={dbState.products}
            wishlist={wishlist}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onMoveToCart={handleMoveToCart}
            onViewDetails={(p) => { setSelectedProduct(p); setActiveView('details'); }}
            setActiveView={setActiveView}
          />
        );
      case 'guilds':
        return (
          <GuildsView
            currentUser={currentUser}
            onAddPromoCode={handleAddPromoCode}
            setActiveView={setActiveView}
          />
        );
      case 'styling':
        return (
          <StylingRoomView
            currentUser={currentUser}
            onAddToCart={handleAddToCart}
            products={dbState.products}
            setActiveView={setActiveView}
          />
        );
      case 'curations':
        return (
          <CurationsView
            currentUser={currentUser}
            products={dbState.products}
            onAddToCart={handleAddToCart}
            setActiveView={setActiveView}
          />
        );
      default:
        return <div className="text-center py-10">View not found</div>;
    }
  };

  return (
    <div id="nexus-bazaar-root" className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      
      {/* 1. Header Navigation Component */}
      <Header
        currentUser={currentUser}
        usersList={dbState.users}
        onSwitchUser={handleSwitchUser}
        onToggleElite={handleToggleSelfElite}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. Main content stage */}
      <main id="nexus-bazaar-main" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveView()}
      </main>

      {/* 3. Global high-fidelity footer */}
      <footer id="nexus-bazaar-footer" className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          
          <div className="space-y-3">
            <h4 className="text-white font-black tracking-tight text-sm">NexusBazaar</h4>
            <p className="text-slate-500 leading-relaxed">
              An enterprise-grade decentralized sandbox e-commerce catalog showcasing ultimate responsiveness, and dynamic multi-role workflow testing layouts.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider">Logistics Timelines</h5>
            <p className="text-slate-500 leading-relaxed">
              Standard: 3-5 days delivery. Free for checkout rates exceeding $150. Elite: Upgraded next-day express delivery ($0 courier fees).
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider">Multi-Role Testing</h5>
            <p className="text-slate-500 leading-relaxed">
              Switch roles in the top-right header: log in as Buyer to checkout, Seller to manage listings, or Admin to handle security permissions.
            </p>
          </div>

          <div className="space-y-3 font-mono">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider">System Security Logs</h5>
            <p className="text-[10px] text-slate-500">
              Status: <span className="text-emerald-500 font-bold">ONLINE</span><br />
              Environment: <span className="text-teal-400">Preview Sandboxed Sandbox</span><br />
              DB Registry: <span className="text-teal-400">Indexed (SQL Simulation)</span>
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mt-8 border-t border-slate-800/60 text-center text-[10px] text-slate-600 font-mono">
          © 2026 NexusBazaar LLC. Built completely in TypeScript & Tailwind. No real-world currency transitions occur.
        </div>
      </footer>

      {/* GLOBAL CONCIERGE CHATBOT ASSISTANT (Feature #9) */}
      {currentUser.role === 'buyer' && <ConciergeChatbot />}

    </div>
  );
}
