import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUploadCloud, FiPlus, FiTrash2, FiImage, FiCheck } from 'react-icons/fi';

const ProductModal = ({ isOpen, onClose, product, categories = [], materials = [], onSave }) => {
    const [formData, setFormData] = useState({
        styleCode: '',
        name: '',
        description: '',
        basePrice: '',
        categoryId: '',
        imageUrl: '',
        published: true
    });
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [boms, setBoms] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [hasError, setHasError] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (product) {
            setFormData({
                styleCode: product.styleCode || '',
                name: product.name || '',
                description: product.description || '',
                basePrice: product.basePrice !== undefined ? String(product.basePrice) : '',
                categoryId: product.categoryId || '',
                imageUrl: product.imageUrl || '',
                published: product.published !== undefined ? product.published : true
            });
            setPreviewUrl(product.imageUrl || '');
            setSelectedFile(null);
            setBoms(product.boms ? product.boms.map(b => ({
                rawMaterialId: b.rawMaterialId || '',
                quantityRequired: b.quantityRequired !== undefined ? String(b.quantityRequired) : ''
            })) : []);
        } else {
            setFormData({
                styleCode: '',
                name: '',
                description: '',
                basePrice: '',
                categoryId: '',
                imageUrl: '',
                published: true
            });
            setPreviewUrl('');
            setSelectedFile(null);
            setBoms([]);
        }
        setHasError(false);
        setIsDragging(false);
    }, [product, isOpen]);

    // Handle File Selection
    const handleFileChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileChange(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileChange(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleAddBOM = () => {
        setBoms([...boms, { rawMaterialId: '', quantityRequired: '' }]);
    };

    const handleBOMChange = (index, field, value) => {
        const newBoms = [...boms];
        newBoms[index][field] = value;
        setBoms(newBoms);
    };

    const handleRemoveBOM = (index) => {
        const newBoms = [...boms];
        newBoms.splice(index, 1);
        setBoms(newBoms);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.styleCode.trim() || !formData.name.trim()) {
            setHasError(true);
            setTimeout(() => setHasError(false), 800);
            return;
        }

        setIsSaving(true);
        
        try {
            const data = new FormData();
            data.append('styleCode', formData.styleCode.trim());
            data.append('name', formData.name.trim());
            data.append('description', formData.description || '');
            data.append('basePrice', formData.basePrice ? String(parseFloat(formData.basePrice)) : '0');
            if (formData.categoryId) {
                data.append('categoryId', String(formData.categoryId));
            }
            data.append('published', String(formData.published));
            
            // Clean BOMs
            const validBoms = boms
                .filter(b => b.rawMaterialId)
                .map(b => ({
                    rawMaterialId: Number(b.rawMaterialId),
                    quantityRequired: parseFloat(b.quantityRequired) || 0
                }));
            data.append('boms', JSON.stringify(validBoms));

            if (selectedFile) {
                data.append('image', selectedFile);
            } else if (previewUrl) {
                data.append('imageUrl', previewUrl);
            } else {
                data.append('imageUrl', '');
            }

            await onSave(data);
        } catch (err) {
            console.error('Save product error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: "spring", damping: 26, stiffness: 320 }}
                    className="relative flex flex-col w-full max-w-4xl max-h-[90vh] my-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[10000]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="px-8 py-5 border-b border-gray-100 relative flex justify-between items-center shrink-0 bg-white">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
                                {product ? 'Edit Mode' : 'New Product'}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                                {product ? `Edit ${product.name}` : 'Create New Product'}
                            </h2>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto px-8 py-6 premium-scrollbar">
                        <form id="productForm" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Left Column: Image Upload (5 cols) */}
                            <div className="lg:col-span-5 flex flex-col space-y-4">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Product Picture
                                </label>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileInput}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {previewUrl ? (
                                    <div className="relative group w-full h-72 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner">
                                        <img 
                                            src={previewUrl} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition-opacity flex flex-col justify-end p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex-1 py-2 px-3 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md"
                                                >
                                                    <FiUploadCloud size={14} /> Change Photo
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="py-2 px-3 rounded-xl bg-red-500/90 hover:bg-red-600 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center cursor-pointer backdrop-blur-md"
                                                    title="Remove Photo"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                            {selectedFile && (
                                                <p className="text-[10px] text-white/80 mt-2 truncate text-center">
                                                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`w-full h-72 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 ${
                                            isDragging 
                                                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' 
                                                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
                                        }`}
                                    >
                                        <div className="w-14 h-14 mb-3 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                                            <FiUploadCloud size={28} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-800">
                                            Drag & drop product picture
                                        </span>
                                        <span className="text-xs text-slate-500 mt-1">
                                            or <span className="text-blue-600 font-semibold underline">browse from your computer</span>
                                        </span>
                                        <span className="text-[10px] text-slate-400 mt-3 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                                            Supports PNG, JPG, JPEG, WebP
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Fields & BOM (7 cols) */}
                            <div className="lg:col-span-7 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                                            Style Code (SKU) *
                                        </label>
                                        <input
                                            type="text"
                                            name="styleCode"
                                            value={formData.styleCode}
                                            onChange={handleInputChange}
                                            required
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                                hasError && !formData.styleCode.trim() 
                                                    ? 'border-red-500 bg-red-50/30 ring-2 ring-red-200' 
                                                    : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'
                                            }`}
                                            placeholder="e.g. ST-2026-POLO"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                                            Product Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                                hasError && !formData.name.trim() 
                                                    ? 'border-red-500 bg-red-50/30 ring-2 ring-red-200' 
                                                    : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'
                                            }`}
                                            placeholder="e.g. Premium Cotton Polo"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                                            Category
                                        </label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 text-sm font-medium transition-all"
                                        >
                                            <option value="">Select Category...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                                            Base Price (Rs.)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="basePrice"
                                            value={formData.basePrice}
                                            onChange={handleInputChange}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 text-sm font-medium transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 text-sm font-medium transition-all resize-y"
                                        placeholder="Product details, fabric specifications, finishings..."
                                    />
                                </div>

                                {/* Bill of Materials (BOM) */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                                Bill of Materials (BOM)
                                            </h3>
                                            <p className="text-[11px] text-slate-400">
                                                Raw materials required to produce one unit
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddBOM}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors cursor-pointer border border-blue-100"
                                        >
                                            <FiPlus size={14} /> Add Material
                                        </button>
                                    </div>

                                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto premium-scrollbar pr-1">
                                        {boms.length === 0 ? (
                                            <div className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                No raw materials linked. Click "Add Material" above.
                                            </div>
                                        ) : (
                                            boms.map((bom, index) => {
                                                const selectedMat = materials.find(m => String(m.id) === String(bom.rawMaterialId));
                                                return (
                                                    <div key={index} className="flex gap-2 items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                                                        <div className="flex-1 min-w-0">
                                                            <select
                                                                value={bom.rawMaterialId}
                                                                onChange={e => handleBOMChange(index, 'rawMaterialId', e.target.value)}
                                                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-blue-500 focus:outline-none"
                                                                required
                                                            >
                                                                <option value="">Select Raw Material...</option>
                                                                {materials.map(m => (
                                                                    <option key={m.id} value={m.id}>
                                                                        {m.name} ({m.unit || 'unit'})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="w-28 relative">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={bom.quantityRequired}
                                                                onChange={e => handleBOMChange(index, 'quantityRequired', e.target.value)}
                                                                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-blue-500 focus:outline-none"
                                                                required
                                                                placeholder="Qty"
                                                            />
                                                            {selectedMat?.unit && (
                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                                                                    {selectedMat.unit}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveBOM(index)}
                                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                                                            title="Remove material"
                                                        >
                                                            <FiTrash2 size={15} />
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-8 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-slate-50/80 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="productForm"
                            disabled={isSaving}
                            className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 flex items-center justify-center min-w-[110px] cursor-pointer"
                        >
                            {isSaving ? (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                product ? 'Update Product' : 'Save Product'
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default ProductModal;
