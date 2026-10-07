import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiSearch } from 'react-icons/fi';
import inventoryService from '../../services/inventoryService';

const StockBar = ({ current, reorder }) => {
    const max = Math.max(current, reorder) * 1.5 || 1;
    const pct = Math.min((current / max) * 100, 100);
    const isLow = current <= reorder;
    const isCritical = current === 0;
    const color = isCritical ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-emerald-500';
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-xs font-bold tabular-nums ${isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-700'}`}>
                {current}
            </span>
        </div>
    );
};

const RawMaterialStockTab = () => {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lowOnly, setLowOnly] = useState(false);
    const [search, setSearch] = useState('');

    const loadStock = async () => {
        setLoading(true);
        try {
            const data = lowOnly
                ? await inventoryService.getLowStockMaterials()
                : await inventoryService.getRawMaterialStock();
            setStock(data);
        } catch { toast.error('Failed to load raw material stock'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadStock(); }, [lowOnly]);

    const lowCount = stock.filter(i => i.currentStock <= (i.reorderLevel || 0)).length;

    const filtered = stock.filter(i =>
        [i.materialName, i.category, i.unit].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <>
            {/* KPI bar */}
            {lowCount > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-5 text-sm">
                    <FiAlertTriangle className="text-red-500 shrink-0" size={16} />
                    <p className="text-red-700 font-semibold text-xs">{lowCount} material{lowCount !== 1 ? 's' : ''} below reorder level</p>
                    <button onClick={() => setLowOnly(!lowOnly)} className="ml-auto text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer transition-colors">
                        {lowOnly ? 'Show All' : 'Show Low Stock Only'}
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between mb-5 gap-3">
                <div className="relative">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input type="text" placeholder="Search materials..." value={search} onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-full text-xs bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:bg-white focus:ring-2 focus:ring-blue-500/15 transition-all w-56" />
                </div>
                {lowCount === 0 && (
                    <button onClick={() => setLowOnly(!lowOnly)} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                        {lowOnly ? 'Show All' : 'Low Stock Only'}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-14" />)}</div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-4 px-6 py-3.5 bg-[#F5F5F7] border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Material</span><span>Category</span><span>Unit</span><span>Reorder Level</span><span>Stock Level</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-sm">No materials found.</div>
                        ) : filtered.map(item => {
                            const isLow = item.currentStock <= (item.reorderLevel || 0);
                            return (
                                <div key={item.materialId} className={`grid grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-4 px-6 py-4 items-center transition-colors ${isLow ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'}`}>
                                    <div className="flex items-center gap-2">
                                        {isLow && <FiAlertTriangle size={13} className="text-amber-500 shrink-0" />}
                                        <span className="text-sm font-semibold text-slate-800 truncate">{item.materialName}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">{item.category || '—'}</span>
                                    <span className="text-xs text-slate-500">{item.unit}</span>
                                    <span className="text-xs font-mono text-slate-600">{item.reorderLevel ?? '—'}</span>
                                    <StockBar current={item.currentStock} reorder={item.reorderLevel || 0} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
};

export default RawMaterialStockTab;
