import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiPackage } from 'react-icons/fi';
import inventoryService from '../../services/inventoryService';

const FinishedGoodsStockTab = () => {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = async () => {
        setLoading(true);
        try { setStock(await inventoryService.getFinishedGoodsStock()); }
        catch { toast.error('Failed to load finished goods stock'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const filtered = stock.filter(i =>
        [i.productName, i.styleCode, i.categoryName].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <>
            <div className="flex items-center justify-between mb-5">
                <div className="relative">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-full text-xs bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:bg-white focus:ring-2 focus:ring-blue-500/15 transition-all w-56" />
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-14" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                    <FiPackage size={36} className="opacity-30" />
                    <p className="text-sm font-semibold">No finished goods in stock</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr] gap-4 px-6 py-3.5 bg-[#F5F5F7] border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Style Code</span><span>Product</span><span>Category</span><span className="text-right">Stock Qty</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {filtered.map(item => (
                            <div key={item.productId} className="grid grid-cols-[1fr_2fr_1.5fr_1fr] gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                <span className="text-xs font-bold font-mono text-slate-500">{item.styleCode}</span>
                                <span className="text-sm font-semibold text-slate-800 truncate">{item.productName}</span>
                                <span className="text-xs text-slate-500">{item.categoryName || '—'}</span>
                                <span className={`text-right text-sm font-extrabold tabular-nums ${item.currentStock === 0 ? 'text-red-500' : 'text-slate-900'}`}>
                                    {item.currentStock}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default FinishedGoodsStockTab;
