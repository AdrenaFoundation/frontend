# External Wallet Selection Implementation

## Overview

This implementation makes external wallets (Phantom, Solflare, etc.) selectable in the Privy sidebar, allowing users to switch between Privy embedded wallets and connected external wallets seamlessly.

## Key Changes

### 1. Updated PrivyWalletDropdown Interface

**File**: `src/components/Privy/PrivyWalletDropdown.tsx`

- **Made External Wallets Clickable**: Converted display-only external wallets to selectable buttons
- **Added Selection Callback**: New `onExternalWalletSelection` prop for handling external wallet selection
- **Visual Selection Indicators**: Added checkmarks and highlighting for selected external wallets
- **Updated Display Logic**: Prioritizes external wallet display when selected

```typescript
interface PrivyWalletDropdownProps {
  // ... existing props
  onWalletSelection: (index: number, walletType?: 'privy' | 'external') => void;
  onExternalWalletSelection?: (address: string, adapterName: string) => void;
}
```

### 2. Enhanced PrivyGlobalSidebar Logic

**File**: `src/components/Privy/PrivyGlobalSidebar.tsx`

- **External Wallet Handler**: New `handleExternalWalletSelection` function
- **Redux Integration**: Updates global wallet state when external wallet is selected
- **Storage Management**: Clears Privy wallet selection when external wallet is chosen
- **Event Dispatching**: Notifies other components of wallet changes

```typescript
const handleExternalWalletSelection = (
  address: string,
  adapterName: string,
) => {
  // Clear Privy wallet selection
  localStorage.removeItem('privy:selectedWallet');

  // Update Redux state
  dispatch({
    type: 'connect',
    payload: {
      adapterName: adapterName,
      walletAddress: address,
    },
  });

  // Notify other components
  window.dispatchEvent(new CustomEvent('privyWalletSelected'));
};
```

### 3. Hybrid Adapter Integration

**File**: `src/hooks/useHybridWalletAdapter.tsx`

- **External Wallet Support**: Added `externalWalletFromRedux` parameter
- **Redux State Listening**: Monitors external wallet changes from Redux
- **Automatic Switching**: Updates active wallet when external wallet is selected
- **Storage Cleanup**: Removes Privy selection when external wallet is active

```typescript
// Listen for external wallet changes from Redux
useEffect(() => {
  if (
    externalWalletFromRedux?.address &&
    externalWalletFromRedux.address !== solanaAddress
  ) {
    setSolanaAddress(externalWalletFromRedux.address);
    setPublicKey(new PublicKey(externalWalletFromRedux.address));

    // Clear Privy wallet selection
    localStorage.removeItem('privy:selectedWallet');
  }
}, [externalWalletFromRedux, solanaAddress]);
```

### 4. Wallet Adapters Hook Updates

**File**: `src/hooks/useWalletAdapters.tsx`

- **Redux Integration**: Reads external wallet state from Redux store
- **Hybrid Adapter Configuration**: Passes external wallet info to hybrid adapter
- **Seamless Integration**: Maintains compatibility with existing wallet adapter pattern

## User Experience Flow

### Selecting External Wallets

1. **User opens Privy sidebar**
2. **Clicks on wallet dropdown**
3. **Sees both Privy and External wallet sections**
4. **Clicks on an external wallet** (e.g., Phantom)
5. **External wallet becomes active immediately**
6. **All subsequent transactions use the external wallet**

### Visual Indicators

- **Selected Wallet**: Green checkmark and highlighted background
- **Wallet Type**: Clear labeling (Adrena Account vs. Phantom/Solflare)
- **Active State**: Selected wallet shows at the top of dropdown
- **Copy Address**: Available for all wallet types

### State Management

```
Wallet Selection Priority:
1. External Wallet (if selected) - Highest priority
2. Selected Privy Wallet (from localStorage)
3. First Available Privy Wallet (fallback)
```

## Technical Implementation Details

### Storage Strategy

- **Privy Wallets**: Stored in `localStorage['privy:selectedWallet']`
- **External Wallets**: Stored in Redux `walletState.wallet`
- **Priority**: External wallet selection clears Privy selection
- **Persistence**: External wallet selection persists in Redux state

### Event System

- **Selection Events**: `privyWalletSelected` custom event
- **Multi-tab Support**: Storage events for cross-tab synchronization
- **Component Communication**: Redux state + custom events

### Transaction Routing

```typescript
Transaction Flow:
1. User initiates transaction
2. Hybrid adapter checks active wallet
3. If external wallet selected:
   → Uses native wallet adapter for transaction
4. If Privy wallet selected:
   → Uses Privy transaction methods
5. Fallback to Privy if native wallet fails
```

## Benefits

### For Users

- **Unified Interface**: Single place to manage all wallets
- **Seamless Switching**: Easy switching between wallet types
- **Native Experience**: External wallets use their native UIs
- **Consistent Branding**: All wallets appear in Adrena's interface

### For Developers

- **Clean Architecture**: Separation of concerns between auth and transactions
- **Backward Compatible**: Existing Privy-only flows continue to work
- **Extensible**: Easy to add support for new external wallets
- **Debuggable**: Comprehensive logging and state tracking

## Configuration

### Adding New External Wallets

1. **Add to supported wallets list** in `useWalletAdapters.tsx`
2. **Add wallet icons and colors** in the same file
3. **Update detection logic** in `walletUtils.ts` if needed
4. **Test selection and transaction flow**

### Customizing Selection Behavior

- **Wallet Priority**: Modify `getWalletPriority()` in `walletUtils.ts`
- **Display Logic**: Update `getDisplayText()` in `PrivyWalletDropdown.tsx`
- **Selection Persistence**: Modify storage logic in handlers

## Testing Checklist

- [ ] External wallet appears in dropdown
- [ ] External wallet can be selected
- [ ] Selection updates global state
- [ ] Transactions use selected external wallet
- [ ] Switching back to Privy wallet works
- [ ] Multi-tab synchronization works
- [ ] Visual indicators are correct
- [ ] Copy address functionality works

## Troubleshooting

### Common Issues

1. **External wallet not appearing**: Check if wallet is connected through standard adapter
2. **Selection not persisting**: Verify Redux state updates
3. **Transactions failing**: Check hybrid adapter routing logic
4. **Visual glitches**: Verify CSS classes and selection state

### Debug Tools

- **Console Logs**: Comprehensive logging in development mode
- **Redux DevTools**: Monitor wallet state changes
- **Local Storage**: Check `privy:selectedWallet` value
- **Custom Events**: Listen for `privyWalletSelected` events

## Future Enhancements

1. **Wallet Preferences**: Remember user's preferred wallet type
2. **Advanced Routing**: Smart routing based on transaction type
3. **Batch Operations**: Handle multiple wallet operations
4. **Enhanced UI**: More sophisticated wallet management interface
