import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiDownload, FiPlus, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import AddSizeModal from './AddSizeModal';

const SizeRegistry = () => {
    const [sizes, setSizes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSize, setEditingSize] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadSizes();
    }, []);

    const loadSizes = async () => {
        setLoading(true);
        try {
            const data = await productService.getAllSizes();
            setSizes(data);
        } catch (error) {
            toast.error('Failed to load sizes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSize = async (formData, sizeId) => {
        try {
            if (sizeId) {
                await productService.updateSizeWithMeasurements(sizeId, formData);
                toast.success('Size updated successfully');
            } else {
                await productService.createSizeWithMeasurements(formData);
                toast.success('Size created successfully');
            }
            loadSizes();
            setEditingSize(null);
            setIsModalOpen(false);
        } catch (error) {
            toast.error(sizeId ? 'Failed to update size' : 'Failed to create size');
            console.error(error);
        }
    };

    const handleEditSize = (size) => {
        setEditingSize(size);
        setIsModalOpen(true);
    };

    const handleDeleteSize = async (id) => {
        if (!window.confirm('Are you sure you want to delete this size?')) return;
        try {
            await productService.deleteSize(id);
            toast.success('Size deleted successfully');
            loadSizes();
        } catch (error) {
            toast.error('Failed to delete size');
            console.error(error);
        }
    };

    const handleDownloadPatternBlock = async (filePath, fileName) => {
        try {
            const blob = await productService.downloadPatternBlock(filePath);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'pattern-block';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('File downloaded successfully');
        } catch (error) {
            toast.error('Failed to download file');
            console.error(error);
        }
    };

    const filtered = sizes.filter((size) =>
        [size.name, size.code].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-full p-4 md:p-6 lg:p-8 flex flex-col bg-[#F5F5F7] rounded-3xl border border-[#E5E5EA]">
            {/* Header */}
            <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E5EA] shadow-2xs w-fit mb-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Size Registry
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
                    Size Management
                </h1>
                <p className="text-sm text-[#86868B] mt-1">
                    Manage garment sizes with custom measurements and pattern blocks.
                </p>
            </div>

            {/* Search and Add Button */}
            <div className="flex items-center justify-between mb-6 gap-3">
                <div className="relative flex-1 max-w-xs">
                    <input
                        type="text"
                        placeholder="Search sizes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 rounded-full text-xs bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:bg-white focus:ring-2 focus:ring-blue-500/15 transition-all"
                    />
                </div>
                <button
                    onClick={() => {
                        setEditingSize(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#007AFF] text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                    <FiPlus size={16} /> Add Size
                </button>
            </div>

            {/* Sizes List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-white rounded-xl h-16" />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            No sizes found.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filtered.map((size) => {
                                const isExpanded = expandedId === size.id;
                                return (
                                    <div key={size.id} className="transition-colors hover:bg-slate-50">
                                        {/* Main Row */}
                                        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">
                                                    {size.name}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    Code: {size.code || '—'}
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                {size.measurements?.length || 0} measurement{
                                                    (size.measurements?.length || 0) !== 1 ? 's' : ''
                                                }
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                {size.patternBlockFilePath ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                                                        ✓ Pattern Block
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">No file</span>
                                                )}
                                            </div>
                                             <div className="flex items-center gap-2">
                                                 <button
                                                     onClick={() =>
                                                         setExpandedId(isExpanded ? null : size.id)
                                                     }
                                                     className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                                     title="Expand measurements"
                                                 >
                                                     <FiChevronDown
                                                         size={16}
                                                         className={`text-slate-600 transition-transform ${
                                                             isExpanded ? 'rotate-180' : ''
                                                         }`}
                                                     />
                                                 </button>
                                                 <button
                                                     onClick={() => handleEditSize(size)}
                                                     className="p-2 hover:bg-blue-50 text-slate-600 hover:text-[#007AFF] rounded-lg transition-colors cursor-pointer"
                                                     title="Edit size"
                                                 >
                                                     <FiEdit2 size={16} />
                                                 </button>
                                                 <button
                                                     onClick={() => handleDeleteSize(size.id)}
                                                     className="p-2 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                                     title="Delete size"
                                                 >
                                                     <FiTrash2 size={16} />
                                                 </button>
                                             </div>
                                        </div>

                                        {/* Expanded Measurements */}
                                        {isExpanded && (
                                            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200">
                                                {size.measurements && size.measurements.length > 0 ? (
                                                    <>
                                                        <div className="mb-4">
                                                            <h4 className="text-xs font-semibold text-slate-700 mb-3">
                                                                Measurements
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {size.measurements.map((measurement, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200"
                                                                    >
                                                                        <span className="text-sm font-medium text-slate-900">
                                                                            {measurement.topicName}
                                                                        </span>
                                                                        <span className="text-sm text-slate-600">
                                                                            {measurement.measurementValue}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {size.patternBlockFilePath && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDownloadPatternBlock(
                                                                        size.patternBlockFilePath,
                                                                        `${size.name}-pattern-block`
                                                                    )
                                                                }
                                                                className="flex items-center gap-2 text-xs font-semibold text-[#007AFF] hover:text-blue-700 transition-colors"
                                                            >
                                                                <FiDownload size={14} /> Download
                                                                Pattern Block
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-sm text-slate-500">
                                                        No measurements added yet.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AddSizeModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingSize(null);
                }}
                onSubmit={handleAddSize}
                editingSize={editingSize}
            />
        </div>
    );
};

export default SizeRegistry;
