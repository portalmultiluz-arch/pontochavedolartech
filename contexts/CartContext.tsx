import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { CartItem, Product } from '../types';
import { getEffectiveProductPrice } from '../lib/productStatusHelper';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string | number) => void;
    updateQuantity: (productId: string | number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CART_STORAGE_KEY = 'pontochave-cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
            return JSON.parse(storedCart);
        }
    } catch (error) {
        console.error("Failed to load cart from localStorage", error);
    }
    return [];
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(loadCartFromStorage);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }, [cartItems]);

    const addToCart = useCallback((product: Product) => {
        const effectivePrice = getEffectiveProductPrice(product);
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1, price: effectivePrice }
                        : item
                );
            }
            return [...prevItems, { ...product, price: effectivePrice, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((productId: string | number) => {
        setCartItems(prevItems => prevItems.filter(item => String(item.id) !== String(productId)));
    }, []);

    const updateQuantity = useCallback((productId: string | number, quantity: number) => {
        setCartItems(prevItems => {
            if (quantity <= 0) {
                return prevItems.filter(item => String(item.id) !== String(productId));
            }
            return prevItems.map(item =>
                String(item.id) === String(productId) ? { ...item, quantity } : item
            );
        });
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const totalItems = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    const totalPrice = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cartItems]);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};