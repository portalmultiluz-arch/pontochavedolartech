
import React from 'react';
import type { CartItem } from '../types';
import { useCart } from '../contexts/CartContext';
import { sanitizeCustomerText } from '../lib/textHelper';

interface CartItemCardProps {
    item: CartItem;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();

    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(item.price);
    
    const handleQuantityChange = (newQuantity: number) => {
        updateQuantity(item.id, newQuantity);
    };

    return (
        <div className="flex items-center space-x-4 p-2 rounded-lg bg-white border">
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
            <div className="flex-grow">
                <h4 className="font-semibold text-brand-dark">{sanitizeCustomerText(item.name)}</h4>
                <p className="text-sm text-gray-600">{formattedPrice}</p>
                <div className="flex items-center mt-2 space-x-2">
                    <button onClick={() => handleQuantityChange(item.quantity - 1)} className="border rounded-md px-2 py-0.5 hover:bg-gray-100">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.quantity + 1)} className="border rounded-md px-2 py-0.5 hover:bg-gray-100">+</button>
                </div>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    );
};
