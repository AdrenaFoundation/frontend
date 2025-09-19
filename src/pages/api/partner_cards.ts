import supabaseServiceClient from '@/supabaseServiceClient';
import { del } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';

export interface PartnerCard {
  id: number;
  name: string;
  description: string;
  link: string;
  logo_blob_url: string; // Vercel Blob URL
  gradient_color_1: string;
  gradient_color_2: string;
  bg_color: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Partner cards API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Get the current record to find the blob URL
  const { data: existingCard } = await supabaseServiceClient
    .from('partner_cards')
    .select('logo_blob_url')
    .eq('id', id)
    .single();

  // Delete from Vercel Blob
  if (existingCard?.logo_blob_url) {
    try {
      await del(existingCard.logo_blob_url);
    } catch (blobError) {
      console.warn('Failed to delete blob:', blobError);
      // Continue with database deletion even if blob deletion fails
    }
  }

  // Delete from database
  const { error } = await supabaseServiceClient
    .from('partner_cards')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}

// ... other CRUD operations
