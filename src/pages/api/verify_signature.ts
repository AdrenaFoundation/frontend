import { PublicKey } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';
import nacl from 'tweetnacl';

import supabaseServiceClient from '@/supabaseServiceClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const { message, signature, walletAddress } = req.body;

      if (!message || !signature || !walletAddress) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(500).json({ error: 'No authorization header' });
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
    res.setHeader('Allow', ['POST']);
    return res.status(500).json({
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
