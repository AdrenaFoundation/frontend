# Liquidity API Documentation

## Overview

This document provides usage instructions for the Add and Remove Liquidity API endpoints. These endpoints allow users to add liquidity to the Adrena pool or remove liquidity from it, receiving ALP tokens in return for adding liquidity or receiving USDC when removing liquidity.

## Base URL

```
http://localhost:3000/api/public/v1/liquidity
```

## Rate Limiting

All public API endpoints are rate-limited to prevent abuse. Check the response headers for rate limit information:

- `X-Rate-Limit-Limit`: Request limit per time window
- `X-Rate-Limit-Remaining`: Remaining requests in current window
- `X-Rate-Limit-Reset`: Time when the rate limit window resets

---

## Add Liquidity

### Endpoint

```
GET /api/public/v1/liquidity/add
```

### Description

Adds liquidity to the Adrena pool using a specified token and returns a quote and transaction for the user to sign and execute.

### Query Parameters

| Parameter     | Type   | Required | Description                                      |
| ------------- | ------ | -------- | ------------------------------------------------ |
| `account`     | string | Yes      | Solana public key of the user's wallet           |
| `amount`      | number | Yes      | Amount of tokens to add as liquidity             |
| `tokenSymbol` | string | Yes      | Symbol of the token to add (e.g., "USDC", "SOL") |

### Example Request

```
GET /api/public/v1/liquidity/add?account=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM&amount=100&tokenSymbol=USDC
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "error": null,
  "data": {
    "quote": {
      "inputAmount": 100,
      "inputToken": "USDC",
      "outputAmount": 95.5,
      "outputToken": "ALP",
      "fee": 0.5
    },
    "transaction": "base64-encoded-transaction-string"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Input

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_INPUT",
    "message": "Missing required parameters: account, amount, and tokenSymbol are required"
  },
  "data": null
}
```

#### 400 Bad Request - Invalid Public Key

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PUBLIC_KEY",
    "message": "Invalid Solana public key provided"
  },
  "data": null
}
```

#### 400 Bad Request - Invalid Amount

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Amount must be a positive number"
  },
  "data": null
}
```

#### 400 Bad Request - Token Not Found

```json
{
  "status": "error",
  "error": {
    "code": "TOKEN_NOT_FOUND",
    "message": "Token INVALID not supported"
  },
  "data": null
}
```

#### 400 Bad Request - Insufficient Balance

```json
{
  "status": "error",
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance for USDC. Available: 50, Required: 100"
  },
  "data": null
}
```

#### 500 Internal Server Error

```json
{
  "status": "error",
  "error": {
    "code": "QUOTE_CALCULATION_FAILED",
    "message": "Failed to calculate ALP quote"
  },
  "data": null
}
```

---

## Remove Liquidity

### Endpoint

```
GET /api/public/v1/liquidity/remove
```

### Description

Removes liquidity from the Adrena pool, converting ALP tokens back to USDC, and returns a quote and transaction for the user to sign and execute.

### Query Parameters

| Parameter | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| `account` | string | Yes      | Solana public key of the user's wallet |
| `amount`  | number | Yes      | Amount of ALP tokens to remove         |

### Example Request

```
GET /api/public/v1/liquidity/remove?account=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM&amount=50
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "error": null,
  "data": {
    "quote": {
      "inputAmount": 50,
      "inputToken": "ALP",
      "outputAmount": 48.2,
      "outputToken": "USDC",
      "fee": 0.3
    },
    "transaction": "base64-encoded-transaction-string"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Input

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_INPUT",
    "message": "Missing required parameters: account and amount are required"
  },
  "data": null
}
```

#### 400 Bad Request - Invalid Public Key

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PUBLIC_KEY",
    "message": "Invalid Solana public key provided"
  },
  "data": null
}
```

#### 400 Bad Request - Invalid Amount

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Amount must be a positive number"
  },
  "data": null
}
```

#### 500 Internal Server Error - Token Config Error

```json
{
  "status": "error",
  "error": {
    "code": "TOKEN_CONFIG_ERROR",
    "message": "USDC token configuration not found"
  },
  "data": null
}
```

#### 400 Bad Request - Insufficient Balance

```json
{
  "status": "error",
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance for ALP. Available: 25, Required: 50"
  },
  "data": null
}
```

#### 500 Internal Server Error

```json
{
  "status": "error",
  "error": {
    "code": "QUOTE_CALCULATION_FAILED",
    "message": "Failed to calculate USDC quote for ALP withdrawal"
  },
  "data": null
}
```

---

## Usage Examples

### JavaScript/TypeScript Example

