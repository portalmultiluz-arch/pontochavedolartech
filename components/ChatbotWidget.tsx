import React, { useState } from 'react';
import { ChatWindow } from './ChatWindow';
import type { Product } from '../types';

interface ChatbotWidgetProps {
    products: Product[];
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ products }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-6 right-6 z-40">
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="bg-brand-primary rounded-full p-3 text-white shadow-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all transform hover:scale-110"
                    aria-label="Abrir chat de ajuda"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h4v1a1 1 0 001 1h4a1 1 0 001-1v-1h4a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                </button>
            </div>
            {isOpen && <ChatWindow onClose={() => setIsOpen(false)} products={products} />}
        </>
    );
};
