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
  X
} from 'lucide-react';
import { Product, Order, User } from '../lib/db';

interface SellerViewProps {
  products: Product[];
  orders: Order[];
  currentUser: User;
  onAddProduct: (prod: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviewsCount'>) => void;
  onUpdateProduct: (id: string, prod: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

export default function SellerView({
  products,
  orders,
  currentUser,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: SellerViewProps) {
  // Modal/Form toggle states
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);

  // Form Field State
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [brand, setBrand] = React.useState('');
  const [category, setCategory] = React.useState('Electronics');
  const [price, setPrice] = React.useState(100);
  const [stock, setStock] = React.useState(10);
  const [image, setImage] = React.useState('');
  const [isElite, setIsElite] = React.useState(false);

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
                  <tr id={`seller-inventory-row-${prod.id}`} key={prod.id} className="hover:bg-slate-50/50 transition-colors">
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
  );
}
