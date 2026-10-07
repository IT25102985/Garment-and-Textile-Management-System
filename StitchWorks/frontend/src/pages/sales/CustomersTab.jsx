import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiPlus, FiEdit2, FiUser, FiMail, FiPhone, FiMapPin, FiTag, FiKey, FiCopy, FiCheck, FiPower, FiTrash2 } from 'react-icons/fi';
import salesService from '../../services/salesService';

const EMPTY_FORM = { name: '', brand: '', contactPerson: '', email: '', phone: '', address: '' };

const InputField = ({ label, icon: Icon, ...props }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
        <div className="relative">
            {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
            <input
                {...props}
                className={`w-full ${Icon ? 'pl-9' : 'pl-3.5'} pr-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all`}
            />
        </div>
    </div>
);

const TempPasswordModal = ({ data, onClose }) => {
    const [copied, setCopied] = useState(false);
    if (!data) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(data.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        toast.success('Temporary password copied to clipboard');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative flex flex-col w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <FiKey size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Customer Account Created</h3>
                        <p className="text-xs text-slate-400">Account login credentials generated</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200/80 text-xs">
                    <div>
                        <span className="text-slate-400">Customer: </span>
                        <strong className="text-slate-800">{data.name}</strong>
                    </div>
                    <div>
                        <span className="text-slate-400">Login Email: </span>
                        <strong className="text-slate-800">{data.email}</strong>
                    </div>
                    <div className="pt-2">
                        <span className="text-slate-500 block mb-1 font-semibold">Temporary Password:</span>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-300 font-mono text-sm text-slate-900 font-bold">
                            <span>{data.password}</span>
                            <button
                                type="button"
                                onClick={copyToClipboard}
                                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                            >
                                {copied ? <FiCheck size={14} className="text-emerald-600" /> : <FiCopy size={14} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
                    <strong>Important:</strong> Please share this temporary password with the customer. For security, it will only be displayed once.
                </p>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#007AFF] hover:bg-blue-600 text-white cursor-pointer transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

const CustomerModal = ({ show, customer, onClose, onSaved }) => {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setFormData(customer ? { ...customer } : EMPTY_FORM);
    }, [customer, show]);

    if (!show) return null;

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (customer) {
                await salesService.updateCustomer(customer.id, formData);
                toast.success('Customer updated');
                onSaved(null);
            } else {
                const res = await salesService.createCustomer(formData);
                toast.success('Customer created');
                onSaved({
                    name: res.name || formData.name,
                    email: res.email || formData.email,
                    password: res.temporaryPassword
                });
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to save customer';
            toast.error(typeof msg === 'string' ? msg : 'A customer account with this email already exists.');
        } finally {
            setSaving(false);
        }
    };

    const set = (key) => (e) => setFormData(f => ({ ...f, [key]: e.target.value }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative flex flex-col w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-10">
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0 bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{customer ? 'Edit Customer' : 'New Customer'}</h2>
                        <p className="text-xs text-slate-400 mt-1">{customer ? `Editing ${customer.name}` : 'Add a new customer to the register'}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors text-lg cursor-pointer">&times;</button>
                </div>
                <form id="customerForm" onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Customer Name *" icon={FiUser} required value={formData.name} onChange={set('name')} placeholder="e.g. Acme Garments" />
                        <InputField label="Brand" icon={FiTag} value={formData.brand} onChange={set('brand')} placeholder="e.g. AceWear" />
                    </div>
                    <InputField label="Contact Person" icon={FiUser} value={formData.contactPerson} onChange={set('contactPerson')} placeholder="e.g. Kamal Perera" />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Email *" icon={FiMail} type="email" required value={formData.email} onChange={set('email')} placeholder="email@company.com" />
                        <InputField label="Phone (+94)" icon={FiPhone} value={formData.phone} onChange={set('phone')} placeholder="077 000 0000" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
                        <div className="relative">
                            <FiMapPin size={14} className="absolute left-3.5 top-3 text-slate-400" />
                            <textarea value={formData.address} onChange={set('address')} rows={2} placeholder="Street, City, Postal Code" className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all resize-none" />
                        </div>
                    </div>
                </form>
                <div className="flex items-center justify-end gap-3 p-6 shrink-0 border-t border-gray-100 bg-white">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
                    <button type="submit" form="customerForm" disabled={saving} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#007AFF] hover:bg-blue-600 text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50">
                        {saving ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CustomersTab = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [tempCreds, setTempCreds] = useState(null);

    const load = async () => {
        setLoading(true);
        try { setCustomers(await salesService.getAllCustomers()); }
        catch { toast.error('Failed to load customers'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const filtered = customers.filter(c =>
        [c.name, c.brand, c.contactPerson, c.email, c.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    );

    const openModal = (customer = null) => { setEditing(customer); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditing(null); };

    const onSaved = (credentials) => {
        closeModal();
        load();
        if (credentials && credentials.password) {
            setTempCreds(credentials);
        }
    };

    const handleToggleStatus = async (id, currentActive) => {
        try {
            await salesService.toggleCustomerStatus(id);
            toast.success(currentActive ? 'Customer account deactivated' : 'Customer account activated');
            load();
        } catch {
            toast.error('Failed to update customer status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove or deactivate this customer?')) return;
        try {
            await salesService.deleteCustomer(id);
            toast.success('Customer processed successfully');
            load();
        } catch {
            toast.error('Failed to process customer');
        }
    };

    const initials = (name) => name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

    return (
        <>
            <CustomerModal show={modalOpen} customer={editing} onClose={closeModal} onSaved={onSaved} />
            <TempPasswordModal data={tempCreds} onClose={() => setTempCreds(null)} />

            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                <div className="relative">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-full text-xs bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:bg-white focus:ring-2 focus:ring-blue-500/15 transition-all w-56"
                    />
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer">
                    <FiPlus size={15} /> Add Customer
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-36" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                    <FiUser size={36} className="opacity-30" />
                    <p className="text-sm font-semibold">No customers found</p>
                    <p className="text-xs">Add your first customer to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(c => {
                        const isActive = c.active !== false;
                        return (
                            <div key={c.id} className={`relative bg-white rounded-2xl border ${isActive ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'} shadow-sm p-5 hover:shadow-md hover:border-blue-300/50 transition-all group`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-10 h-10 rounded-full ${isActive ? 'bg-blue-50 text-[#007AFF] border-blue-100' : 'bg-slate-100 text-slate-400 border-slate-200'} font-bold flex items-center justify-center text-sm border shrink-0`}>
                                            {initials(c.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm text-slate-900 truncate">{c.name}</h4>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                    {isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            {c.brand && <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 mt-0.5">{c.brand}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            title={isActive ? 'Deactivate customer' : 'Activate customer'}
                                            onClick={() => handleToggleStatus(c.id, isActive)}
                                            className={`w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer ${isActive ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                        >
                                            <FiPower size={13} />
                                        </button>
                                        <button
                                            title="Edit details"
                                            onClick={() => openModal(c)}
                                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-50 text-slate-400 hover:text-[#007AFF] transition-all cursor-pointer"
                                        >
                                            <FiEdit2 size={13} />
                                        </button>
                                        <button
                                            title="Delete / Deactivate"
                                            onClick={() => handleDelete(c.id)}
                                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                                        >
                                            <FiTrash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-xs text-slate-500">
                                    {c.contactPerson && <div className="flex items-center gap-2"><FiUser size={12} className="shrink-0 text-slate-300" /><span className="truncate">{c.contactPerson}</span></div>}
                                    {c.email && <div className="flex items-center gap-2"><FiMail size={12} className="shrink-0 text-slate-300" /><span className="truncate font-mono">{c.email}</span></div>}
                                    {c.phone && <div className="flex items-center gap-2"><FiPhone size={12} className="shrink-0 text-slate-300" /><span>{c.phone}</span></div>}
                                    {c.address && <div className="flex items-start gap-2"><FiMapPin size={12} className="shrink-0 text-slate-300 mt-0.5" /><span className="line-clamp-2">{c.address}</span></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default CustomersTab;
