import { randomUUID } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

import supabaseClient from '@/supabaseBackendClient';
import { ErrorReportType } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { error_code } = req.query;

    const { data, error } = await supabaseClient
      .from('error_reports')
      .select('*')
      .eq('ref', error_code as string)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch error reports',
        details: error.message,
      });
    }

    return res.status(200).json({
      reports: data,
      count: data?.length || 0,
    });
  }

  if (req.method === 'POST') {
    const {
      wallet_address,
      error_message,
      console_log,
      recent_post_data,
      url,
      action,
      step,
      txHash,
    } = req.body as ErrorReportType;

    // Validate required fields
    if (!error_message) {
      return res.status(400).json({
        error: 'Missing required field: error_message',
      });
    }

    const random = randomUUID().split('-')[0];

    const ref = `ERR-${Date.now()}-${random}`;

    const report = {
      wallet_address: wallet_address ?? 'anonymous',
      error_message,
      console_log: console_log ?? '',
      recent_post_data: recent_post_data ?? null,
      url: url ?? '',
      action: action ?? '',
      step: step ?? '',
      timestamp: new Date().toISOString(),
      txHash: txHash ?? null,
      ref: ref ?? '',
    };

    const { error } = await supabaseClient
      .from('error_reports')
      .insert([report])
      .select();

    if (error) {
      return res.status(500).json({
        error: 'Failed to create error report',
        details: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      report,
      message: 'Error report created successfully',
      report_code: ref,
    });
  }

  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
