import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

/**
 * Reusable Apple-style inline CRUD table for simple name-only entities.
 * Props: label, items, onAdd(name), onUpdate(id, name), onDelete(id), allowEdit, allowDelete
 */
const InlineCrudTable = ({ 
    label, 
    items = [], 
    onAdd, 
    onUpdate, 
    onDelete, 
    allowEdit = true, 
    allowDelete = true, 
    accentClass = 'bg-blue-50 text-[#007AFF] border-blue-100' 
}) => {
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        try { await onAdd(newName.trim()); setNewName(''); setAdding(false); }
        catch { toast.error('Failed to add'); }
        finally { setSaving(false); }
    };

    const handleUpdate = async (id) => {
        if (!editName.trim()) return;
        setSaving(true);
        try { await onUpdate(id, editName.trim()); setEditId(null); }
        catch { toast.error('Failed to update'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Delete this ${label}?`)) return;
        try { await onDelete(id); }
        catch { toast.error('Failed to delete'); }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">{label} Registry</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{items.length} {label.toLowerCase()}(s) configured</p>
                </div>
                <button
                    onClick={() => { setAdding(true); setEditId(null); }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                    <FiPlus size={13} /> Add {label}
                </button>
            </div>

            {/* Add row */}
            {adding && (
                <div className="flex items-center gap-3 px-5 py-3 bg-blue-50/50 border-b border-blue-100">
                    <input
                        autoFocus
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        placeholder={`New ${label} name...`}
                        className="flex-1 px-3.5 py-2 rounded-xl text-sm bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 transition-all"
                    />
                    <button onClick={handleAdd} disabled={saving} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#007AFF] text-white hover:bg-blue-600 transition-colors cursor-pointer">
                        <FiCheck size={14} />
                    </button>
                    <button onClick={() => { setAdding(false); setNewName(''); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                        <FiX size={14} />
                    </button>
                </div>
            )}

            {/* Items */}
            {items.length === 0 && !adding ? (
                <div className="text-center py-12 text-slate-400 text-sm">No {label.toLowerCase()}s added yet.</div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 group transition-colors">
                            {allowEdit && editId === item.id ? (
                                <div className="flex items-center gap-3 flex-1 mr-3">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleUpdate(item.id); if (e.key === 'Escape') setEditId(null); }}
                                        className="flex-1 px-3 py-1.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 transition-all"
                                    />
                                    <button onClick={() => handleUpdate(item.id)} className="w-7 h-7 flex items-center justify-center rounded-full bg-[#007AFF] text-white hover:bg-blue-600 transition-colors cursor-pointer"><FiCheck size={13} /></button>
                                    <button onClick={() => setEditId(null)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"><FiX size={13} /></button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-2 h-2 rounded-full ${accentClass.includes('bg-') ? accentClass.split(' ')[0] : 'bg-blue-500'}`} />
                                    <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                                </div>
                                    {(allowEdit || allowDelete) && (
                                        <div className="flex gap-1 shrink-0">
                                            {allowEdit && (
                                                <button onClick={() => { setEditId(item.id); setEditName(item.name); setAdding(false); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-[#007AFF] transition-all cursor-pointer" title="Edit"><FiEdit2 size={13} /></button>
                                            )}
                                            {allowDelete && (
                                                <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all cursor-pointer" title="Delete"><FiTrash2 size={13} /></button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InlineCrudTable;
