import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiArrowUp, FiArrowDown, FiRefreshCw } from 'react-icons/fi';
import inventoryService from '../../services/inventoryService';
import materialService from '../../services/materialService';
import productService from '../../services/productService';

const TYPE_CONFIG = {
    IN:  { label: 'IN',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FiArrowUp },
    OUT: { label: 'OUT', cls: 'bg-red-50 text-red-600 border-red-200',             icon: FiArrowDown },
};

const TransactionHistoryTab = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState([]);
    const [products, setProducts] = useState([]);
    const [filterMaterialId, setFilterMaterialId] = useState('');
    const [filterProductId, setFilterProductId] = useState('');
    const [search, setSearch] = useState('');

    const loadLookups = async () => {
        try {
            const [mats, prods] = await Promise.all([materialService.getAllRawMaterials(), productService.getAllProducts()]);
            setMaterials(mats);
            setProducts(prods);
        } catch {}
    };

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterMaterialId) params.materialId = filterMaterialId;
            if (filterProductId) params.productId = filterProductId;
            setTransactions(await inventoryService.getTransactionHistory(params));
        } catch { toast.error('Failed to load transactions'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadLookups(); loadTransactions(); }, []);

    const handleClear = () => {
        setFilterMaterialId('');
        setFilterProductId('');
        setTimeout(() => loadTransactions(), 0);
    };

    const filtered = transactions.filter(t =>
        [t.itemName, t.transactionType, t.referenceNumber].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-end gap-3 mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Filter by Material</label>
                    <select value={filterMaterialId} onChange={e => { setFilterMaterialId(e.target.value); setFilterProductId(''); }}
                        className="px-3 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-[#007AFF] transition-all">
                        <option value="">All Materials</option>
                        {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Filter by Product</label>
                    <select value={filterProductId} onChange={e => { setFilterProductId(e.target.value); setFilterMaterialId(''); }}
                        className="px-3 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-[#007AFF] transition-all">
                        <option value="">All Products</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.styleCode})</option>)}
                    </select>
                </div>
                <div className="flex gap-2 ml-auto">
                    <button onClick={loadTransactions} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer transition-colors">
                        <FiRefreshCw size={13} /> Apply
                    </button>
                    <button onClick={handleClear} className="px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer transition-colors">
                        Clear
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="relative">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input type="text" placeholder="Search ledger..." value={search} onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-full text-xs bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:bg-white focus:ring-2 focus:ring-blue-500/15 transition-all w-56" />
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-12" />)}</div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3.5 bg-[#F5F5F7] border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Item</span><span>Type</span><span>Quantity</span><span>Date</span><span>Reference</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-sm">No transactions found.</div>
                        ) : filtered.map((t, idx) => {
                            const cfg = TYPE_CONFIG[t.transactionType] || TYPE_CONFIG.IN;
                            const Icon = cfg.icon;
                            return (
                                <div key={idx} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3.5 items-center hover:bg-slate-50 transition-colors">
                                    <span className="text-sm font-semibold text-slate-800 truncate">{t.itemName}</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border w-fit ${cfg.cls}`}>
                                        <Icon size={11} />{cfg.label}
                                    </span>
                                    <span className="text-sm font-bold tabular-nums text-slate-800">{t.quantity}</span>
                                    <span className="text-xs text-slate-500">{t.transactionDate || t.date || '—'}</span>
                                    <span className="text-xs font-mono text-slate-500 truncate">{t.referenceNumber || '—'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
};

export default TransactionHistoryTab;
