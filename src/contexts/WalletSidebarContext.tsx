import { createContext, ReactNode, useContext, useState } from 'react';

interface WalletSidebarContextType {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const WalletSidebarContext = createContext<
  WalletSidebarContextType | undefined
>(undefined);

export function WalletSidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <WalletSidebarContext.Provider
      value={{
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </WalletSidebarContext.Provider>
  );
}

export function useWalletSidebar() {
  const context = useContext(WalletSidebarContext);

  if (context === undefined) {
    throw new Error(
      'useWalletSidebar must be used within a WalletSidebarProvider',
    );
  }

  return context;
}
