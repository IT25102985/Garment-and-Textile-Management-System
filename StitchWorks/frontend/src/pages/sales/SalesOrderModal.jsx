import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiPlus, FiTrash2, FiPackage, FiFileText, FiTruck, FiInfo, FiEdit2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import salesService from '../../services/salesService';
import productService from '../../services/productService';

// Visible pipeline bar — only the 5 statuses a Sales Officer actually moves through
const STATUS_BAR_STEPS = ['PENDING', 'IN_PRODUCTION', 'READY_TO_DISPATCH', 'DISPATCHED', 'DELIVERED'];

// Map every possible status to its bar position (for progress highlighting)
const STATUS_BAR_IDX = {
    PENDING:            0,
    PENDING_PRODUCTION: 0,  // still at the start — awaiting stock/production
    IN_PRODUCTION:      1,
    READY_TO_DISPATCH:  2,
    DISPATCHED:         3,
    SHIPPED:            3,  // treat same as dispatched
    DELIVERED:          4,
    CANCELLED:         -1,
};

const STATUS_CONFIG = {
    PENDING:            { label: 'Pending',            dot: 'bg-amber-400' },
    PENDING_PRODUCTION: { label: 'Pending Production', dot: 'bg-orange-400' },
    IN_PRODUCTION:      { label: 'In Production',      dot: 'bg-blue-500' },
    READY_TO_DISPATCH:  { label: 'Ready to Dispatch',  dot: 'bg-cyan-500' },
    DISPATCHED:         { label: 'Dispatched',         dot: 'bg-indigo-500' },
    SHIPPED:            { label: 'Shipped',            dot: 'bg-violet-500' },
    DELIVERED:          { label: 'Delivered',          dot: 'bg-emerald-500' },
    CANCELLED:          { label: 'Cancelled',          dot: 'bg-red-400' },
};

// ── Helper sub-components ────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{children}</h3>
);

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-slate-50 last:border-0">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-semibold text-slate-800">{value || '—'}</span>
    </div>
);

// ── Tracking Number Modal ────────────────────────────────────────────────────

