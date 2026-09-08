
import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

export const Notification: React.FC = () => {
    const { notification } = useNotification();

    if (!notification) {
        return null;
    }

    return (
        <div className="fixed top-24 right-6 bg-brand-primary text-white py-3 px-5 rounded-lg shadow-xl z-50 flex items-center space-x-3 animate-fade-in-down">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{notification}</span>
             <style>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
