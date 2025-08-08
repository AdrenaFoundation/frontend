import { PublicKey } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';
import nacl from 'tweetnacl';

import supabaseAnonClient from '@/supabaseAnonClient';
import supabaseServiceClient from '@/supabaseServiceClient';
import { isValidPublicKey } from '@/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { walletAddress } = req.query;
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res
        .status(400)
        .json({ error: 'Missing or invalid walletAddress' });
    }

    if (!isValidPublicKey(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const accessToken = authHeader.replace('Bearer ', '');

    try {
      const { error } = await supabaseAnonClient
        .from('whitelisted_wallets')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single()
        .setHeader('Authorization', `Bearer ${accessToken}`);

      if (error) {
        return res.status(500).json({ isAdmin: false });
      }

      return res.status(200).json({ isAdmin: true });
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'Internal server error', errMsg: err });
    }
  } else if (req.method === 'POST') {
    try {
      const { message, signature, walletAddress, timestamp, nonce } = req.body;

      if (!message || !signature || !walletAddress || !timestamp || !nonce) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!isValidPublicKey(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      // Check if this nonce has been used before
      const { data: existingNonce } = await supabaseServiceClient
        .from('used_nonces')
        .select('nonce')
        .eq('nonce', nonce)
        .eq('wallet_address', walletAddress)
        .single();

      if (existingNonce) {
        return res.status(400).json({
          success: false,
          error: 'Nonce has already been used',
        });
      }

      const messageTimestamp = parseInt(timestamp);
      const now = Date.now();
      const oneMinute = 60 * 1000;

      if (now - messageTimestamp > oneMinute) {
        return res.status(400).json({
          success: false,
          error: 'Signature expired. Please try again.',
        });
      }

      // Validate nonce exists and is reasonable
      if (!nonce || nonce === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid nonce',
        });
      }

      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
      }

      const token = authHeader.replace('Bearer ', '');

      const {
        data: { user },
        error: authError,
      } = await supabaseServiceClient.auth.getUser(token);

      if (authError || !user) {
        return res.status(500).json({ error: 'Invalid token' });
      }

      const messageBytes = new TextEncoder().encode(message);

      const signatureBuffer = Buffer.from(signature, 'base64');

      const signatureBytes = new Uint8Array(signatureBuffer);

      const publicKey = new PublicKey(walletAddress);

      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes(),
      );

      if (isValid) {
        await supabaseServiceClient.from('used_nonces').insert({
          nonce,
          wallet_address: walletAddress,
        });

        const {
          data: { user: userData },
          error: userError,
        } = await supabaseServiceClient.auth.admin.getUserById(user.id);

        if (userError) {
          console.error('Error fetching user data:', userError);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch user data',
          });
        }

        // if wallet address is already verified, return success
        if (
          userData?.app_metadata?.verified_wallet_addresses &&
          userData?.app_metadata.verified_wallet_addresses.includes(
            walletAddress,
          )
        ) {
          return res.status(200).json({
            success: true,
            message: 'Wallet address already verified',
            walletAddress: publicKey,
          });
        }

        const existingAddresses =
          userData?.app_metadata?.verified_wallet_addresses ?? [];

        const { error: updateError } =
          await supabaseServiceClient.auth.admin.updateUserById(user.id, {
            app_metadata: {
              ...userData?.app_metadata,
              verified_wallet_addresses: [...existingAddresses, walletAddress],
            },
          });

        if (updateError) {
          console.error('Error updating user metadata:', updateError);
          return res.status(500).json({
            success: false,
            error: 'Failed to update user verification status',
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Signature verified successfully',
          walletAddress: publicKey,
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Invalid signature',
        });
      }
    } catch (error) {
      console.error('Error verifying signature:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(500).json({
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