const TrackingModal = ({ show, onClose, onConfirm, title, initialValue = '', confirmLabel = 'Confirm' }) => {
    const [value, setValue] = useState(initialValue);
    useEffect(() => { if (show) setValue(initialValue); }, [show, initialValue]);
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10">
                <h3 className="text-base font-bold text-slate-900 mb-4">{title}</h3>
                <input
                    autoFocus
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="e.g. TRK-20261001-ABC123"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all mb-4"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">Cancel</button>
                    <button
                        onClick={() => { if (value.trim()) { onConfirm(value.trim()); onClose(); } else toast.error('Please enter a tracking number.'); }}
                        className="px-5 py-2 rounded-full bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer transition-colors"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Due Date Modal for Invoice ────────────────────────────────────────────────

const InvoiceDueDateModal = ({ show, onClose, onConfirm }) => {
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10">
                <h3 className="text-base font-bold text-slate-900 mb-4">Generate Invoice</h3>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Due Date</label>
                <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all mb-4"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">Cancel</button>
                    <button
                        onClick={() => { onConfirm(dueDate); onClose(); }}
                        className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                    >
                        Create Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Confirm Danger Modal ──────────────────────────────────────────────────────

const ConfirmModal = ({ show, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10">
                <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 mb-5">{message}</p>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">
                        Keep Order
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`px-5 py-2 rounded-full text-white text-xs font-semibold cursor-pointer transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#007AFF] hover:bg-blue-600'}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Modal ────────────────────────────────────────────────────────────────

const SalesOrderModal = ({ show, onClose, orderData, onRefresh }) => {
    const isEditMode = !!orderData;

    const [customerId, setCustomerId] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [items, setItems] = useState([]);

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const [localOrderData, setLocalOrderData] = useState(orderData);
    const [activeTab, setActiveTab] = useState('items');
    const [saving, setSaving] = useState(false);

    // Modal states
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [showUpdateTrackingModal, setShowUpdateTrackingModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => {
        setLocalOrderData(orderData);
        setActiveTab('items');
    }, [orderData]);

    useEffect(() => {
        const loadLookups = async () => {
            try {
                if (!isEditMode) setCustomers(await salesService.getAllCustomers());
                setProducts(await productService.getAllProducts());
            } catch {}
        };
        if (show) loadLookups();
    }, [show, isEditMode]);

    const refreshOrder = async () => {
        try {
            const data = await salesService.getAllOrders();
            const updated = data.find(o => o.id === localOrderData.id);
            if (updated) setLocalOrderData(updated);
            if (onRefresh) onRefresh();
        } catch {}
    };

    const handleAddItem = () => {
        if (!selectedProductId || selectedQuantity <= 0) return;
        const product = products.find(p => p.id === parseInt(selectedProductId));
        if (!product) return;
        setItems([...items, { productId: product.id, productName: product.name, styleCode: product.styleCode, unitPrice: product.basePrice, quantity: parseInt(selectedQuantity) }]);
        setSelectedProductId('');
        setSelectedQuantity(1);
    };

    const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

    const handleSaveOrder = async (e) => {
        e.preventDefault();
        if (!customerId) { toast.error('Please select a customer.'); return; }
        if (items.length === 0) { toast.error('Please add at least one item.'); return; }
        setSaving(true);
        try {
            await salesService.createOrder({
                customerId: parseInt(customerId, 10),
                deliveryDate,
                items
            });
            toast.success('Order created successfully');
            onClose(true);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create order';
            toast.error(typeof msg === 'string' ? msg : 'Failed to create order');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        try {
            await salesService.updateStatus(localOrderData.id, status);
            toast.success('Status updated');
            refreshOrder();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error;
            if (msg?.toLowerCase().includes('stock') || msg?.toLowerCase().includes('inventory')) {
                toast.error(`Inventory issue: ${msg}`);
            } else {
                toast.error('Failed to update status');
            }
        }
    };

    const handleCreateInvoice = async (dueDate) => {
        try {
            await salesService.createInvoice(localOrderData.id, dueDate);
            toast.success('Invoice created');
            refreshOrder();
        } catch { toast.error('Failed to create invoice'); }
    };

    const handleDispatch = async (trackingNumber) => {
        try {
            await salesService.shipOrder(localOrderData.id, trackingNumber);
            toast.success('Order dispatched');
            refreshOrder();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error;
            if (msg?.toLowerCase().includes('stock') || msg?.toLowerCase().includes('inventory')) {
                toast.error(`Inventory issue: ${msg}`);
            } else {
                toast.error('Failed to dispatch order. Check inventory levels.');
            }
        }
    };

    const handleUpdateTracking = async (trackingNumber) => {
        try {
            await salesService.updateTracking(localOrderData.id, trackingNumber);
            toast.success('Tracking number updated');
            refreshOrder();
        } catch { toast.error('Failed to update tracking number'); }
    };

    const handleCancelOrder = async () => {
        try {
            await salesService.cancelOrder(localOrderData.id);
            toast.success(`Order ${localOrderData.orderNumber} cancelled successfully.`);
            onClose(true); // refresh parent list
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to cancel order.';
            toast.error(msg);
        }
    };

    const total = (localOrderData?.items || []).reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const statusIdx = STATUS_BAR_IDX[localOrderData?.status] ?? -1;
    const currentStatus = localOrderData?.status;

    if (!show) return null;

    return (
        <>
            <TrackingModal
                show={showDispatchModal}
                onClose={() => setShowDispatchModal(false)}
                onConfirm={handleDispatch}
                title="Dispatch Order — Enter Tracking Number"
                confirmLabel="Dispatch"
            />
            <TrackingModal
                show={showUpdateTrackingModal}
                onClose={() => setShowUpdateTrackingModal(false)}
                onConfirm={handleUpdateTracking}
                title="Update Tracking Number"
                initialValue={localOrderData?.shipment?.trackingNumber || ''}
                confirmLabel="Update"
            />
            <InvoiceDueDateModal
                show={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                onConfirm={handleCreateInvoice}
            />
            <ConfirmModal
                show={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelOrder}
                title="Cancel Order?"
                message={`Are you sure you want to cancel order ${localOrderData?.orderNumber}? This action cannot be undone.`}
                confirmLabel="Yes, Cancel Order"
                danger
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => onClose(false)} />
                <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0 bg-white">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {isEditMode ? `Order — ${localOrderData?.orderNumber}` : 'New Sales Order'}
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                {isEditMode ? `Customer: ${localOrderData?.customerName}` : 'Fill in the order details below'}
                            </p>
                        </div>
                        <button onClick={() => onClose(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors text-lg cursor-pointer"><FiX size={18} /></button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {!isEditMode ? (
                            // ── CREATION MODE ──────────────────────────────────────────────────────
                            <form onSubmit={handleSaveOrder} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Customer *</label>
                                        <select required value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all">
                                            <option value="">Select Customer...</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Delivery Date *</label>
                                        <input type="date" required value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all" />
                                    </div>
                                </div>

                                {/* Add Item Row */}
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                    <SectionLabel>Add Order Items</SectionLabel>
                                    <div className="flex gap-3 items-end">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Product</label>
                                            <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] transition-all">
                                                <option value="">Select Product...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.styleCode})</option>)}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Qty</label>
                                            <input type="number" min="1" value={selectedQuantity} onChange={e => setSelectedQuantity(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] transition-all" />
                                        </div>
                                        <button type="button" onClick={handleAddItem} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold cursor-pointer transition-colors">
                                            <FiPlus size={14} /> Add
                                        </button>
                                    </div>
                                </div>

                                {/* Items Table */}
                                {items.length > 0 && (
                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-4 py-2.5 bg-[#F5F5F7] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            <span>Product</span><span>Style</span><span>Qty</span><span>Unit (Rs.)</span><span></span>
                                        </div>
                                        {items.map((item, idx) => (
                                            <div key={idx} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 items-center border-t border-slate-100 text-sm">
                                                <span className="font-semibold text-slate-800 truncate">{item.productName}</span>
                                                <span className="text-slate-500 font-mono text-xs">{item.styleCode}</span>
                                                <span className="text-slate-700">{item.quantity}</span>
                                                <span className="text-slate-700 font-mono">{Number(item.unitPrice).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                                                <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"><FiTrash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-end pt-2 border-t border-slate-100">
                                    <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-[#007AFF] hover:bg-blue-600 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50">
                                        {saving ? 'Submitting...' : 'Submit Order'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            // ── DETAIL VIEW MODE ──────────────────────────────────────────────────
                            <div className="p-6 space-y-6">
                                {/* Status Pipeline */}
                                {currentStatus !== 'CANCELLED' && (
                                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                                        {STATUS_BAR_STEPS.map((step, i) => {
                                            const done = i <= statusIdx;
                                            const cfg = STATUS_CONFIG[step];
                                            // Show a subtle sub-label when order is PENDING_PRODUCTION at the PENDING bar step
                                            const subLabel = step === 'PENDING' && currentStatus === 'PENDING_PRODUCTION' ? '(Awaiting Stock)' : null;
                                            return (
                                                <React.Fragment key={step}>
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold border whitespace-nowrap transition-all ${done ? `${cfg.dot.replace('bg-', 'border-')} bg-white text-slate-800` : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${done ? (currentStatus === 'PENDING_PRODUCTION' && step === 'PENDING' ? 'bg-orange-400' : cfg.dot) : 'bg-slate-300'}`} />
                                                        {cfg.label}{subLabel && <span className="ml-0.5 font-normal opacity-70">{subLabel}</span>}
                                                    </div>
                                                    {i < STATUS_BAR_STEPS.length - 1 && <div className={`flex-1 min-w-[6px] h-px ${i < statusIdx ? 'bg-slate-300' : 'bg-slate-200'}`} />}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Order Meta */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <SectionLabel>Order Details</SectionLabel>
                                        <InfoRow label="Order Number" value={localOrderData?.orderNumber} />
                                        <InfoRow label="Order Date" value={localOrderData?.orderDate} />
                                        <InfoRow label="Delivery Date" value={localOrderData?.deliveryDate} />
                                        <InfoRow label="Status" value={STATUS_CONFIG[currentStatus]?.label || currentStatus} />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <SectionLabel>Customer Info</SectionLabel>
                                        <InfoRow label="Customer" value={localOrderData?.customerName} />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    {/* Legacy/Sales-officer–created flow */}
                                    {currentStatus === 'PENDING' && (
                                        <button onClick={() => handleUpdateStatus('IN_PRODUCTION')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-[#007AFF] text-xs font-semibold border border-blue-200 cursor-pointer transition-colors">
                                            <FiPackage size={14} /> Mark In Production
                                        </button>
                                    )}
                                    {currentStatus === 'IN_PRODUCTION' && !localOrderData?.shipment && (
                                        <button onClick={() => setShowDispatchModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 cursor-pointer transition-colors">
                                            <FiTruck size={14} /> Ship Order
                                        </button>
                                    )}

                                    {/* Customer-portal flow: PENDING_PRODUCTION */}
                                    {currentStatus === 'PENDING_PRODUCTION' && (
                                        <>
                                            <button onClick={() => handleUpdateStatus('IN_PRODUCTION')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-[#007AFF] text-xs font-semibold border border-blue-200 cursor-pointer transition-colors">
                                                <FiPackage size={14} /> Start Production
                                            </button>
                                            <button onClick={() => handleUpdateStatus('READY_TO_DISPATCH')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-semibold border border-cyan-200 cursor-pointer transition-colors">
                                                <FiCheckCircle size={14} /> Mark Ready to Dispatch
                                            </button>
                                        </>
                                    )}
                                    {currentStatus === 'READY_TO_DISPATCH' && (
                                        <button onClick={() => setShowDispatchModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-semibold border border-cyan-200 cursor-pointer transition-colors">
                                            <FiTruck size={14} /> Dispatch Order
                                        </button>
                                    )}
                                    {currentStatus === 'DISPATCHED' && (
                                        <button onClick={() => handleUpdateStatus('DELIVERED')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 cursor-pointer transition-colors">
                                            <FiCheckCircle size={14} /> Mark Delivered
                                        </button>
                                    )}

                                    {/* Update Tracking — available when shipment exists */}
                                    {localOrderData?.shipment && (
                                        <button onClick={() => setShowUpdateTrackingModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer transition-colors">
                                            <FiEdit2 size={14} /> Update Tracking
                                        </button>
                                    )}

                                    {/* Generate Invoice — available when no invoice yet */}
                                    {!localOrderData?.invoice && (
                                        <button onClick={() => setShowInvoiceModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 cursor-pointer transition-colors">
                                            <FiFileText size={14} /> Generate Invoice
                                        </button>
                                    )}

                                    {/* Cancel Order — available until dispatched/delivered */}
                                    {currentStatus !== 'CANCELLED' &&
                                     currentStatus !== 'DELIVERED' &&
                                     currentStatus !== 'DISPATCHED' &&
                                     currentStatus !== 'SHIPPED' && (
                                        <button onClick={() => setShowCancelModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 cursor-pointer transition-colors ml-auto">
                                            <FiXCircle size={14} /> Cancel Order
                                        </button>
                                    )}
                                </div>

                                {/* Sub-tabs */}
                                <div>
                                    <div className="flex gap-1 mb-4 p-1 bg-slate-100 rounded-xl w-fit">
                                        {['items', 'invoice', 'shipment'].map(tab => (
                                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${activeTab === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    {activeTab === 'items' && (
                                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3 bg-[#F5F5F7] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                <span>Product</span><span>Style</span><span>Qty</span><span>Unit (Rs.)</span><span className="text-right">Subtotal</span>
                                            </div>
                                            {(localOrderData?.items || []).map(item => (
                                                <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3.5 items-center border-t border-slate-100 text-sm">
                                                    <span className="font-semibold text-slate-800 truncate">{item.productName}</span>
                                                    <span className="text-slate-500 font-mono text-xs">{item.styleCode}</span>
                                                    <span className="text-slate-700">{item.quantity}</span>
                                                    <span className="text-slate-700 font-mono text-xs">{Number(item.unitPrice).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                                                    <span className="text-right font-bold text-slate-900 font-mono text-xs">
                                                        Rs. {(item.quantity * item.unitPrice).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="flex justify-end px-5 py-3.5 border-t border-slate-200 bg-slate-50">
                                                <span className="text-sm font-extrabold text-slate-900">Total: Rs. {total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'invoice' && (
                                        localOrderData?.invoice ? (
                                            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
                                                <InfoRow label="Invoice No." value={localOrderData.invoice.invoiceNumber} />
                                                <InfoRow label="Total Amount" value={`Rs. ${Number(localOrderData.invoice.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`} />
                                                <InfoRow label="Paid Amount" value={localOrderData.invoice.paidAmount != null ? `Rs. ${Number(localOrderData.invoice.paidAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : null} />
                                                <InfoRow label="Due Date" value={localOrderData.invoice.dueDate} />
                                                <InfoRow label="Status" value={localOrderData.invoice.status} />
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 text-slate-400 text-sm">No invoice generated yet.</div>
                                        )
                                    )}

                                    {activeTab === 'shipment' && (
                                        localOrderData?.shipment ? (
                                            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
                                                <InfoRow label="Tracking Number" value={localOrderData.shipment.trackingNumber} />
                                                <InfoRow label="Shipped Date" value={localOrderData.shipment.shippedDate} />
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 text-slate-400 text-sm">Order not yet shipped.</div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SalesOrderModal;
