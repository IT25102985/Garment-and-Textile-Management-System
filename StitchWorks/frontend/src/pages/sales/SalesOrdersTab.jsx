import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiPlus, FiChevronRight, FiPackage } from 'react-icons/fi';
import salesService from '../../services/salesService';
import SalesOrderModal from './SalesOrderModal';

const STATUS_CONFIG = {
    PENDING:            { label: 'Pending',             cls: 'bg-amber-50 text-amber-800 border-amber-200' },
    PENDING_PRODUCTION: { label: 'Pending Production',  cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    IN_PRODUCTION:      { label: 'In Production',       cls: 'bg-blue-50 text-[#007AFF] border-blue-200' },
    READY_TO_DISPATCH:  { label: 'Ready to Dispatch',   cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    DISPATCHED:         { label: 'Dispatched',          cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    SHIPPED:            { label: 'Shipped',             cls: 'bg-violet-50 text-violet-700 border-violet-200' },
    DELIVERED:          { label: 'Delivered',           cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED:          { label: 'Cancelled',           cls: 'bg-red-50 text-red-600 border-red-200' },
};

const StatusPill = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
};

const SalesOrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const data = await salesService.getAllOrders();
            const sorted = Array.isArray(data) ? [...data].sort((a, b) => b.id - a.id) : [];
            setOrders(sorted);
        }
        catch { toast.error('Failed to load sales orders'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleModalClose = (wasSaved) => {
        setShowModal(false);
        setSelectedOrder(null);
        if (wasSaved) load();
    };

    const filtered = orders.filter(o =>
        [o.orderNumber, o.customerName, o.status].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <>
            <SalesOrderModal show={showModal} onClose={handleModalClose} orderData={selectedOrder} onRefresh={load} />

            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                <div className="relative">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-full text-xs bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:bg-white focus:ring-2 focus:ring-blue-500/15 transition-all w-56"
                    />
                </div>
                <button
                    onClick={() => { setSelectedOrder(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                    <FiPlus size={15} /> Create Order
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-14" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                    <FiPackage size={36} className="opacity-30" />
                    <p className="text-sm font-semibold">No sales orders found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3.5 bg-[#F5F5F7] border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Order No.</span>
                        <span>Customer</span>
                        <span>Order Date</span>
                        <span>Delivery Date</span>
                        <span>Status</span>
                        <span></span>
                    </div>
                    {/* Rows */}
                    <div className="divide-y divide-slate-100">
                        {filtered.map(o => (
                            <div
                                key={o.id}
                                onClick={() => { setSelectedOrder(o); setShowModal(true); }}
                                className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-[#F5F5F7]/60 cursor-pointer group transition-colors"
                            >
                                <span className="text-xs font-bold text-slate-800 font-mono">{o.orderNumber}</span>
                                <span className="text-sm font-semibold text-slate-700 truncate">{o.customerName}</span>
                                <span className="text-xs text-slate-500">{o.orderDate}</span>
                                <span className="text-xs text-slate-500">{o.deliveryDate}</span>
                                <StatusPill status={o.status} />
                                <FiChevronRight size={16} className="text-slate-300 group-hover:text-[#007AFF] transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default SalesOrdersTab;
