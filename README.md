# ADRENA's Frontend

Welcome to the official repository for ADRENA's frontend page. Built with Next.js, this frontend is the gateway to interacting with the ADRENA program.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js version 18.0.0 or higher

### Installation

1. **Clone the Repository**

   To get started, clone this repository to your local machine.

2. **Install Dependencies**

   Navigate to the project directory and install the required dependencies:

   ```bash
   cd frontend
   npm i
   ```

3. **Install Pre-commit hook**

   ```bash
    npx husky install
   ```

4. **Setup environment file**

   ```bash
    cp .env.example .env
   ```

   and set mandatory env variables

5. **Launch the Development Server**

   ```bash
   npx next dev
   ```

   Then, open http://localhost:3000 in your browser to view the frontend.

## Contributing

We highly value contributions from the community! If you're interested in helping improve ADRENA's frontend, please take a moment to review our contribution guidelines.

## Dynamic.xyz Wallet Integration

This project includes integration with Dynamic.xyz for wallet connections and authentication, providing enhanced wallet functionality beyond standard Solana wallet adapter.

- Email/social login with embedded wallets
- Improved mobile experience with passkey support
- Multi-chain support (current implementation focuses on Solana)
- Simplified transaction signing

### Implementation Details

The Dynamic wallet integration is implemented using the following components:

- `DynamicProvider`: Wraps the application with Dynamic's authentication context
- `useDynamicWallet`: Custom hook to interact with Dynamic's wallet system
- `DynamicWalletButton` and `DynamicWalletMenu`: UI components for wallet interactions
- `dynamicSolanaTransactions`: Utility functions for handling Solana transactions

The integration is designed to work alongside the existing wallet adapter, with the ability to switch between them using the `NEXT_PUBLIC_USE_DYNAMIC_WALLET` environment variable.

For more information on configuring and using Dynamic's wallet, refer to the [official documentation](https://docs.dynamic.xyz/).
