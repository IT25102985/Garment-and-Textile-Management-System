import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiTool, FiPlus, FiLayout, FiList, FiChevronRight } from 'react-icons/fi';
import productionService from '../../services/productionService';
import ProductionOrderModal from './ProductionOrderModal';

const STATUS_CONFIG = {
    PLANNED:     { label: 'Planned',     col: 'bg-slate-50 border-slate-200',   badge: 'bg-slate-100 text-slate-700 border-slate-200',   dot: 'bg-slate-400' },
    IN_PROGRESS: { label: 'In Progress', col: 'bg-blue-50/50 border-blue-200',  badge: 'bg-blue-50 text-[#007AFF] border-blue-200',      dot: 'bg-[#007AFF]' },
    COMPLETED:   { label: 'Completed',   col: 'bg-emerald-50/50 border-emerald-200', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    CANCELLED:   { label: 'Cancelled',   col: 'bg-red-50/50 border-red-200', badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
};

const COLUMNS = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const KanbanCard = ({ order, onClick }) => {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLANNED;
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 cursor-pointer hover:shadow-sm hover:border-blue-300/50 transition-all group"
        >
            <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold font-mono text-slate-400">{order.orderNumber}</span>
                <FiChevronRight size={14} className="text-slate-300 group-hover:text-[#007AFF] transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 truncate mb-1">{order.productName}</h4>
            <p className="text-xs text-slate-500 mb-3">Style: <span className="font-mono">{order.styleCode}</span></p>
            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Qty: <span className="font-bold text-slate-800">{order.quantity}</span></span>
                <span className="text-slate-400">{order.startDate}</span>
            </div>
            {order.salesOrderNumber && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">Linked SO: <span className="font-mono font-semibold text-slate-600">{order.salesOrderNumber}</span></span>
                </div>
            )}
        </div>
    );
};

const Production = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const load = async () => {
        setLoading(true);
        try { setOrders(await productionService.getAllOrders()); }
        catch { toast.error('Failed to load production orders'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleModalClose = (wasSaved) => {
        setShowModal(false);
        setSelectedOrder(null);
        if (wasSaved) load();
    };

    const byStatus = COLUMNS.reduce((acc, s) => {
        acc[s] = orders.filter(o => o.status === s);
        return acc;
    }, {});

    return (
        <div className="min-h-full p-4 md:p-6 lg:p-8 flex flex-col bg-[#F5F5F7] rounded-3xl border border-[#E5E5EA]">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E5EA] shadow-2xs w-fit mb-2.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Production</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
                        Production Orders
                    </h1>
                    <p className="text-sm text-[#86868B] mt-1">
                        Track garment production batches from planning to completion.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center bg-slate-200/70 p-1 rounded-full gap-1 border border-slate-300/60">
                        <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}><FiLayout size={14} /></button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}><FiList size={14} /></button>
                    </div>
                    <button
                        onClick={() => { setSelectedOrder(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                        <FiPlus size={15} /> Create Order
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-3 gap-5">
                    {[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-64" />)}
                </div>
            ) : viewMode === 'kanban' ? (
                // ── KANBAN BOARD ───────────────────────────────────────────────────────
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {COLUMNS.map(status => {
                        const cfg = STATUS_CONFIG[status];
                        const col = byStatus[status] || [];
                        return (
                            <div key={status} className={`rounded-2xl border p-4 ${cfg.col}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                        <span className="text-xs font-bold text-slate-700">{cfg.label}</span>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge}`}>{col.length}</span>
                                </div>
                                <div className="space-y-3">
                                    {col.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400 text-xs">No orders</div>
                                    ) : (
                                        col.map(order => (
                                            <KanbanCard key={order.id} order={order} onClick={() => { setSelectedOrder(order); setShowModal(true); }} />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // ── TABLE VIEW ─────────────────────────────────────────────────────────
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3.5 bg-[#F5F5F7] border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Order No.</span><span>Product</span><span>Qty</span><span>Start Date</span><span>Status</span><span></span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {orders.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 text-sm">No production orders found.</div>
                        ) : orders.map(o => {
                            const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.PLANNED;
                            return (
                                <div key={o.id} onClick={() => { setSelectedOrder(o); setShowModal(true); }}
                                    className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-[#F5F5F7]/60 cursor-pointer group transition-colors"
                                >
                                    <span className="text-xs font-bold font-mono text-slate-700">{o.orderNumber}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 truncate">{o.productName}</p>
                                        <p className="text-[11px] font-mono text-slate-400">{o.styleCode}</p>
                                    </div>
                                    <span className="text-sm text-slate-700">{o.quantity}</span>
                                    <span className="text-xs text-slate-500">{o.startDate}</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.badge}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                                    </span>
                                    <FiChevronRight size={16} className="text-slate-300 group-hover:text-[#007AFF] transition-colors" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showModal && (
                <ProductionOrderModal show={showModal} onClose={handleModalClose} orderData={selectedOrder} />
            )}
        </div>
    );
};

export default Production;
