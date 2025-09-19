import { put } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Limit file size
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
    const filename = searchParams.get('filename');

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Upload to Vercel Blob
    const blob = await put(`partner-logos/${filename}`, req, {
      access: 'public',
      addRandomSuffix: true, // Avoid naming conflicts
    });

    return res.status(200).json({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
