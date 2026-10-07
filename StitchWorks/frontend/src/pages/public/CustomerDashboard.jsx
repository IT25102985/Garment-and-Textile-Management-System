import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';

const CustomerDashboard = () => {
    const { addToCart } = useCart();
    const [activeTab, setActiveTab] = useState('collection'); // 'collection' or 'orders'
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    
    // For Modal
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState('M');
    const [color, setColor] = useState('Black');
    
    // Quote form state
    const [materials, setMaterials] = useState([]);
    const [quoteForm, setQuoteForm] = useState({ materialId: '', quantity: '', message: '' });

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchMaterials();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/public/orders/my');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/public/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMaterials = async () => {
        try {
            const res = await api.get('/public/materials');
            setMaterials(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddToCart = () => {
        if (!selectedProduct) return;
        if (quantity < 1) return toast.error("Quantity must be at least 1");
        
        addToCart({
            productId: selectedProduct.id,
            name: selectedProduct.name,
            styleCode: selectedProduct.styleCode,
            imageUrl: selectedProduct.imageUrl,
            price: selectedProduct.basePrice,
            quantity: quantity,
            size: size,
            color: color
        });
        
        toast.success('Item added to cart');
        setSelectedProduct(null);
        setQuantity(1);
        setSize('M');
        setColor('Black');
    };

    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/public/quote-requests', quoteForm);
            toast.success('Quote request submitted');
            setQuoteForm({ materialId: '', quantity: '', message: '' });
        } catch (err) {
            toast.error('Failed to submit quote request');
        }
    };

    const openModal = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setSize('M');
        setColor('Black');
    };

    return (
        <div className="container px-4 py-6" style={{ color: 'var(--text-color)', position: 'relative' }}>
            <h1 className="text-2xl sm:text-3xl font-bold mb-5">Customer Dashboard</h1>
            
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <button
                    onClick={() => setActiveTab('collection')}
                    className="px-4 py-2.5 text-sm font-medium cursor-pointer bg-transparent border-none transition-colors"
                    style={{
                        borderBottom: activeTab === 'collection' ? '2px solid var(--primary-color)' : '2px solid transparent',
                        fontWeight: activeTab === 'collection' ? 'bold' : 'normal',
                        color: 'var(--text-color)'
                    }}
                >
                    Garment Collection
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className="px-4 py-2.5 text-sm font-medium cursor-pointer bg-transparent border-none transition-colors"
                    style={{
                        borderBottom: activeTab === 'orders' ? '2px solid var(--primary-color)' : '2px solid transparent',
                        fontWeight: activeTab === 'orders' ? 'bold' : 'normal',
                        color: 'var(--text-color)'
                    }}
                >
                    My Orders
                </button>
            </div>

            {/* Product Grid Tab */}
            {activeTab === 'collection' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                >
                    {products.map((product, idx) => (
                        <motion.div
                            key={product.id}
                            className="glass-card product-card flex flex-col cursor-pointer"
                            whileHover={{ y: -5 }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{ padding: '15px' }}
                            onClick={() => openModal(product)}
                        >
                            <div className="relative w-full h-56 rounded-xl overflow-hidden mb-3" style={{ backgroundColor: '#e0e0e0' }}>
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x400?text=StitchWorks+Garment"; }}
                                />
                                <div className="absolute top-2 right-2 bg-white/80 text-black text-xs font-bold px-2.5 py-1 rounded-full">
                                    {product.category}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-main)' }}>{product.name}</h4>
                                <p className="text-xs" style={{ color: 'var(--text-color)', opacity: 0.8 }}>{product.styleCode}</p>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                <span className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>${parseFloat(product.basePrice).toFixed(2)}</span>
                                <button className="btn btn-sm btn-outline text-xs" onClick={(e) => { e.stopPropagation(); openModal(product); }}>View &amp; Order</button>
                            </div>
                        </motion.div>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full text-center py-16 text-gray-400">No garments available at the moment.</div>
                    )}
                </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <div className="glass-card p-5 mb-6 rounded-xl overflow-x-auto">
                        <h2 className="text-lg font-bold mb-4">My Orders</h2>
                        <table className="table w-full min-w-[480px]">
                            <thead>
                                <tr>
                                    <th>Order No</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td>{o.orderNumber}</td>
                                        <td>{o.orderDate}</td>
                                        <td>
                                            <span style={{
                                                padding: '5px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                backgroundColor: o.status === 'PENDING' ? '#fff3cd' : o.status === 'IN_PRODUCTION' ? '#cce5ff' : '#d4edda',
                                                color: o.status === 'PENDING' ? '#856404' : o.status === 'IN_PRODUCTION' ? '#004085' : '#155724'
                                            }}>
                                                {o.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && <tr><td colSpan="3" className="text-center py-8">No orders found</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    <div className="glass-card p-5 rounded-xl">
                        <h2 className="text-lg font-bold mb-4">Custom Material Quote Request</h2>
                        <form onSubmit={handleQuoteSubmit}>
                            <div className="form-group mb-4">
                                <label className="block mb-1 text-sm font-medium">Material</label>
                                <select className="form-control w-full" value={quoteForm.materialId} onChange={(e) => setQuoteForm({...quoteForm, materialId: e.target.value})} required style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
                                    <option value="">Select a material</option>
                                    {materials.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group mb-4">
                                <label className="block mb-1 text-sm font-medium">Quantity</label>
                                <input type="number" className="form-control w-full" value={quoteForm.quantity} onChange={(e) => setQuoteForm({...quoteForm, quantity: e.target.value})} required style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                            </div>
                            <div className="form-group mb-4">
                                <label className="block mb-1 text-sm font-medium">Message</label>
                                <textarea className="form-control w-full" value={quoteForm.message} onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})} required style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-full sm:w-auto">Submit Request</button>
                        </form>
                    </div>
                </motion.div>
            )}

            {/* Product Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center z-[1000] p-4"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                        onClick={() => setSelectedProduct(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row"
                            style={{ border: 'none', padding: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Product Image */}
                            <div className="w-full md:w-2/5 min-h-[250px] overflow-hidden" style={{ backgroundColor: '#f0f0f0' }}>
                                <img
                                    src={selectedProduct.imageUrl}
                                    alt={selectedProduct.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x500?text=Product"; }}
                                />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 flex flex-col p-6 sm:p-8">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{selectedProduct.name}</h2>
                                    <button onClick={() => setSelectedProduct(null)} className="text-2xl leading-none cursor-pointer bg-transparent border-none ml-3" style={{ color: 'var(--text-muted)' }}>&times;</button>
                                </div>
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 self-start" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)' }}>
                                    {selectedProduct.category}
                                </span>
                                <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>{selectedProduct.description}</p>
                                <p className="text-xs opacity-70 mb-auto" style={{ color: 'var(--text-muted)' }}>Style Code: {selectedProduct.styleCode}</p>

                                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
                                        ${parseFloat(selectedProduct.basePrice).toFixed(2)}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-main)' }}>Size</label>
                                            <select value={size} onChange={e => setSize(e.target.value)} className="form-select w-full">
                                                <option value="S">S</option>
                                                <option value="M">M</option>
                                                <option value="L">L</option>
                                                <option value="XL">XL</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-main)' }}>Color</label>
                                            <select value={color} onChange={e => setColor(e.target.value)} className="form-select w-full">
                                                <option value="White">White</option>
                                                <option value="Black">Black</option>
                                                <option value="Blue">Blue</option>
                                                <option value="Red">Red</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-5">
                                        <label className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Quantity</label>
                                        <div className="flex items-center rounded-lg overflow-hidden border" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}>
                                            <button className="px-3 py-2 font-bold bg-transparent border-none cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                            <input type="number" value={quantity} readOnly className="w-12 text-center border-none bg-transparent py-2" style={{ color: 'var(--text-main)' }} />
                                            <button className="px-3 py-2 font-bold bg-transparent border-none cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setQuantity(q => q + 1)}>+</button>
                                        </div>
                                    </div>

                                    <button className="btn btn-primary w-full py-3 text-base font-semibold" onClick={handleAddToCart}>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerDashboard;
