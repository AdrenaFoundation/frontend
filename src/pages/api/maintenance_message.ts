import { NextApiRequest, NextApiResponse } from 'next';

import supabaseServiceClient from '@/supabaseServiceClient';

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
    console.error('Maintenance message API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabaseServiceClient
    .from('maintenance_message')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching maintenance messages:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch maintenance messages' });
  }

  return res.status(200).json({ data });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { message, pages, color } = req.body;

  if (!message || !pages) {
    return res.status(400).json({ error: 'Message and pages are required' });
  }

  const { data, error } = await supabaseServiceClient
    .from('maintenance_message')
    .insert([
      {
        message,
        pages,
        color: color || '#b45309',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating maintenance message:', error);
    return res
      .status(500)
      .json({ error: 'Failed to create maintenance message' });
  }

  return res.status(201).json({ data });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id, message, pages, color } = req.body;

  if (!id || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabaseServiceClient
    .from('maintenance_message')
    .update({
      message,
      pages,
      color: color || '#b45309',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating maintenance message:', error);
    return res
      .status(500)
      .json({ error: 'Failed to update maintenance message' });
  }

  return res.status(200).json({ data });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  const { error } = await supabaseServiceClient
    .from('maintenance_message')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting maintenance message:', error);
    return res
      .status(500)
      .json({ error: 'Failed to delete maintenance message' });
  }

  return res
    .status(200)
    .json({ message: 'Maintenance message deleted successfully' });
}
