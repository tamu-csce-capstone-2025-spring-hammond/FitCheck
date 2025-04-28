import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Product name is required' });
  }

  try {
    const baseUrl = process.env.BACKEND_URL?.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/facebook/availability/${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Facebook availability');
    }

    const data = await response.json();
    return res.status(200).json({ availability: data });
  } catch (error) {
    console.error('Error fetching Facebook availability:', error);
    return res.status(500).json({ error: 'Failed to fetch Facebook availability' });
  }
} 