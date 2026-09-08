import React from 'react';
import { useCart } from '../contexts/CartContext';
import { CartItemCard } from './CartItemCard';
import { TechnicalConsultancyBanner } from './TechnicalConsultancyBanner';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckout: () => void;
    onOpenConsultancy?: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout, onOpenConsultancy }) => {
    const { cartItems, totalPrice, totalItems } = useCart();

    const formattedTotalPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(totalPrice);

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-2xl font-bold font-serif text-brand-primary">Seu Carrinho ({totalItems})</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-brand-dark transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Cart Items & Benefício de Consultoria IA */}
                    {cartItems.length > 0 ? (
                        <div className="flex-grow overflow-y-auto p-6 space-y-4">
                            {onOpenConsultancy && (
                                <TechnicalConsultancyBanner
                                    onOpenConsultancy={() => {
                                        onClose();
                                        onOpenConsultancy();
                                    }}
                                    currentAmount={totalPrice}
                                    minEligibleAmount={250}
                                    isCompact={true}
                                />
                            )}
                            {cartItems.map(item => (
                                <CartItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col justify-center items-center text-center p-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-700">Seu carrinho está vazio</h3>
                            <p className="text-gray-500 mt-1">Adicione produtos para vê-los aqui.</p>
                        </div>
                    )}



                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="p-6 border-t bg-gray-50">
                            <div className="flex justify-between items-center mb-4 text-lg">
                                <span className="font-semibold text-gray-700">Subtotal:</span>
                                <span className="font-bold text-brand-dark">{formattedTotalPrice}</span>
                            </div>
                            <button 
                                onClick={onCheckout}
                                className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-brand-dark transition-colors duration-300"
                            >
                                Finalizar Compra
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};