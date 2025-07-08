import type { NextApiRequest, NextApiResponse } from 'next';

import supabaseAnonClient from '@/supabaseAnonClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    favoriteAchievements: string[] | null;
  }>,
) {
  if (req.method === 'POST') {
    const { wallet_address, favorite_achievements } = req.body;

    if (!wallet_address || !favorite_achievements) {
      return res.status(400).json({
        favoriteAchievements: null,
      });
    }
    const { error } = await supabaseAnonClient
      .from('user_favorite_achievements')
      .upsert({
        wallet_address,
        favorite_achievements,
      });

    if (error) {
      return res.status(500).json({
        favoriteAchievements: null,
      });
    }

    res.json({
      favoriteAchievements: favorite_achievements,
    });
  } else if (req.method === 'PATCH') {
    const { wallet_address, favorite_achievements } = req.body;

    if (!wallet_address || !favorite_achievements) {
      return res.status(400).json({
        favoriteAchievements: null,
      });
    }

    const { error } = await supabaseAnonClient
      .from('user_favorite_achievements')
      .update({ favorite_achievements })
      .eq('wallet_address', wallet_address);

    if (error) {
      return res.status(500).json({
        favoriteAchievements: null,
      });
    }

    res.json({
      favoriteAchievements: favorite_achievements,
    });
  } else {
    const { wallet_address } = req.query;
    if (!wallet_address) {
      return res.status(400).json({
        favoriteAchievements: null,
      });
    }

    const { data } = await supabaseAnonClient
      .from('user_favorite_achievements')
      .select('favorite_achievements')
      .eq('wallet_address', wallet_address)
      .single();

    if (!data) {
      return res.status(500).json({
        favoriteAchievements: null,
      });
    }

    res.json({
      favoriteAchievements: data.favorite_achievements,
    });
  }
}
