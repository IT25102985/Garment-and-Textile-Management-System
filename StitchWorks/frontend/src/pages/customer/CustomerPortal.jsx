import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import salesService from '../../services/salesService';
import authService from '../../services/authService';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
    FiShoppingBag,
    FiPackage,
    FiFileText,
    FiUser,
    FiTruck,
    FiCreditCard,
    FiDownload,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiPlus,
    FiMinus,
    FiKey,
    FiInfo,
    FiXCircle
} from 'react-icons/fi';

// Status badge component
const StatusBadge = ({ status }) => {
    const s = (status || '').toUpperCase();
    let cls = 'bg-slate-100 text-slate-700 border-slate-200';
    let label = status;

    if (s === 'PENDING') {
        cls = 'bg-amber-50 text-amber-800 border-amber-200';
        label = 'Pending Review';
    } else if (s === 'PENDING_PRODUCTION') {
        cls = 'bg-orange-50 text-orange-700 border-orange-200';
        label = 'Production Scheduled';
    } else if (s === 'IN_PRODUCTION') {
        cls = 'bg-blue-50 text-[#007AFF] border-blue-200';
        label = 'In Production';
    } else if (s === 'READY_TO_DISPATCH') {
        cls = 'bg-cyan-50 text-cyan-700 border-cyan-200';
        label = 'Ready to Dispatch';
    } else if (s === 'DISPATCHED' || s === 'SHIPPED') {
        cls = 'bg-violet-50 text-violet-700 border-violet-200';
        label = 'Dispatched / In Transit';
    } else if (s === 'DELIVERED') {
        cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Delivered';
    } else if (s === 'CANCELLED') {
        cls = 'bg-red-50 text-red-600 border-red-200';
        label = 'Cancelled';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
            {label}
        </span>
    );
};

