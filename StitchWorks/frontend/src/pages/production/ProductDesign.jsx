import React, { useState } from 'react';
import { FiLayers, FiTag, FiSliders, FiDroplet } from 'react-icons/fi';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import SizeRegistry from '../product/SizeRegistry';
import ColorsTab from './ColorsTab';

const TABS = [
    { id: 'products', label: 'Products', icon: FiLayers },
    { id: 'categories', label: 'Categories', icon: FiTag },
    { id: 'sizes', label: 'Sizes', icon: FiSliders },
    { id: 'colors', label: 'Colors', icon: FiDroplet },
];

const ProductDesign = () => {
    const [activeTab, setActiveTab] = useState('products');

    return (
        <div className="min-h-full p-4 md:p-6 lg:p-8 flex flex-col bg-[#F5F5F7] rounded-3xl border border-[#E5E5EA]">
            {/* Header */}
            <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E5EA] shadow-2xs w-fit mb-2.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Product Design</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
                    Catalogue & Style Registry
                </h1>
                <p className="text-sm text-[#86868B] mt-1">
                    Manage finished products, BOMs, garment categories, sizes, and colorways.
                </p>
            </div>

            {/* Tab Bar */}
            <div className="mb-6 flex items-center bg-slate-200/70 p-1.5 rounded-full w-fit gap-1.5 border border-slate-300/60 shadow-inner">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ borderRadius: '9999px' }}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer border-none outline-none ${
                                active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1">
                {activeTab === 'products' && <ProductsTab />}
                {activeTab === 'categories' && <CategoriesTab />}
                {activeTab === 'sizes' && <SizeRegistry />}
                {activeTab === 'colors' && <ColorsTab />}
            </div>
        </div>
    );
};

export default ProductDesign;
