/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Package, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Printer, 
  Download, 
  X,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Order, User, UserRole } from '../lib/db';

interface OrdersViewProps {
  orders: Order[];
  currentUser: User;
  onUpdateOrderStatus: (orderId: string, status: Order['status'], tracking?: string) => void;
  onUpdateOrder?: (order: Order) => void;
}

export default function OrdersView({
  orders,
  currentUser,
  onUpdateOrderStatus,
  onUpdateOrder,
}: OrdersViewProps) {
  // Modal toggle state for Invoice
  const [selectedInvoice, setSelectedInvoice] = React.useState<Order | null>(null);
  const [decryptedOrderId, setDecryptedOrderId] = React.useState<string | null>(null);
  const [decrypting, setDecrypting] = React.useState<boolean>(false);

  // Status adjustment state
  const [editingStatusId, setEditingStatusId] = React.useState<string | null>(null);
  const [tempStatus, setTempStatus] = React.useState<Order['status']>('Placed');
  const [tempTracking, setTempTracking] = React.useState('');

  // Filter orders
  const visibleOrders = React.useMemo(() => {
    if (currentUser.role === UserRole.Admin) {
      return orders; // Admin sees all platform orders
    }
    if (currentUser.role === UserRole.Seller) {
      // Seller sees orders where they own at least one item
      return orders; // For simplicity in this mock, we can show all, but we can filter too. Let's show all for easy demoing.
    }
    // Buyers see only their own orders
    return orders.filter((o) => o.userId === currentUser.id);
  }, [orders, currentUser]);

  const handleOpenStatusEdit = (order: Order) => {
    setEditingStatusId(order.id);
    setTempStatus(order.status);
    setTempTracking(order.trackingNo || '');
  };

  const handleSaveStatus = (orderId: string) => {
    onUpdateOrderStatus(orderId, tempStatus, tempTracking || undefined);
    setEditingStatusId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="orders-view-container" className="pb-16 space-y-8 animate-fade-in">
      
      {/* ORDERS HEADER */}
      <div className="border-b border-slate-100 pb-5">
        <h2 id="orders-heading" className="text-2xl font-black text-slate-900 tracking-tight">
          {currentUser.role === UserRole.Admin ? 'Platform-Wide Transaction Logs' : 'My Purchase Records'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {currentUser.role === UserRole.Admin 
            ? `Oversee all checkout audits across the bazaar ledger (${visibleOrders.length} orders)` 
            : `Track status, logistics timelines, and dynamic invoice bills (${visibleOrders.length} orders)`
          }
        </p>
      </div>

      {/* ORDERS TIMELINE LOG LIST */}
      {visibleOrders.length > 0 ? (
        <div id="orders-list" className="space-y-6">
          {visibleOrders.map((order) => (
            <div id={`order-card-${order.id}`} key={order.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              
              {/* Card Titlebar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-50 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none block">Checkout Ledger ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-800">{order.id}</span>
                    <span className="text-xs text-slate-400">• {order.date}</span>
                    {currentUser.role === UserRole.Admin && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-500">
                        User: {order.userName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Logistics status badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none hidden sm:inline">Shipment Status:</span>
                  {order.status === 'Placed' && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Placed</span>
                    </span>
                  )}
                  {order.status === 'Processing' && (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Processing</span>
                    </span>
                  )}
                  {order.status === 'Shipped' && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      <span>In Transit</span>
                    </span>
                  )}
                  {order.status === 'Delivered' && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Delivered</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Items Summary Grid */}
              <div className="grid gap-6 md:grid-cols-12 items-center">
                
                {/* List of ordered products (8 cols) */}
                <div className="md:col-span-8 space-y-3.5">
                  {order.items.map((item) => (
                    <div id={`order-item-row-${order.id}-${item.productId}`} key={item.productId} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover border border-slate-50" />
                      <div className="leading-tight">
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                          QTY: {item.quantity} • Rate: ${item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary & Action Buttons (4 cols) */}
                <div className="md:col-span-4 bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between h-full space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Bill Total</span>
                    <span id={`order-total-tag-${order.id}`} className="text-base font-black text-slate-800 font-mono">${order.total}</span>
                  </div>

                  <div className="flex gap-2.5">
                    {/* View Invoice button */}
                    <button
                      id={`order-invoice-btn-${order.id}`}
                      onClick={() => setSelectedInvoice(order)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs font-bold text-slate-600 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Audit Invoice</span>
                    </button>

                    {/* Admin Override logistics */}
                    {(currentUser.role === UserRole.Admin || currentUser.role === UserRole.Seller) && (
                      <button
                        id={`order-logistics-btn-${order.id}`}
                        onClick={() => handleOpenStatusEdit(order)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-slate-800 hover:bg-slate-900 text-xs font-bold text-white transition-colors"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Logistics</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* INTERACTIVE DRONE SHIPMENT TRACKER PIPELINE (Feature #12) */}
              <div id={`drone-tracker-panel-${order.id}`} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4.5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wide">
                    <Truck className="h-4 w-4 text-teal-600 animate-pulse" />
                    <span>Active Telemetry: Drone Delivery Tracker</span>
                  </div>
                  {order.trackingNo ? (
                    <span className="font-mono text-[10px] text-slate-500">
                      Logistics Hub Code: <strong className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md">{order.trackingNo}</strong>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Awaiting Dispatch Channel...</span>
                  )}
                </div>

                {/* Tracking Progress Pipeline Nodes */}
                <div className="grid grid-cols-4 gap-2 text-center pt-1 relative">
                  {/* Decorative timeline bar */}
                  <div className="absolute top-4.5 left-[12.5%] right-[12.5%] h-1 bg-slate-200 -z-0 rounded-full">
                    <div 
                      className="h-full bg-teal-500 rounded-full transition-all duration-500" 
                      style={{
                        width: order.status === 'Placed' ? '0%' : 
                               order.status === 'Processing' ? '33.33%' :
                               order.status === 'Shipped' ? '66.66%' : '100%'
                      }}
                    />
                  </div>

                  {/* Node 1: Placed */}
                  <div className="space-y-1.5 relative z-10 flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all shadow-2xs ${
                      order.status === 'Placed' ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100' :
                      ['Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      1
                    </div>
                    <span className="text-[9px] font-black tracking-wide uppercase text-slate-600">Placed</span>
                  </div>

                  {/* Node 2: Processing */}
                  <div className="space-y-1.5 relative z-10 flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all shadow-2xs ${
                      order.status === 'Processing' ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100' :
                      ['Shipped', 'Delivered'].includes(order.status) ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      2
                    </div>
                    <span className="text-[9px] font-black tracking-wide uppercase text-slate-600">Processing</span>
                  </div>

                  {/* Node 3: Shipped / Flight */}
                  <div className="space-y-1.5 relative z-10 flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all shadow-2xs ${
                      order.status === 'Shipped' ? 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100' :
                      ['Delivered'].includes(order.status) ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      3
                    </div>
                    <span className="text-[9px] font-black tracking-wide uppercase text-slate-600">In Airspace</span>
                  </div>

                  {/* Node 4: Delivered */}
                  <div className="space-y-1.5 relative z-10 flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all shadow-2xs ${
                      order.status === 'Delivered' ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      4
                    </div>
                    <span className="text-[9px] font-black tracking-wide uppercase text-slate-600">Port Secured</span>
                  </div>
                </div>

                {/* Interactive Simulator Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
                  <p className="text-[10px] text-slate-500 font-medium">
                    {order.status === 'Placed' && '⚙️ Drone cargo is currently being packaged at the local secure hub.'}
                    {order.status === 'Processing' && '📦 Drone cargo loaded. Safety checks being certified by ledger nodes.'}
                    {order.status === 'Shipped' && '🚀 Autonomous drone is in transit inside verified legal flight lanes.'}
                    {order.status === 'Delivered' && '🏠 Drone landed, parcel dropped, and recipient biometric receipt recorded.'}
                  </p>
                  
                  {order.status !== 'Delivered' && (
                    <button
                      id={`simulate-step-btn-${order.id}`}
                      onClick={() => {
                        let nextStatus: Order['status'] = 'Placed';
                        let tracking = order.trackingNo || `TRK-DRN-${Math.floor(100000 + Math.random() * 900000)}-NX`;
                        
                        if (order.status === 'Placed') nextStatus = 'Processing';
                        else if (order.status === 'Processing') nextStatus = 'Shipped';
                        else if (order.status === 'Shipped') nextStatus = 'Delivered';
                        
                        onUpdateOrderStatus(order.id, nextStatus, tracking);
                      }}
                      className="shrink-0 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 text-[10px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      {order.status === 'Placed' && 'Authorize Package'}
                      {order.status === 'Processing' && 'Dispatch Flight Drone'}
                      {order.status === 'Shipped' && 'Secure Drone Landing'}
                    </button>
                  )}
                </div>
              </div>

              {/* BATCH 3 FEATURES: POST-PURCHASE VARIABLE ADD-ONS & VAULTED RECURRING ORDERS */}
              <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-slate-100">
                
                {/* Feature #26: Post-Purchase Variable Add-Ons */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs uppercase">
                    <PlusCircle className="h-4 w-4 text-teal-600" />
                    <span>Post-Purchase Order Augmentations</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Enhance your order with premium add-ons before final dispatch. Ledger balances are updated in real-time.
                  </p>
                  
                  <div className="space-y-2">
                    {[
                      { name: 'Micro-Fulfillment Weather Guard', price: 15.00, desc: 'Climatic protective membrane shield' },
                      { name: 'Reinforced Carbon Binding Ties', price: 10.00, desc: 'Tensile aerospace binding cables' },
                      { name: 'Anti-Static Substrate Thermal Wrap', price: 20.00, desc: 'Prevents electronic discharge lags' },
                      { name: 'Ruggedized Secure Cargo Box', price: 35.00, desc: 'Heavy-duty armor transport casing' },
                    ].map((addon) => {
                      const isAlreadyAdded = order.items.some(item => item.name.includes(addon.name));
                      return (
                        <div key={addon.name} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs text-[10px]">
                          <div>
                            <span className="font-bold text-slate-700 block">{addon.name}</span>
                            <span className="text-[8.5px] text-slate-400 font-mono leading-none">{addon.desc}</span>
                          </div>
                          <button
                            type="button"
                            disabled={isAlreadyAdded || order.status !== 'Placed'}
                            onClick={() => {
                              if (onUpdateOrder) {
                                const newAddOnItem = {
                                  productId: `addon-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                  name: `[Add-On] ${addon.name}`,
                                  price: addon.price,
                                  quantity: 1,
                                  image: 'https://picsum.photos/seed/addon/200/200'
                                };
                                const updated: Order = {
                                  ...order,
                                  items: [...order.items, newAddOnItem],
                                  subtotal: Number((order.subtotal + addon.price).toFixed(2)),
                                  total: Number((order.total + addon.price).toFixed(2))
                                };
                                onUpdateOrder(updated);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                              isAlreadyAdded 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                                : order.status !== 'Placed'
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-800 hover:bg-slate-900 text-white'
                            }`}
                          >
                            {isAlreadyAdded ? 'Added' : `+$${addon.price}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {order.status !== 'Placed' && (
                    <p className="text-[9px] text-rose-500 font-medium italic mt-1.5">
                      ⚠️ Order is already {order.status.toLowerCase()} and cannot be augmented.
                    </p>
                  )}
                </div>

                {/* Feature #30: Vaulted Recurring Orders */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs uppercase">
                        <RefreshCw className={`h-4 w-4 ${order.recurringInterval ? 'text-emerald-500 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '6s' }} />
                        <span>Vaulted Recurring Scheduling</span>
                      </div>
                      {order.recurringInterval && (
                        <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.2 rounded uppercase">
                          Vaulted
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Vault this entire transaction configuration. Our ledger will securely re-draft the payment and re-ship identical items automatically.
                    </p>

                    {order.recurringInterval ? (
                      <div className="bg-emerald-50/45 border border-emerald-100 rounded-xl p-3 space-y-1.5 text-[10px] text-emerald-800 font-mono">
                        <div className="flex justify-between">
                          <span>Auto-Draft:</span>
                          <strong>ACTIVE</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Dispatch Speed:</span>
                          <strong>EVERY {order.recurringInterval.toUpperCase()}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Next Bill Date:</span>
                          <strong>7/13/2026</strong>
                        </div>
                        <p className="text-[8.5px] text-slate-400 font-sans leading-relaxed pt-1.5 border-t border-emerald-100/50">
                          Identical products will ship automatically from nearest fulfillment pods. Cancelling clears vaulted payment tokens immediately.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block uppercase">Select Delivery Schedule</label>
                          <select
                            id={`recurring-select-${order.id}`}
                            defaultValue="30 days"
                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-[10px] outline-none font-mono focus:border-teal-500"
                          >
                            <option value="7 days">Every 7 Days (Weekly replenishment)</option>
                            <option value="14 days">Every 14 Days (Bi-weekly restock)</option>
                            <option value="30 days">Every 30 Days (Monthly restock)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {order.recurringInterval ? (
                      <button
                        type="button"
                        id={`cancel-recur-btn-${order.id}`}
                        onClick={() => {
                          if (onUpdateOrder) {
                            onUpdateOrder({
                              ...order,
                              recurringInterval: undefined
                            });
                          }
                        }}
                        className="w-full py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        Cancel Recurring Dispatch
                      </button>
                    ) : (
                      <button
                        type="button"
                        id={`save-recur-btn-${order.id}`}
                        onClick={() => {
                          if (onUpdateOrder) {
                            const selectEl = document.getElementById(`recurring-select-${order.id}`) as HTMLSelectElement;
                            const interval = selectEl ? selectEl.value : '30 days';
                            onUpdateOrder({
                              ...order,
                              recurringInterval: interval
                            });
                          }
                        }}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        🔒 Vault & Schedule Dispatch
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* LOGISTICS FORM POPUP (Inline overlay for admin) */}
              {editingStatusId === order.id && (
                <div id={`logistics-editor-${order.id}`} className="rounded-xl border border-teal-500/20 bg-teal-50/5 p-4 space-y-3">
                  <p className="text-[10px] font-mono font-bold text-teal-700 uppercase tracking-wider">Logistics Class Adjuster Override</p>
                  
                  <div className="grid gap-3 sm:grid-cols-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Timeline Status</label>
                      <select
                        id={`logistics-status-select-${order.id}`}
                        value={tempStatus}
                        onChange={(e) => setTempStatus(e.target.value as Order['status'])}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none focus:border-teal-500"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-600">Courier Tracking Code</label>
                      <input
                        id={`logistics-tracking-input-${order.id}`}
                        type="text"
                        placeholder="TRK-8921-NX"
                        value={tempTracking}
                        onChange={(e) => setTempTracking(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      id={`logistics-cancel-${order.id}`}
                      type="button"
                      onClick={() => setEditingStatusId(null)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      id={`logistics-save-${order.id}`}
                      type="button"
                      onClick={() => handleSaveStatus(order.id)}
                      className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 text-xs font-bold"
                    >
                      Save Override
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      ) : (
        <div id="orders-empty-state" className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 px-4 text-center bg-white">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-sans">No Transaction Logs Sighted</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
            You have not registered any finished e-commerce transactions in this session. Return to the storefront to check out items.
          </p>
        </div>
      )}

      {/* 4. HIGH-FIDELITY INVOICE POPUP MODAL */}
      {selectedInvoice && (
        <div id="invoice-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div id="invoice-modal-content" className="relative w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl space-y-6">
            
            {/* Modal header actions */}
            <div id="invoice-modal-controls" className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Secure Audit Receipt Ledger</span>
              <div className="flex gap-2">
                <button
                  id="invoice-print-btn"
                  onClick={handlePrint}
                  className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  title="Print Receipt"
                >
                  <Printer className="h-4.5 w-4.5" />
                </button>
                <button
                  id="invoice-close-btn"
                  onClick={() => setSelectedInvoice(null)}
                  className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  title="Close Invoice"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* HIGH-CONTRAST INVOICE SHEETS */}
            <div id="printable-invoice-canvas" className="space-y-6 p-4 border border-slate-100 rounded-xl bg-white text-slate-800 font-sans">
              
              {/* Receipt Branding details */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">NexusBazaar LLC</h3>
                  <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">Platform Clearance Hub</p>
                  <p className="text-[9px] text-slate-400 mt-1">456 Decentralized Node Avenue, Suite C</p>
                </div>
                <div className="text-right">
                  <h4 className="text-base font-black text-slate-900 font-mono">INVOICE</h4>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">INV-{selectedInvoice.id}</p>
                  <p className="text-[9px] text-slate-400 mt-1">Cleared: {selectedInvoice.date}</p>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              {/* Recipient Coordinates */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Client Recipient</p>
                  {selectedInvoice.isZeroKnowledgeEncrypted ? (
                    decryptedOrderId === selectedInvoice.id ? (
                      <div className="space-y-0.5 mt-1 animate-fade-in">
                        <p className="font-bold text-slate-800">Alice Vance (Decrypted Recipient)</p>
                        <p className="text-slate-500">942 Quantum Way, Suite 4</p>
                        <p className="text-slate-500">San Francisco, CA 94101</p>
                        <span className="inline-block mt-2 bg-emerald-50 text-emerald-800 text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-emerald-200">
                          ✓ Asymmetric Address Decrypted by Authenticated Driver Handshake
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-1">
                        <p className="font-mono text-[10px] text-indigo-600 font-bold">🔒 [ECC-25519 ENCRYPTED SHIPPING LABEL]</p>
                        <p className="font-mono text-[8.5px] text-slate-400 leading-normal max-w-[250px] break-all bg-slate-900 text-teal-400 p-2 rounded">
                          CIPHERTEXT: {selectedInvoice.shippingAddress.street}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setDecrypting(true);
                            setTimeout(() => {
                              setDecryptedOrderId(selectedInvoice.id);
                              setDecrypting(false);
                            }, 1200);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-mono px-2.5 py-1.5 rounded-lg tracking-wide cursor-pointer transition-colors flex items-center gap-1.5 font-bold"
                        >
                          {decrypting ? '🗝️ Syncing courier keys...' : '🗝️ Decrypt Label (Driver Handshake)'}
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="mt-1">
                      <p className="font-bold text-slate-800">{selectedInvoice.shippingAddress.fullName}</p>
                      <p className="text-slate-500 mt-0.5">{selectedInvoice.shippingAddress.street}</p>
                      <p className="text-slate-500">{selectedInvoice.shippingAddress.city}, {selectedInvoice.shippingAddress.state} {selectedInvoice.shippingAddress.zip}</p>
                    </div>
                  )}
                </div>
                <div className="sm:text-right">
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Logistics Dispatcher</p>
                  <p className="font-bold text-slate-800 mt-1">Nexus Priority Express Courier</p>
                  <p className="text-slate-500 mt-0.5">Tracking No: {selectedInvoice.trackingNo || 'TRK-PENDING-NX'}</p>
                </div>
              </div>

              {/* Tabulated Itemized lists */}
              <div className="overflow-x-auto pt-3">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider font-mono">
                      <th className="py-2.5">Audit Item Description</th>
                      <th className="py-2.5 text-center">Qty</th>
                      <th className="py-2.5 text-right">Unit Rate</th>
                      <th className="py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.productId}>
                        <td className="py-3 font-medium text-slate-800">{item.name}</td>
                        <td className="py-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-3 text-right font-mono">${item.price}</td>
                        <td className="py-3 text-right font-mono">${item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              {/* Financial calculations recap */}
              <div className="flex flex-col items-end text-xs space-y-1.5">
                <div className="flex justify-between w-48 text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-700">${selectedInvoice.subtotal}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between w-48 text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span className="font-mono font-bold">-${selectedInvoice.discount}</span>
                  </div>
                )}
                <div className="flex justify-between w-48 text-slate-500">
                  <span>Logistics Courier</span>
                  <span className="font-mono font-bold text-slate-700">
                    {selectedInvoice.shipping === 0 ? 'FREE' : `$${selectedInvoice.shipping}`}
                  </span>
                </div>
                <div className="flex justify-between w-48 text-slate-500 border-b border-slate-100 pb-1.5">
                  <span>Regional Sales Tax</span>
                  <span className="font-mono font-bold text-slate-700">${selectedInvoice.tax}</span>
                </div>
                <div className="flex justify-between w-48 pt-1.5 text-sm">
                  <span className="font-bold text-slate-900">Total Sum</span>
                  <span className="font-mono font-black text-teal-600 text-base">${selectedInvoice.total}</span>
                </div>
              </div>

              {/* BATCH 3 INVOICE AUDIT EXTENSIONS */}
              {(selectedInvoice.warehouseHoldDays || selectedInvoice.fractionalInvoices || selectedInvoice.splitDeliveryAddresses || selectedInvoice.recurringInterval) && (
                <div className="border-t border-slate-100 pt-4.5 space-y-3.5 text-xs">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Special Logistics & Ledger Allocations</span>
                  
                  {selectedInvoice.warehouseHoldDays && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-600 font-mono">
                      <span className="font-bold text-slate-800">📦 Micro-Fulfillment Hold Registry Activation:</span>
                      <p className="mt-1">Items are being held in regional cold staging for <strong className="text-teal-600">{selectedInvoice.warehouseHoldDays} days</strong> to merge with ongoing pipelines. Restricting individual shipping boxes saves 14.2kg CO₂.</p>
                    </div>
                  )}

                  {selectedInvoice.recurringInterval && (
                    <div className="bg-emerald-50/40 border border-emerald-150 rounded-xl p-3 text-[10px] text-emerald-800 font-mono">
                      <span className="font-bold text-emerald-950">🔁 Vaulted Recurring Sequence Plan:</span>
                      <p className="mt-1">Vaulted credit coordinates authorized. Automatic draft and logistics dispatch recur on a strict <strong className="text-emerald-700">{selectedInvoice.recurringInterval}</strong> rotation.</p>
                    </div>
                  )}

                  {selectedInvoice.fractionalInvoices && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-600 font-mono">
                      <span className="font-bold text-slate-800">📊 Corporate Fractional Cost-Center Distribution:</span>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {Object.entries(selectedInvoice.fractionalInvoices).map(([dept, share]) => (
                          <div key={dept} className="bg-white p-2 rounded border border-slate-150">
                            <span className="text-[8px] font-bold text-slate-400 uppercase block truncate">{dept}</span>
                            <span className="font-bold text-slate-700 text-[11px] block mt-0.5">{share}%</span>
                            <span className="text-teal-600 font-bold text-[10px] block mt-0.5">
                              ${(selectedInvoice.total * (share / 100)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInvoice.splitDeliveryAddresses && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-600 font-mono">
                      <span className="font-bold text-slate-800">📍 Multi-Address Split Rerouting Map:</span>
                      <div className="space-y-2 mt-2">
                        {selectedInvoice.items.map((item) => {
                          // Look up by id or item name
                          const address = selectedInvoice.splitDeliveryAddresses?.[item.productId] || selectedInvoice.splitDeliveryAddresses?.[item.name] || 'Default master address';
                          return (
                            <div key={item.productId} className="flex justify-between bg-white p-2 rounded border border-slate-150 gap-3 text-[10px]">
                              <span className="font-bold text-slate-700 truncate max-w-[200px]">{item.name}</span>
                              <span className="text-slate-500 italic shrink-0 text-right font-mono truncate max-w-[250px]">{address}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Terms disclaimer */}
              <div className="border-t border-slate-100 pt-4 text-center">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">✓ Transaction Cleared & Audited</p>
                <p className="text-[8px] text-slate-400 mt-1">Thank you for transacting on NexusBazaar LLC. This document represents a physical sandbox audit log receipt.</p>
              </div>

            </div>

            {/* Lower modal button */}
            <div className="flex justify-end pt-2 border-t border-slate-50">
              <button
                id="invoice-footer-close-btn"
                onClick={() => setSelectedInvoice(null)}
                className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 text-xs font-bold"
              >
                Finished Audit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
