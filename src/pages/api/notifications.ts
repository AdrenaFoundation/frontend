import type { NextApiRequest, NextApiResponse } from 'next';

import supabaseAnonClient from '@/supabaseAnonClient';
import { AdrenaNotificationData } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    notifications?: AdrenaNotificationData[] | null;
    success?: boolean;
    error?: string;
  }>,
) {
  if (req.method === 'GET') {
    const { wallet_address, limit = 50, offset = 0 } = req.query;

    if (!wallet_address) {
      return res.status(400).json({
        notifications: null,
        error: 'Wallet address is required',
      });
    }

    const authHeader = req.headers.authorization;
    let query = supabaseAnonClient
      .from('notifications')
      .select('*')
      .eq('owner_pubkey', wallet_address)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.replace('Bearer ', '');
      query = query.setHeader('Authorization', `Bearer ${accessToken}`);
    }

    try {
      const { data, error } = await query;

      if (error) {
        return res.status(500).json({
          notifications: null,
          error: error.message,
        });
      }

      return res.status(200).json({
        notifications: data || [],
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({
        notifications: null,
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

    // Get access token from Authorization header
    const authHeader = req.headers.authorization;
    let query = supabaseAnonClient
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('owner_pubkey', wallet_address)
      .eq('transaction_signature', transaction_signature);
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.replace('Bearer ', '');
      query = query.setHeader('Authorization', `Bearer ${accessToken}`);
    }

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
