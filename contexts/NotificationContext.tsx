
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NotificationContextType {
    notification: string | null;
    showNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = useCallback((message: string) => {
        setNotification(message);
        setTimeout(() => {
            setNotification(null);
        }, 3000); // Notification disappears after 3 seconds
    }, []);

    const value = { notification, showNotification };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