// Invoice status badge
const InvoiceBadge = ({ status }) => {
    const s = (status || '').toUpperCase();
    let cls = 'bg-red-50 text-red-700 border-red-200';
    let label = 'Unpaid';

    if (s === 'PAID') {
        cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Paid';
    } else if (s === 'PARTIALLY_PAID') {
        cls = 'bg-amber-50 text-amber-700 border-amber-200';
        label = 'Partially Paid';
    }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cls}`}>
            {label}
        </span>
    );
};

// Simulated Payment Modal
const PaymentModal = ({ show, onClose, invoice, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (invoice) {
            const remaining = Number(invoice.remainingAmount != null ? invoice.remainingAmount : (invoice.totalAmount - (invoice.paidAmount || 0)));
            setAmount(remaining > 0 ? remaining.toFixed(2) : '0.00');
            setCardHolder('');
            setCardNumber('');
            setExpiry('');
            setCvv('');
        }
    }, [invoice]);

    if (!show || !invoice) return null;

    const handleCardNumberChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (raw.length >= 3) {
            raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
        }
        setExpiry(raw);
    };

    const handleCvvChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
        setCvv(raw);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const remainingVal = Number(invoice.remainingAmount != null ? invoice.remainingAmount : (invoice.totalAmount - (invoice.paidAmount || 0)));
        const payVal = parseFloat(amount);

        // 1. Amount validation
        if (isNaN(payVal) || payVal <= 0) {
            toast.error('Please enter a valid positive payment amount.');
            return;
        }
        if (payVal > remainingVal + 0.01) {
            toast.error(`Payment amount cannot exceed remaining balance of Rs. ${remainingVal.toFixed(2)}.`);
            return;
        }

        // 2. Cardholder Name validation
        if (!cardHolder.trim() || cardHolder.trim().length < 3) {
            toast.error('Please enter a valid cardholder name (minimum 3 characters).');
            return;
        }

        // 3. Card Number validation
        const cleanCard = cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cleanCard)) {
            toast.error('Please enter a valid 16-digit card number.');
            return;
        }

        // 4. Expiry validation (MM/YY format & future date check)
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
            toast.error('Please enter expiry date in valid MM/YY format.');
            return;
        }

        const [expMonthStr, expYearStr] = expiry.split('/');
        const expMonth = parseInt(expMonthStr, 10);
        const expYear = 2000 + parseInt(expYearStr, 10);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            toast.error('Card expiry date has passed.');
            return;
        }

        // 5. CVV validation
        if (!/^\d{3,4}$/.test(cvv)) {
            toast.error('Please enter a valid 3 or 4 digit CVV code.');
            return;
        }

        setProcessing(true);
        try {
            await salesService.makePayment(invoice.id, { amount: payVal });
            toast.success(`Payment of Rs. ${payVal.toLocaleString('en-LK', { minimumFractionDigits: 2 })} processed!`);
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment simulation failed.');
        } finally {
            setProcessing(false);
        }
    };

    const remaining = Number(invoice.remainingAmount != null ? invoice.remainingAmount : (invoice.totalAmount - (invoice.paidAmount || 0)));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Make Secure Payment</h3>
                        <p className="text-xs text-slate-500">Invoice: {invoice.invoiceNumber}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
                        Due: Rs. {remaining.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                            Payment Amount (LKR) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            max={remaining}
                            min="1"
                            required
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                            Cardholder Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={cardHolder}
                            onChange={e => setCardHolder(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                            Card Number (Simulated) *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                maxLength="19"
                                required
                                placeholder="4111 2222 3333 4444"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] focus:bg-white"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                                <FiCreditCard />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                Expiry (MM/YY) *
                            </label>
                            <input
                                type="text"
                                maxLength="5"
                                required
                                placeholder="12/28"
                                value={expiry}
                                onChange={handleExpiryChange}
                                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                CVV *
                            </label>
                            <input
                                type="password"
                                maxLength="4"
                                required
                                placeholder="123"
                                value={cvv}
                                onChange={handleCvvChange}
                                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#007AFF] focus:bg-white"
                            />
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <FiInfo className="flex-shrink-0" />
                        This is an encrypted secure simulation. Card data is not permanently stored.
                    </p>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0062CC] shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? 'Processing...' : `Pay Rs. ${amount}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Customer Portal
