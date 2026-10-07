import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('stitchworks_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('stitchworks_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item, quantity) => {
        setCartItems(prev => {
            const qty = quantity || item.quantity || 1;
            const pId = item.productId || item.id;
            const itemType = item.itemType || 'product';
            const existing = prev.find(i => 
                i.productId === pId && 
                i.size === item.size && 
                i.color === item.color &&
                (i.itemType || 'product') === itemType
            );
            if (existing) {
                return prev.map(i => i === existing ? { ...i, quantity: i.quantity + qty } : i);
            }
            return [...prev, { ...item, productId: pId, itemType: itemType, quantity: qty }];
        });
    };

    const removeFromCart = (productId, size, color, itemType = 'product') => {
        setCartItems(prev => prev.filter(i => !(i.productId === productId && i.size === size && i.color === color && i.itemType === itemType)));
    };

    const updateQuantity = (productId, size, color, itemType = 'product', newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prev => prev.map(i => 
            (i.productId === productId && i.size === size && i.color === color && i.itemType === itemType) ? { ...i, quantity: newQuantity } : i
        ));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};
