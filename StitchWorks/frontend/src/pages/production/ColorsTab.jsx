import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiSearch, FiCopy } from 'react-icons/fi';
import { IoColorPaletteOutline } from 'react-icons/io5';
import productService from '../../services/productService';

const PRESET_COLORS = [
    { name: 'Pitch Black', hex: '#111827' },
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Navy Blue', hex: '#1E3A8A' },
    { name: 'Charcoal Grey', hex: '#334155' },
    { name: 'Heather Grey', hex: '#94A3B8' },
    { name: 'Crimson Red', hex: '#DC2626' },
    { name: 'Forest Green', hex: '#15803D' },
    { name: 'Olive Green', hex: '#4D7C0F' },
    { name: 'Royal Blue', hex: '#2563EB' },
    { name: 'Beige Khaki', hex: '#D4C5B9' },
    { name: 'Mustard Yellow', hex: '#CA8A04' },
    { name: 'Dusty Rose', hex: '#E11D48' },
];

const KNOWN_COLOR_MAP = {
    black: '#111827',
    white: '#FFFFFF',
    blue: '#2563EB',
    navy: '#0F172A',
    'navy blue': '#1E3A8A',
    red: '#EF4444',
    crimson: '#DC2626',
    maroon: '#881337',
    green: '#16A34A',
    'forest green': '#15803D',
    olive: '#65A30D',
    yellow: '#EAB308',
    mustard: '#CA8A04',
    orange: '#F97316',
    purple: '#9333EA',
    pink: '#EC4899',
    rose: '#F43F5E',
    grey: '#64748B',
    gray: '#64748B',
    charcoal: '#334155',
    'heather grey': '#94A3B8',
    beige: '#F5F5DC',
    khaki: '#C3B091',
    brown: '#78350F',
    cyan: '#06B6D4',
    teal: '#0D9488',
    lavender: '#C084FC',
    coral: '#FB7185',
};

const resolveColorHex = (color) => {
    if (color?.hexCode && color.hexCode.trim()) {
        const hex = color.hexCode.trim();
        return hex.startsWith('#') ? hex : `#${hex}`;
    }
    const cleanName = color?.name?.toLowerCase().trim() || '';
    if (cleanName.startsWith('#') && (cleanName.length === 4 || cleanName.length === 7)) {
        return cleanName;
    }
    if (KNOWN_COLOR_MAP[cleanName]) {
        return KNOWN_COLOR_MAP[cleanName];
    }
    return '#3B82F6';
};

