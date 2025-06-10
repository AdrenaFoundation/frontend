import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { FetchedSettingsType } from '@/hooks/useFetchUserSettings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    settings: FetchedSettingsType | null;
    error?: string;
  }>,
) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  );

  // GET method - Fetch user settings
  if (req.method === 'GET') {
    const { wallet_address } = req.query;

    if (!wallet_address) {
      return res.status(400).json({
        settings: null,
        error: 'Wallet address is required',
      });
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('wallet_address', wallet_address)
      .single();

    if (error) {
      // Not found error
      return res.status(500).json({
        settings: null,
        error: error.message,
      });
    }

    // Return empty settings if not found
    if (!data) {
      return res.status(200).json({
        settings: null,
      });
    }

    return res.status(200).json({
      settings: data,
    });
  }

  // POST method - Create or update user settings
  else if (req.method === 'POST') {
    const { wallet_address, preferences } = req.body;

    if (!wallet_address) {
      return res.status(400).json({
        settings: null,
        error: 'Wallet address is required',
      });
    }

    // Create settings record with upsert (insert if not exists, update if exists)
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        wallet_address,
        preferences,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        settings: null,
        error: error.message,
      });
    }

    return res.status(200).json({
      settings: data,
    });
  }

  // PATCH method
  else if (req.method === 'PATCH') {
    const { wallet_address, preferences } = req.body;

    if (!wallet_address) {
      return res.status(400).json({
        settings: null,
        error: 'Wallet address is required',
      });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('settings')
      .select('wallet_address')
      .eq('wallet_address', wallet_address)
      .single();

    // If user doesn't exist, create new record
    if (!existingUser) {
      const { data: newUserData, error: createError } = await supabase
        .from('settings')
        .insert({
          wallet_address,
          preferences,
        })
        .select()
        .single();

      if (createError) {
        return res.status(500).json({
          settings: null,
          error: createError.message,
        });
      }

      return res.status(201).json({
        settings: newUserData,
      });
    }

    // Update existing record
    const { data, error } = await supabase
      .from('settings')
      .update({ preferences })
      .eq('wallet_address', wallet_address)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        settings: null,
        error: error.message,
      });
    }

    return res.status(200).json({
      settings: data,
    });
  }

  // Handle unsupported methods
  else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).json({
      settings: null,
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
