import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryCity, setDeliveryCity] = useState('');
    const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
    const [deliveryCountry, setDeliveryCountry] = useState('Sri Lanka');
    const [shippingMethod, setShippingMethod] = useState('Standard');
    
    const [shippingCost, setShippingCost] = useState(null);
    const [estimatedDays, setEstimatedDays] = useState(null);
    const [totalWeight, setTotalWeight] = useState(0);

    const calculateShipping = async () => {
        if (!deliveryCountry) {
            toast.error("Please enter a country to calculate shipping.");
            return;
        }
        try {
            const token = localStorage.getItem('stitchworks_token');
            const res = await fetch('/api/customer/cart/calculate-shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ items: cartItems, deliveryCountry })
            });
            const data = await res.json();
            if (res.ok) {
                setShippingCost(data.shippingCost);
                setEstimatedDays(data.estimatedDays);
                setTotalWeight(data.totalWeight);
                toast.success("Shipping calculated successfully.");
            } else {
                toast.error("Failed to calculate shipping.");
            }
        } catch (error) {
            toast.error("An error occurred while calculating shipping.");
        }
    };

    const placeOrder = async () => {
        if (!deliveryAddress || !deliveryCity || !deliveryPostalCode || !deliveryCountry) {
            toast.error("Please fill in all delivery details.");
            return;
        }
        if (shippingCost === null) {
            toast.error("Please calculate shipping before placing the order.");
            return;
        }

        try {
            const token = localStorage.getItem('stitchworks_token');
            const payload = {
                items: cartItems,
                deliveryAddress,
                deliveryCity,
                deliveryPostalCode,
                deliveryCountry,
                shippingMethod
            };

            const res = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Order placed successfully: ${data.orderNumber}`);
                clearCart();
                navigate('/customer');
            } else {
                toast.error(data.error || "Failed to place order.");
            }
        } catch (error) {
            toast.error("An error occurred while placing the order.");
        }
    };

    const overallTotal = cartTotal + (shippingCost || 0);

    return (
        <div className="px-4 sm:px-6 pt-10 sm:pt-16 pb-16 min-h-screen" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Your Shopping Cart</h2>

            {cartItems.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-lg mb-6" style={{ color: 'var(--text-muted)' }}>Your cart is empty.</p>
                    <button onClick={() => navigate('/customer')} className="btn btn-primary px-6 py-2.5 rounded-full">
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-6xl mx-auto">
                    {/* Cart Items */}
                    <div className="flex-1 min-w-0 rounded-2xl p-5 sm:p-7 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
                        <h3 className="text-xl font-bold pb-4 mb-5 border-b" style={{ borderColor: 'var(--border-color)' }}>Cart Items</h3>
                        {cartItems.map((item, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-4 mb-5 pb-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <img src={item.imageUrl} alt={item.name} className="w-full sm:w-24 h-36 sm:h-24 object-cover rounded-xl" />
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold mb-1">{item.name}</h4>
                                    {item.itemType !== 'material' && (
                                        <>
                                            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Style: {item.styleCode}</p>
                                            <p className="text-sm">Size: <strong>{item.size}</strong> &nbsp;|&nbsp; Color: <strong>{item.color}</strong></p>
                                        </>
                                    )}
                                    {item.itemType === 'material' && (
                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Type: Raw Material</p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                        <div className="flex items-center rounded-lg border overflow-hidden" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}>
                                            <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.itemType, item.quantity - 1)} className="px-3 py-2 font-bold bg-transparent border-none cursor-pointer" style={{ color: 'var(--text-main)' }}>-</button>
                                            <span className="px-3 font-medium">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.itemType, item.quantity + 1)} className="px-3 py-2 font-bold bg-transparent border-none cursor-pointer" style={{ color: 'var(--text-main)' }}>+</button>
                                        </div>
                                        <div className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
                                        <button onClick={() => removeFromCart(item.productId, item.size, item.color, item.itemType)} className="ml-auto sm:ml-0 text-sm px-3 py-1.5 rounded-lg border cursor-pointer bg-transparent transition-colors" style={{ color: '#ff3b30', borderColor: '#ff3b30' }}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-[380px] shrink-0 rounded-2xl p-5 sm:p-7 border self-start" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
                        <h3 className="text-xl font-bold pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>Order Summary</h3>
                        <div className="flex justify-between mb-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                            <span>Subtotal:</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        {shippingCost !== null && (
                            <div className="flex justify-between mb-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                <span>Shipping:</span>
                                <span>${Number(shippingCost).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between mt-4 pt-4 border-t font-bold text-xl" style={{ borderColor: 'var(--border-color)' }}>
                            <span>Total:</span>
                            <span style={{ color: 'var(--primary-color)' }}>${overallTotal.toFixed(2)}</span>
                        </div>

                        <div className="mt-6">
                            <h4 className="font-semibold mb-3">Delivery Details</h4>
                            <div className="space-y-2.5">
                                <input type="text" placeholder="Address" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="form-control w-full" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="City" value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)} className="form-control" />
                                    <input type="text" placeholder="Postal Code" value={deliveryPostalCode} onChange={e => setDeliveryPostalCode(e.target.value)} className="form-control" />
                                </div>
                                <input type="text" placeholder="Country" value={deliveryCountry} onChange={e => { setDeliveryCountry(e.target.value); setShippingCost(null); }} className="form-control w-full" />
                                <select value={shippingMethod} onChange={e => setShippingMethod(e.target.value)} className="form-select w-full">
                                    <option value="Standard">Standard Shipping</option>
                                    <option value="Express">Express Shipping</option>
                                </select>
                            </div>

                            <button onClick={calculateShipping} className="btn btn-secondary w-full py-3 mt-4">
                                Calculate Shipping
                            </button>

                            {shippingCost !== null && (
                                <div className="text-sm mt-4 p-3 rounded-xl border" style={{ color: 'var(--text-main)', background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                                    <p className="mb-1">Estimated Prep &amp; Delivery: <strong>{estimatedDays} days</strong></p>
                                    <p>Total Weight: <strong>{totalWeight.toFixed(2)} kg</strong></p>
                                </div>
                            )}

                            <button onClick={placeOrder} className="btn btn-primary w-full py-3 mt-4 text-base font-semibold">
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
