/**
 * Context for managing global Privy sidebar state
 */

import { createContext, ReactNode, useContext, useState } from 'react';

interface PrivySidebarContextType {
    isSidebarOpen: boolean;
    openSidebar: () => void;
    closeSidebar: () => void;
    toggleSidebar: () => void;
}

const PrivySidebarContext = createContext<PrivySidebarContextType | undefined>(undefined);

export function PrivySidebarProvider({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <PrivySidebarContext.Provider value={{
            isSidebarOpen,
            openSidebar,
            closeSidebar,
            toggleSidebar,
        }}>
            {children}
        </PrivySidebarContext.Provider>
    );
}

export function usePrivySidebar() {
    const context = useContext(PrivySidebarContext);
    if (context === undefined) {
        throw new Error('usePrivySidebar must be used within a PrivySidebarProvider');
    }
    return context;
}
