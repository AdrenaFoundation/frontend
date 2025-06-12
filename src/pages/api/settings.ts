import type { NextApiRequest, NextApiResponse } from 'next';

import { FetchedSettingsType } from '@/hooks/useFetchUserSettings';
import supabaseClient from '@/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    settings: FetchedSettingsType | null;
    error?: string;
  }>,
) {
  if (req.method === 'GET') {
    const { wallet_address } = req.query;

    if (!wallet_address) {
      return res.status(400).json({
        settings: null,
        error: 'Wallet address is required',
      });
    }

    const { data, error } = await supabaseClient
      .from('settings')
      .select('*')
      .eq('wallet_address', wallet_address)
      .single();

    if (error) {
      return res.status(404).json({
        settings: null,
        error: error.message,
      });
    }

    return res.status(200).json({
      settings: data,
    });
  } else if (req.method === 'POST') {
    const { wallet_address, preferences } = req.body;

    if (!wallet_address) {
      return res.status(400).json({
        settings: null,
        error: 'Wallet address is required',
      });
    }

    // Create settings record with upsert (insert if not exists, update if exists)
    const { data, error } = await supabaseClient
      .from('settings')
      .upsert({
        wallet_address,
        preferences,
      })
      .select()
      .single();

    if (error) {
      return res.status(404).json({
        settings: null,
        error: error.message,
      });
    }

    return res.status(200).json({
      settings: data,
    });
  } else if (req.method === 'PATCH') {
    const { wallet_address, preferences } = req.body;

    if (!wallet_address) {
      return res.status(400).json({
        settings: null,
        error: 'Wallet address is required',
      });
    }

    const { data: existingUser } = await supabaseClient
      .from('settings')
      .select('wallet_address')
      .eq('wallet_address', wallet_address)
      .single();

    if (!existingUser) {
      const { data: newUserData, error: createError } = await supabaseClient
        .from('settings')
        .insert({
          wallet_address,
          preferences,
        })
        .select()
        .single();

      if (createError) {
        return res.status(404).json({
          settings: null,
          error: createError.message,
        });
      }

      return res.status(200).json({
        settings: newUserData,
      });
    }

    const { data, error } = await supabaseClient
      .from('settings')
      .update({ preferences })
      .eq('wallet_address', wallet_address)
      .select()
      .single();

    if (error) {
      return res.status(404).json({
        settings: null,
        error: error.message,
      });
    }

    return res.status(200).json({
      settings: data,
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).json({
      settings: null,
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