const CustomerPortal = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('orders');

    // Orders state
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Invoices state
    const [invoices, setInvoices] = useState([]);
    const [invoicesLoading, setInvoicesLoading] = useState(false);

    // Catalog / Place order state
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [orderCart, setOrderCart] = useState([]);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryCity, setDeliveryCity] = useState('');
    const [placingOrder, setPlacingOrder] = useState(false);

    // Profile state
    const [profile, setProfile] = useState(null);
    const [profileName, setProfileName] = useState('');
    const [profilePhone, setProfilePhone] = useState('');
    const [profileAddress, setProfileAddress] = useState('');
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Password change in Profile
    const [newPassword, setNewPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Payment modal state
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);

    // Load orders
    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const data = await salesService.getMyOrders();
            const sorted = Array.isArray(data) ? [...data].sort((a, b) => b.id - a.id) : [];
            setOrders(sorted);
        } catch (err) {
            toast.error('Failed to load orders.');
        } finally {
            setOrdersLoading(false);
        }
    };

    // Load invoices
    const fetchInvoices = async () => {
        setInvoicesLoading(true);
        try {
            const data = await salesService.getMyInvoices();
            setInvoices(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error('Failed to load invoices.');
        } finally {
            setInvoicesLoading(false);
        }
    };

    // Load products
    const fetchProducts = async () => {
        setProductsLoading(true);
        try {
            const res = await api.get('/public/products');
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error('Failed to load catalog.');
        } finally {
            setProductsLoading(false);
        }
    };

    // Load profile
    const fetchProfile = async () => {
        try {
            const data = await salesService.getCustomerProfile();
            setProfile(data);
            setProfileName(data.name || '');
            setProfilePhone(data.phone || '');
            setProfileAddress(data.address || '');
            if (!deliveryAddress && data.address) setDeliveryAddress(data.address);
        } catch {}
    };

    useEffect(() => {
        fetchOrders();
        fetchInvoices();
        fetchProducts();
        fetchProfile();
    }, []);

    // Cart management
    const addToCart = (product, size = 'M', color = 'Standard') => {
        const existingIdx = orderCart.findIndex(
            item => item.productId === product.id && item.size === size && item.color === color
        );
        if (existingIdx > -1) {
            const updated = [...orderCart];
            updated[existingIdx].quantity += 1;
            setOrderCart(updated);
        } else {
            setOrderCart([
                ...orderCart,
                {
                    productId: product.id,
                    productName: product.name,
                    styleCode: product.styleCode,
                    unitPrice: product.basePrice,
                    quantity: 1,
                    size,
                    color
                }
            ]);
        }
        toast.info(`Added ${product.name} to order.`);
    };

    const updateCartQty = (idx, delta) => {
        const updated = [...orderCart];
        const newQty = updated[idx].quantity + delta;
        if (newQty <= 0) {
            setOrderCart(orderCart.filter((_, i) => i !== idx));
        } else {
            updated[idx].quantity = newQty;
            setOrderCart(updated);
        }
    };

    const setCartQtyDirect = (idx, val) => {
        const parsed = parseInt(val, 10);
        const updated = [...orderCart];
        if (isNaN(parsed) || parsed <= 0) {
            updated[idx].quantity = '';
        } else {
            updated[idx].quantity = parsed;
        }
        setOrderCart(updated);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (orderCart.length === 0) {
            toast.error('Your order cart is empty.');
            return;
        }

        setPlacingOrder(true);
        try {
            const payload = {
                deliveryAddress,
                deliveryCity,
                deliveryCountry: 'Sri Lanka',
                shippingMethod: 'STANDARD_COURIER',
                items: orderCart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    size: item.size,
                    color: item.color
                }))
            };

            await salesService.placeCustomerOrder(payload);
            toast.success('Garment order submitted successfully! An invoice has been generated.');
            setOrderCart([]);
            fetchOrders();
            fetchInvoices();
            setActiveTab('orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order.');
        } finally {
            setPlacingOrder(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        try {
            const updated = await salesService.updateCustomerProfile({
                name: profileName,
                phone: profilePhone,
                address: profileAddress
            });
            setProfile(updated);
            toast.success('Profile updated successfully.');
        } catch {
            toast.error('Failed to update profile.');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }
        setChangingPassword(true);
        try {
            await authService.changePassword(newPassword);
            toast.success('Password changed successfully.');
            setNewPassword('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await api.get(`/customer/invoices/${invoiceId}/download`, {
                responseType: 'blob'
            });
            const blob = new Blob([res.data], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${invoiceNumber}.html`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to download invoice.');
        }
    };

    const handleCancelMyOrder = async (order) => {
        if (!window.confirm(`Cancel order ${order.orderNumber}? This cannot be undone.`)) return;
        try {
            await salesService.cancelMyOrder(order.id);
            toast.success(`Order ${order.orderNumber} cancelled.`);
            fetchOrders();
            fetchInvoices();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to cancel order.';
            toast.error(msg);
        }
    };

    const cartTotal = orderCart.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        return sum + qty * item.unitPrice;
    }, 0);

    return (
        <div className="min-h-screen bg-[#F5F5F7] py-8 px-4 sm:px-6 lg:px-8">
            <PaymentModal
                show={showPayModal}
                invoice={selectedInvoice}
                onClose={() => {
                    setShowPayModal(false);
                    setSelectedInvoice(null);
                }}
                onSuccess={() => {
                    fetchInvoices();
                    fetchOrders();
                }}
            />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-2xl bg-[#007AFF] text-white flex items-center justify-center font-bold text-lg">
                                <FiShoppingBag />
                            </span>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">Customer Workspace</h1>
                                <p className="text-xs text-slate-500">
                                    Signed in as <span className="font-semibold text-slate-800">{user?.name}</span> ({user?.email})
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                            <FiCheckCircle /> Verified Customer Account
                        </span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                        >
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs gap-1 overflow-x-auto">
                    {[
                        { id: 'orders', label: 'My Orders & Tracking', icon: FiTruck, count: orders.length },
                        { id: 'invoices', label: 'Invoices & Payments', icon: FiFileText, count: invoices.length },
                        { id: 'catalog', label: 'Product Catalog & Order', icon: FiShoppingBag, count: products.length },
                        { id: 'profile', label: 'My Profile & Security', icon: FiUser }
                    ].map(t => {
                        const Icon = t.icon;
                        const active = activeTab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    active
                                        ? 'bg-[#1D1D1F] text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <Icon className="text-base" />
                                <span>{t.label}</span>
                                {t.count != null && (
                                    <span
                                        className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${
                                            active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {t.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── TAB 1: MY ORDERS & TRACKING ─────────────────────────────────── */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">My Placed Garment Orders</h2>
                                <p className="text-xs text-slate-500">Live order status and dispatch delivery tracking</p>
                            </div>
                            <button
                                onClick={fetchOrders}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#007AFF] hover:bg-blue-50 border border-blue-200 cursor-pointer"
                            >
                                Refresh Status
                            </button>
                        </div>

                        {ordersLoading ? (
                            <div className="text-center py-12 text-slate-400 text-sm">Loading your orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <FiShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-base font-semibold text-slate-700">No orders placed yet</p>
                                <p className="text-xs text-slate-400 mt-1">Browse our product catalog to place an order</p>
                                <button
                                    onClick={() => setActiveTab('catalog')}
                                    className="mt-4 px-5 py-2.5 rounded-xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-blue-600 cursor-pointer"
                                >
                                    Browse Catalog
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div
                                        key={order.id}
                                        className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-4"
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className="font-mono font-bold text-base text-slate-900">
                                                        {order.orderNumber}
                                                    </span>
                                                    <StatusBadge status={order.status} />
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Ordered on {order.orderDate} &bull; Expected Delivery: {order.deliveryDate || 'Standard delivery'}
                                                </p>
                                            </div>

                                            {/* Tracking Details */}
                                            <div className="flex items-center gap-2">
                                                {order.shipment ? (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-800 text-xs">
                                                        <FiTruck className="text-violet-600" />
                                                        <span>Tracking:</span>
                                                        <span className="font-mono font-bold">{order.shipment.trackingNumber}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                                                        Tracking: Awaiting Dispatch
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Items Table */}
                                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-2 bg-slate-100/70 text-[10px] font-bold uppercase text-slate-500">
                                                <span>Product</span>
                                                <span>Size / Color</span>
                                                <span>Unit Price</span>
                                                <span className="text-center">Qty</span>
                                                <span className="text-right">Line Total</span>
                                            </div>
                                            {(order.items || []).map(item => (
                                                <div
                                                    key={item.id}
                                                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 items-center border-t border-slate-100 text-xs"
                                                >
                                                    <span className="font-semibold text-slate-800 truncate">{item.productName}</span>
                                                    <span className="text-slate-500 text-[11px]">
                                                        {item.size || 'M'} / {item.color || 'Standard'}
                                                    </span>
                                                    <span className="font-mono text-slate-700">
                                                        Rs. {Number(item.unitPrice).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-center font-bold text-slate-800">{item.quantity}</span>
                                                    <span className="text-right font-mono font-bold text-slate-900">
                                                        Rs. {(item.quantity * item.unitPrice).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-t border-slate-200 gap-3">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="text-xs text-slate-500">
                                                        Address: {order.deliveryAddress || 'Standard customer delivery'}
                                                    </span>
                                                    {order.status !== 'CANCELLED' &&
                                                     order.status !== 'DELIVERED' &&
                                                     order.status !== 'DISPATCHED' &&
                                                     order.status !== 'SHIPPED' && (
                                                        <button
                                                            onClick={() => handleCancelMyOrder(order)}
                                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-semibold border border-red-200 cursor-pointer transition-colors"
                                                        >
                                                            <FiXCircle size={12} /> Cancel Order
                                                        </button>
                                                    )}
                                                </div>
                                                <span className="text-sm font-extrabold text-slate-900 whitespace-nowrap">
                                                    Total: Rs.{' '}
                                                    {(order.items || [])
                                                        .reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)
                                                        .toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 2: INVOICES & PAYMENTS ──────────────────────────────────── */}
                {activeTab === 'invoices' && (
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Billing & Payment Statements</h2>
                                <p className="text-xs text-slate-500">Download official invoices and complete online card payments</p>
                            </div>
                            <button
                                onClick={fetchInvoices}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#007AFF] hover:bg-blue-50 border border-blue-200 cursor-pointer"
                            >
                                Refresh Invoices
                            </button>
                        </div>

                        {invoicesLoading ? (
                            <div className="text-center py-12 text-slate-400 text-sm">Loading billing statements...</div>
                        ) : invoices.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <FiFileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-base font-semibold text-slate-700">No invoices available</p>
                                <p className="text-xs text-slate-400 mt-1">Invoices are generated upon order placement</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                                            <th className="py-3 px-4">Invoice #</th>
                                            <th className="py-3 px-4">Order #</th>
                                            <th className="py-3 px-4">Due Date</th>
                                            <th className="py-3 px-4 text-right">Total Amount</th>
                                            <th className="py-3 px-4 text-right">Paid Amount</th>
                                            <th className="py-3 px-4 text-right">Balance Due</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {invoices.map(inv => {
                                            const paid = Number(inv.paidAmount || 0);
                                            const total = Number(inv.totalAmount || 0);
                                            const remaining = Number(inv.remainingAmount != null ? inv.remainingAmount : Math.max(0, total - paid));
                                            const isPaid = inv.status === 'PAID' || remaining <= 0;

                                            return (
                                                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                                        {inv.invoiceNumber}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono text-slate-600">
                                                        {inv.orderNumber || `Order #${inv.orderId}`}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-600">
                                                        {inv.dueDate || 'Upon receipt'}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                                                        Rs. {total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-semibold">
                                                        Rs. {paid.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                                                        Rs. {remaining.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <InvoiceBadge status={inv.status} />
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <button
                                                                onClick={() => handleDownloadInvoice(inv.id, inv.invoiceNumber)}
                                                                title="Download HTML Invoice"
                                                                className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 cursor-pointer transition-colors"
                                                            >
                                                                <FiDownload size={14} />
                                                            </button>
                                                            {!isPaid && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedInvoice(inv);
                                                                        setShowPayModal(true);
                                                                    }}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white font-semibold cursor-pointer shadow-2xs transition-colors"
                                                                >
                                                                    <FiCreditCard size={12} /> Pay Now
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 3: PRODUCT CATALOG & PLACE ORDER ────────────────────────── */}
                {activeTab === 'catalog' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Products List */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Finished Garments Catalog</h2>
                                <p className="text-xs text-slate-500">Select finished garments to place a direct production order</p>
                            </div>

                            {productsLoading ? (
                                <div className="text-center py-12 text-slate-400 text-sm">Loading garment catalog...</div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">No published garments found.</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {products.map(p => (
                                        <div
                                            key={p.id}
                                            className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-sm transition-all bg-white overflow-hidden"
                                        >
                                            <div>
                                                {/* Image / Thumbnail Container */}
                                                <div className="w-full h-36 bg-slate-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center border border-slate-100">
                                                    {p.imageUrl ? (
                                                        <img
                                                            src={p.imageUrl}
                                                            alt={p.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                                            <FiPackage size={32} />
                                                            <span className="text-[10px] mt-1 font-semibold text-slate-400">No Image Available</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                                            {p.styleCode}
                                                        </span>
                                                        <h3 className="text-sm font-bold text-slate-900 mt-1">{p.name}</h3>
                                                    </div>
                                                    <span className="text-sm font-extrabold text-[#007AFF] font-mono">
                                                        Rs. {Number(p.basePrice).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                                    {p.description || 'Premium export quality garment manufactured by StitchWorks.'}
                                                </p>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[11px] text-slate-400 font-medium">Standard Sizes (S, M, L, XL)</span>
                                                <button
                                                    onClick={() => addToCart(p)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold cursor-pointer transition-colors"
                                                >
                                                    <FiPlus size={14} /> Add to Order
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Order Cart Sidebar */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs h-fit space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <FiShoppingBag className="text-[#007AFF]" /> Order Summary
                                </h3>
                                <span className="text-xs font-bold text-slate-500">
                                    {orderCart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)} Items
                                </span>
                            </div>

                            {orderCart.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs">
                                    Select items from the catalog to prepare your purchase order.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orderCart.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate">{item.productName}</p>
                                                <p className="text-[11px] font-mono text-slate-500">
                                                    Rs. {item.unitPrice} &bull; Size {item.size}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => updateCartQty(idx, -1)}
                                                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
                                                >
                                                    <FiMinus size={11} />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => setCartQtyDirect(idx, e.target.value)}
                                                    onBlur={() => {
                                                        if (!item.quantity || item.quantity <= 0) {
                                                            const updated = [...orderCart];
                                                            updated[idx].quantity = 1;
                                                            setOrderCart(updated);
                                                        }
                                                    }}
                                                    className="w-12 h-7 text-center font-bold text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => updateCartQty(idx, 1)}
                                                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
                                                >
                                                    <FiPlus size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-3 border-t border-slate-100 space-y-2">
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Subtotal</span>
                                            <span className="font-mono">
                                                Rs. {cartTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1">
                                            <span>Estimated Total</span>
                                            <span className="font-mono text-[#007AFF]">
                                                Rs. {cartTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Checkout form */}
                                    <form onSubmit={handlePlaceOrder} className="pt-3 space-y-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                Delivery Address *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Street address / Factory warehouse"
                                                value={deliveryAddress}
                                                onChange={e => setDeliveryAddress(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#007AFF] focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                City / Postal Area
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Colombo 03"
                                                value={deliveryCity}
                                                onChange={e => setDeliveryCity(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#007AFF] focus:bg-white"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={placingOrder}
                                            className="w-full py-3 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            {placingOrder ? 'Confirming Order...' : 'Submit Garment Order'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB 4: MY PROFILE & SECURITY ────────────────────────────────── */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Info Form */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Customer Profile Details</h2>
                                <p className="text-xs text-slate-500">Keep your billing and delivery information up to date</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                        Company / Customer Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={profileName}
                                        onChange={e => setProfileName(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#007AFF] focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={profilePhone}
                                        onChange={e => setProfilePhone(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#007AFF] focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                        Default Delivery / Billing Address
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={profileAddress}
                                        onChange={e => setProfileAddress(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#007AFF] focus:bg-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={updatingProfile}
                                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0062CC] disabled:opacity-50 cursor-pointer"
                                >
                                    {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
                                </button>
                            </form>
                        </div>

                        {/* Security & Password Form */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <FiKey className="text-[#007AFF]" /> Account Security
                                </h2>
                                <p className="text-xs text-slate-500">Update your account login password</p>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                        New Password *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="At least 6 characters"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#007AFF] focus:bg-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#1D1D1F] hover:bg-black disabled:opacity-50 cursor-pointer"
                                >
                                    {changingPassword ? 'Updating Password...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerPortal;