const ColorsTab = () => {
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Add state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newHex, setNewHex] = useState('#2563EB');
    const [saving, setSaving] = useState(false);

    // Edit Modal state
    const [editingColor, setEditingColor] = useState(null);
    const [editName, setEditName] = useState('');
    const [editHex, setEditHex] = useState('#2563EB');

    const loadColors = async () => {
        setLoading(true);
        try {
            const data = await productService.getAllColors();
            setColors(data || []);
        } catch {
            toast.error('Failed to load colors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadColors();
    }, []);

    const handleCreate = async (e) => {
        e?.preventDefault();
        if (!newName.trim()) {
            toast.warning('Please enter a color name');
            return;
        }

        setSaving(true);
        try {
            const formattedHex = newHex.startsWith('#') ? newHex : `#${newHex}`;
            await productService.createColor({
                name: newName.trim(),
                hexCode: formattedHex
            });
            toast.success('Color swatch added successfully!');
            setNewName('');
            setNewHex('#2563EB');
            setShowAddForm(false);
            loadColors();
        } catch {
            toast.error('Failed to add color');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e) => {
        e?.preventDefault();
        if (!editingColor) return;
        if (!editName.trim()) {
            toast.warning('Color name cannot be empty');
            return;
        }

        setSaving(true);
        try {
            const formattedHex = editHex.startsWith('#') ? editHex : `#${editHex}`;
            await productService.updateColor(editingColor.id, {
                name: editName.trim(),
                hexCode: formattedHex
            });
            toast.success('Color updated successfully!');
            setEditingColor(null);
            loadColors();
        } catch {
            toast.error('Failed to update color');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this color?')) return;
        try {
            await productService.deleteColor(id);
            toast.success('Color deleted successfully');
            loadColors();
        } catch {
            toast.error('Failed to delete color');
        }
    };

    const handleCopyHex = (e, hex) => {
        e.stopPropagation();
        navigator.clipboard.writeText(hex);
        toast.info(`Copied ${hex} to clipboard!`, { autoClose: 1500 });
    };

    const startEdit = (color) => {
        setEditingColor(color);
        setEditName(color.name || '');
        setEditHex(resolveColorHex(color));
    };

    const filteredColors = colors.filter(c => 
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.hexCode || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search colors or hex code..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 shadow-2xs transition-all"
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl shrink-0">
                        {colors.length} {colors.length === 1 ? 'Color' : 'Colors'}
                    </span>
                </div>

                <button
                    onClick={() => { setShowAddForm(!showAddForm); setEditingColor(null); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer shrink-0"
                >
                    {showAddForm ? <FiX size={16} /> : <FiPlus size={16} />}
                    <span>{showAddForm ? 'Close Swatch Form' : 'Add New Color'}</span>
                </button>
            </div>

            {/* New Color Creation Panel */}
            {showAddForm && (
                <div className="bg-white rounded-2xl border border-blue-100 p-5 sm:p-6 shadow-sm shadow-blue-500/5 transition-all">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Add New Fabric & Garment Color</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Pick a color code and give it an apparel name</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Interactive Color Square Swatch */}
                            <div className="relative group">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                    Swatch
                                </label>
                                <div className="relative w-12 h-12 rounded-xl shadow-xs border-2 border-slate-200 overflow-hidden cursor-pointer flex items-center justify-center transition-transform hover:scale-105">
                                    <div 
                                        className="w-full h-full"
                                        style={{ backgroundColor: newHex }}
                                    />
                                    <input
                                        type="color"
                                        value={newHex}
                                        onChange={e => setNewHex(e.target.value.toUpperCase())}
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                        title="Click to pick color"
                                    />
                                </div>
                            </div>

                            {/* Color Hex Code Input */}
                            <div className="w-36">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                    Color Code
                                </label>
                                <input
                                    type="text"
                                    value={newHex}
                                    onChange={e => setNewHex(e.target.value)}
                                    placeholder="#000000"
                                    maxLength={7}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold text-slate-900 uppercase focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                                />
                            </div>

                            {/* Color Name Input */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                    Color Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Royal Blue, Crimson Red, Heather Grey..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                                />
                            </div>

                            {/* Action Submit */}
                            <div className="flex items-center gap-2 pt-5">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    <FiCheck size={15} />
                                    <span>{saving ? 'Adding...' : 'Save Color'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                Quick Presets
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_COLORS.map(preset => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => {
                                            setNewName(preset.name);
                                            setNewHex(preset.hex);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-300 hover:shadow-2xs transition-all text-xs font-medium text-slate-700 cursor-pointer"
                                    >
                                        <span 
                                            className="w-3 h-3 rounded-full border border-black/10 shrink-0" 
                                            style={{ backgroundColor: preset.hex }} 
                                        />
                                        <span className="text-[11px]">{preset.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Colors Swatches Grid (Pantone & Studio Swatch Cards) */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden animate-pulse flex flex-col h-44">
                            <div className="h-28 bg-slate-100 w-full" />
                            <div className="p-4 space-y-2">
                                <div className="w-28 h-4 rounded bg-slate-100" />
                                <div className="w-16 h-3 rounded bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredColors.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <IoColorPaletteOutline size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No Colors Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mb-4">
                        {search ? 'No color swatches match your search term.' : 'Start adding color codes to manage garment shade palettes.'}
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                        <FiPlus size={14} /> Add First Color
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredColors.map(color => {
                        const hex = resolveColorHex(color);

                        return (
                            <div
                                key={color.id}
                                className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
                            >
                                {/* Top Studio Swatch Preview */}
                                <div 
                                    className="h-28 w-full relative transition-transform duration-300 flex items-end justify-between p-3"
                                    style={{ backgroundColor: hex }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                                    {/* Monospace Hex Badge */}
                                    <div className="relative z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-white shadow-xs">
                                        <span className="font-mono text-xs font-bold tracking-wider">{hex}</span>
                                        <button 
                                            onClick={(e) => handleCopyHex(e, hex)}
                                            className="text-white/80 hover:text-white transition-colors cursor-pointer p-0.5"
                                            title="Copy Hex Code"
                                        >
                                            <FiCopy size={12} />
                                        </button>
                                    </div>

                                    {/* Action Buttons Floating on Swatch */}
                                    <div className="relative z-10 flex items-center gap-1.5">
                                        <button
                                            onClick={() => startEdit(color)}
                                            className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                                            title="Edit Color"
                                        >
                                            <FiEdit2 size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(color.id)}
                                            className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-red-600 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                                            title="Delete Color"
                                        >
                                            <FiTrash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Bottom Info Bar - Full unconstrained name */}
                                <div className="p-3.5 bg-white flex items-center justify-between gap-2.5">
                                    <div className="min-w-0 flex-1">
                                        <h4 
                                            className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug break-words"
                                            title={color.name || 'Unnamed Color'}
                                        >
                                            {color.name || 'Unnamed Color'}
                                        </h4>
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                                            Garment Swatch
                                        </span>
                                    </div>

                                    {/* Mini circular swatch dot */}
                                    <div 
                                        className="w-5 h-5 rounded-full border-2 border-white shadow-xs shrink-0 ring-1 ring-slate-200"
                                        style={{ backgroundColor: hex }}
                                        title={color.name}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* EDIT COLOR MODAL (Rendered in Portal with z-[9999], compact & completely contained) */}
            {editingColor && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
                    onClick={() => setEditingColor(null)}
                >
                    <div 
                        className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden my-auto flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                    Edit Color Swatch
                                </span>
                                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                                    Modify {editingColor.name || 'Color'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setEditingColor(null)}
                                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Modal Body Form */}
                        <form onSubmit={handleUpdate}>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3.5">
                                    {/* Swatch Picker */}
                                    <div className="relative group shrink-0">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Swatch
                                        </label>
                                        <div className="relative w-12 h-12 rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden cursor-pointer flex items-center justify-center transition-transform hover:scale-105">
                                            <div 
                                                className="w-full h-full"
                                                style={{ backgroundColor: editHex }}
                                            />
                                            <input
                                                type="color"
                                                value={editHex}
                                                onChange={e => setEditHex(e.target.value.toUpperCase())}
                                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                                title="Click to pick color"
                                            />
                                        </div>
                                    </div>

                                    {/* Hex Code Input */}
                                    <div className="w-28 shrink-0">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Hex Code
                                        </label>
                                        <input
                                            type="text"
                                            value={editHex}
                                            onChange={e => setEditHex(e.target.value)}
                                            placeholder="#000000"
                                            maxLength={7}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold text-slate-900 uppercase focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                                        />
                                    </div>

                                    {/* Color Name Input */}
                                    <div className="flex-1 min-w-[130px]">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Color Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            placeholder="e.g. Royal Blue"
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                                        />
                                    </div>
                                </div>

                                {/* Preset swatches for quick adjustment */}
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Palette Presets
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PRESET_COLORS.map(preset => (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                onClick={() => {
                                                    setEditName(preset.name);
                                                    setEditHex(preset.hex);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all text-xs font-medium text-slate-700 cursor-pointer"
                                            >
                                                <span 
                                                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" 
                                                    style={{ backgroundColor: preset.hex }} 
                                                />
                                                <span className="text-[11px]">{preset.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setEditingColor(null)}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <FiCheck size={15} />
                                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ColorsTab;
