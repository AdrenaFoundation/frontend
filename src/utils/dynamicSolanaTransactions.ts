import {
  Connection,
  PublicKey,
  SendOptions,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';

/**
 * Interface representing a wallet with a Solana address
 */
interface SolanaWalletLike {
  address: string;
  connector?: {
    getSigner: () => Promise<{
      signTransaction: (
        transaction: Transaction | VersionedTransaction,
      ) => Promise<Transaction | VersionedTransaction>;
    }>;
  };
}

/**
 * Type guard to check if a wallet has a Solana address
 */
export const hasSolanaAddress = (
  wallet: SolanaWalletLike | null | undefined,
): wallet is SolanaWalletLike => {
  return !!wallet && typeof wallet.address === 'string';
};

/**
 * Send a legacy Solana transaction using Dynamic wallet
 */
export const sendLegacyTransaction = async (
  wallet: SolanaWalletLike,
  connection: Connection,
  transaction: Transaction,
  options?: SendOptions,
): Promise<string> => {
  if (!hasSolanaAddress(wallet)) {
    throw new Error('Wallet is not a valid wallet with address');
  }

  // Get the wallet signer
  const signer = await wallet.connector?.getSigner();
  if (!signer) {
    throw new Error('Unable to get wallet signer');
  }

  // Sign the transaction
  transaction.feePayer = new PublicKey(wallet.address);
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  const signedTransaction = (await signer.signTransaction(
    transaction,
  )) as Transaction;

  // Send the transaction
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize(),
    options,
  );

  // Wait for confirmation if requested
  if (options?.skipPreflight !== true) {
    await connection.confirmTransaction(signature);
  }

  return signature;
};

/**
 * Send a versioned Solana transaction using Dynamic wallet
 */
export const sendVersionedTransaction = async (
  wallet: SolanaWalletLike,
  connection: Connection,
  transaction: VersionedTransaction,
  options?: SendOptions,
): Promise<string> => {
  if (!hasSolanaAddress(wallet)) {
    throw new Error('Wallet is not a valid wallet with address');
  }

  // Get the wallet signer
  const signer = await wallet.connector?.getSigner();
  if (!signer) {
    throw new Error('Unable to get wallet signer');
  }

  // Sign the transaction
  const signedTransaction = (await signer.signTransaction(
    transaction,
  )) as VersionedTransaction;

  // Send the transaction
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize(),
    options,
  );

  // Wait for confirmation if requested
  if (options?.skipPreflight !== true) {
    await connection.confirmTransaction(signature);
  }

  return signature;
};

/**
 * Get a Solana connection from the wallet configuration
 */
export const getConnection = (connection: Connection): Connection => {
  return connection;
};
