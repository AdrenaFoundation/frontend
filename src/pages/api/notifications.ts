import type { NextApiRequest, NextApiResponse } from 'next';

import supabaseAnonClient from '@/supabaseAnonClient';
import { AdrenaNotificationData } from '@/types';

const DIALECT_API_KEY = process.env.DIALECT_API_KEY;
const DIALECT_APP_ID = process.env.DIALECT_APP_ID;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    notifications?: AdrenaNotificationData[] | null;
    isSubscriber?: boolean;
    success?: boolean;
    error?: string;
  }>,
) {
  if (req.method === 'GET') {
    const { wallet_address, limit = 50, offset = 0 } = req.query;

    if (!wallet_address) {
      return res.status(400).json({
        notifications: null,
        isSubscriber: false,
        error: 'Wallet address is required',
      });
    }

    try {
      const resp = await fetch(
        `https://alerts-api.dial.to/v2/${DIALECT_APP_ID}/subscribers?limit=1000`,
        {
          method: 'GET',
          headers: {
            'x-dialect-api-key': DIALECT_API_KEY || '',
          },
        },
      );
      const { subscribers } = await resp.json();

      const isSubscriber =
        Array.isArray(subscribers) &&
        subscribers.some(
          (s: { walletAddress: string }) => s.walletAddress === wallet_address,
        );

      if (isSubscriber) {
        return res.status(200).json({ notifications: [], isSubscriber: true });
      }
    } catch (e) {
      // If Dialect API fails, treat as not a subscriber
      console.error('Error checking Dialect subscription:', e);
    }

    const query = supabaseAnonClient
      .from('notifications')
      .select('*')
      .eq('owner_pubkey', wallet_address)
      .eq('is_automated_order', true)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    try {
      const { data, error } = await query;

      if (error) {
        return res.status(500).json({
          notifications: null,
          isSubscriber: false,
          error: error.message,
        });
      }

      return res.status(200).json({
        notifications: data || [],
        isSubscriber: false,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({
        notifications: null,
        isSubscriber: false,
        error: 'Internal server error',
      });
    }
  } else if (req.method === 'PATCH') {
    const { wallet_address, transaction_signature } = req.body;

    if (!transaction_signature) {
      return res.status(400).json({
        success: false,
        error: 'Transaction signature is required',
      });
    }

    if (!wallet_address) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required',
      });
    }

    const query = supabaseAnonClient
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('owner_pubkey', wallet_address)
      .eq('transaction_signature', transaction_signature);

    try {
      const { error } = await query;

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    return res.status(405).json({
      notifications: null,
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