```javascript
// Add Liquidity Example
async function addLiquidity(account, amount, tokenSymbol) {
  try {
    const response = await fetch(
      `/api/public/v1/liquidity/add?account=${account}&amount=${amount}&tokenSymbol=${tokenSymbol}`,
    );

    const data = await response.json();

    if (data.status === 'success') {
      console.log('Quote:', data.data.quote);
      console.log('Transaction:', data.data.transaction);

      // Sign and send the transaction using your wallet provider
      // const signedTx = await wallet.signTransaction(data.data.transaction);
      // const txId = await connection.sendRawTransaction(signedTx);

      return data;
    } else {
      console.error('Error:', data.error);
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Remove Liquidity Example
async function removeLiquidity(account, amount) {
  try {
    const response = await fetch(
      `/api/public/v1/liquidity/remove?account=${account}&amount=${amount}`,
    );

    const data = await response.json();

    if (data.status === 'success') {
      console.log('Quote:', data.data.quote);
      console.log('Transaction:', data.data.transaction);

      // Sign and send the transaction using your wallet provider
      // const signedTx = await wallet.signTransaction(data.data.transaction);
      // const txId = await connection.sendRawTransaction(signedTx);

      return data;
    } else {
      console.error('Error:', data.error);
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

### cURL Example

```bash
# Add Liquidity
curl -X GET "http://localhost:3000/api/public/v1/liquidity/add?account=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM&amount=100&tokenSymbol=USDC"

# Remove Liquidity
curl -X GET "http://localhost:3000/api/public/v1/liquidity/remove?account=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM&amount=50"
```

---

## Important Notes

1. **Transaction Execution**: The API returns a serialized transaction that must be signed by the user's wallet before being submitted to the Solana network.

2. **Transaction Fees**: The returned transaction includes compute budget instructions to ensure successful execution. Actual transaction fees will be deducted from the user's SOL balance.

3. **Slippage**: The quotes provided are estimates. Actual amounts received may vary slightly due to market conditions and slippage.

4. **Rate Limiting**: Be mindful of rate limits when making multiple requests. Implement proper error handling and retry logic with exponential backoff.

5. **Error Handling**: Always check the `status` field in the response and handle errors appropriately. The API provides detailed error codes and messages for troubleshooting.

6. **Security**: Never expose private keys or sensitive wallet information when using these APIs. The transaction signing should be done client-side using secure wallet providers.

---

## Transaction Signing Guide

### Overview

The liquidity APIs return serialized transactions (base64 encoded) that must be signed by the user's wallet before being submitted to the Solana network. This section provides comprehensive examples for signing and sending these transactions.

### Important: Transaction Structure

The API returns transactions that may need to be reconstructed before signing due to signature validation requirements. The recommended approach is to:

1. **Extract instructions** from the API transaction
2. **Create a fresh transaction** with the same instructions
3. **Set fresh properties** (recentBlockhash, feePayer)
4. **Sign and send** the clean transaction

### JavaScript/Node.js Example (Backend)

```javascript
const {
  Connection,
  Keypair,
  Transaction,
  VersionedTransaction,
} = require('@solana/web3.js');
const bs58 = require('bs58');

async function signAndSendLiquidityTransaction(
  base64Transaction,
  privateKeyBase58,
) {
  try {
    // Initialize connection and keypair
    const connection = new Connection(
      'https://api.mainnet-beta.solana.com',
      'confirmed',
    );
    const privateKeyUint8Array = bs58.decode(privateKeyBase58);
    const keypair = Keypair.fromSecretKey(privateKeyUint8Array);

    // Decode the base64 transaction from API
    const transactionBuffer = Buffer.from(base64Transaction, 'base64');
    const originalTransaction = Transaction.from(transactionBuffer);

    // Create a fresh transaction with the same instructions
    const freshTransaction = new Transaction();
    freshTransaction.add(...originalTransaction.instructions);

    // Set fresh properties
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    freshTransaction.recentBlockhash = blockhash;
    freshTransaction.feePayer = keypair.publicKey;

    // Sign the transaction
    freshTransaction.sign(keypair);

    // Send and confirm
    const signature = await connection.sendRawTransaction(
      freshTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      },
    );

    const confirmation = await connection.confirmTransaction(
      signature,
      'confirmed',
    );
    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
      );
    }

    return signature;
  } catch (error) {
    console.error('Transaction signing failed:', error.message);
    throw error;
  }
}

// Usage example
async function main() {
  const account = 'YOUR_PUBLIC_KEY';
  const amount = 0.1;
  const tokenSymbol = 'USDC';

  // Get transaction from API
  const response = await fetch(
    `http://localhost:3000/api/public/v1/liquidity/add?account=${account}&amount=${amount}&tokenSymbol=${tokenSymbol}`,
  );

  const data = await response.json();

  if (data.status === 'success') {
    const signature = await signAndSendLiquidityTransaction(
      data.data.transaction,
      'YOUR_PRIVATE_KEY_BASE58',
    );

    console.log('Transaction completed:', signature);
  }
}
```

### Testing

For testing purposes, you can use the provided test script:

```bash
# Set your private key
export PRIVATE_KEY_BASE58="your_private_key_here"

# Run the test
node src/tests/liquidityTest.js
```
