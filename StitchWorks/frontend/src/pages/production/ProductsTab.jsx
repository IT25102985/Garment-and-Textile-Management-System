import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiBox, FiLayers, FiDollarSign } from 'react-icons/fi';
import productService from '../../services/productService';
import materialService from '../../services/materialService';
import ProductModal from './ProductModal';

const ProductsTab = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [prodData, catData, matData] = await Promise.all([
                productService.getAllProducts(),
                productService.getAllCategories(),
                materialService.getAllRawMaterials(),
            ]);
            setProducts(prodData || []);
            setCategories(catData || []);
            setMaterials(matData || []);
        } catch { 
            toast.error('Failed to load products data'); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { 
        loadData(); 
    }, []);

    const handleSave = async (formData) => {
        try {
            if (editProduct) {
                await productService.updateProduct(editProduct.id, formData);
                toast.success('Product updated successfully!');
            } else {
                await productService.createProduct(formData);
                toast.success('Product created successfully!');
            }
            setShowModal(false);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
            throw error;
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try { 
            await productService.deleteProduct(id); 
            toast.success('Product deleted successfully'); 
            loadData(); 
        } catch { 
            toast.error('Failed to delete product'); 
        }
    };

    const handleEdit = (e, prod) => {
        e.stopPropagation();
        setEditProduct(prod);
        setShowModal(true);
    };

    const filtered = products.filter(p => {
        const matchesSearch = [p.name, p.styleCode, p.categoryName, p.description]
            .some(v => v?.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = selectedCategoryFilter === 'ALL' || String(p.categoryId) === String(selectedCategoryFilter);
        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <ProductModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                product={editProduct} 
                categories={categories} 
                materials={materials} 
                onSave={handleSave} 
            />

            {/* Filter & Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3 flex-1 max-w-xl">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input 
                            type="text" 
                            placeholder="Search by SKU, product name, or material..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 shadow-2xs transition-all" 
                        />
                    </div>
                    <select
                        value={selectedCategoryFilter}
                        onChange={e => setSelectedCategoryFilter(e.target.value)}
                        className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer shrink-0"
                    >
                        <option value="ALL">All Categories ({products.length})</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                
                <button 
                    onClick={() => { setEditProduct(null); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer shrink-0"
                >
                    <FiPlus size={16} /> 
                    <span>Add New Product</span>
                </button>
            </div>

            {/* Products Grid / States */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 h-80 flex flex-col p-4 space-y-3">
                            <div className="w-full h-44 bg-slate-100 rounded-xl"></div>
                            <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 text-slate-400 gap-3 shadow-2xs">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                        <FiBox size={32} />
                    </div>
                    <h3 className="text-base font-bold text-slate-700">No products found</h3>
                    <p className="text-xs text-slate-500 max-w-sm text-center">
                        {search || selectedCategoryFilter !== 'ALL' 
                            ? 'No products match your current search or category filter.' 
                            : 'Get started by creating your first garment design product.'}
                    </p>
                    <button 
                        onClick={() => { setEditProduct(null); setShowModal(true); }}
                        className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                        <FiPlus size={14} /> Create Product
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(prod => (
                        <div 
                            key={prod.id} 
                            onClick={(e) => handleEdit(e, prod)}
                            className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-violet-300/80 transition-all duration-300 overflow-hidden cursor-pointer"
                        >
                            {/* Card Image Area */}
                            <div className="relative w-full h-52 bg-slate-100 overflow-hidden flex items-center justify-center">
                                {prod.imageUrl ? (
                                    <img 
                                        src={prod.imageUrl} 
                                        alt={prod.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-400 p-4">
                                        <FiLayers size={36} className="text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-[11px] font-bold text-slate-400 font-mono">
                                            {prod.styleCode}
                                        </span>
                                    </div>
                                )}

                                {/* Category Tag (Top-Left) */}
                                {prod.categoryName && (
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm border border-white/60">
                                        {prod.categoryName}
                                    </div>
                                )}

                                {/* Floating Action Buttons (Top-Right) */}
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-full shadow-sm border border-white/60">
                                    <button 
                                        onClick={(e) => handleEdit(e, prod)}
                                        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                                        title="Edit Product"
                                    >
                                        <FiEdit2 size={13} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(e, prod.id)}
                                        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                        title="Delete Product"
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="inline-block px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 font-mono text-[10px] font-bold border border-violet-100">
                                            {prod.styleCode || 'SKU'}
                                        </span>
                                        {prod.boms?.length > 0 && (
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                • {prod.boms.length} BOM {prod.boms.length === 1 ? 'item' : 'items'}
                                            </span>
                                        )}
                                    </div>

                                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1 group-hover:text-violet-600 transition-colors">
                                        {prod.name}
                                    </h4>

                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed min-h-[34px]">
                                        {prod.description || 'No additional description provided.'}
                                    </p>
                                </div>

                                {/* Card Footer */}
                                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Base Price
                                        </span>
                                        <span className="text-sm font-extrabold text-slate-900 font-mono">
                                            Rs. {Number(prod.basePrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default ProductsTab;
