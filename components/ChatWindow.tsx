import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import type { Product } from '../types';

interface ChatWindowProps {
    onClose: () => void;
    products: Product[];
}

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, products }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: 'Olá! 👋 Sou o especialista do Ponto Chave do Lar. Como posso te ajudar a encontrar o item chave para o seu ambiente hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botResponse = await getChatbotResponse(input, products);
            const botMessage: Message = { text: botResponse, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: Message = { text: 'Desculpe, não consegui processar sua pergunta. Tente novamente.', sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white rounded-lg shadow-2xl z-50 flex flex-col transform transition-all animate-fade-in-up">
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-brand-primary text-white rounded-t-lg">
                <h3 className="font-bold font-serif">Assistente Virtual</h3>
                <button onClick={onClose} className="text-white hover:opacity-80">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-xs px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-brand-accent text-brand-dark' : 'bg-gray-200 text-brand-dark'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="max-w-xs px-4 py-2 rounded-xl bg-gray-200 text-brand-dark flex items-center">
                            <LoadingSpinner />
                            <span className="ml-2">Pensando...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Digite sua pergunta..."
                        className="w-full px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-brand-primary text-white rounded-full p-3 hover:bg-brand-dark disabled:bg-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};