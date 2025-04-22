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
    if (!process.env.BACKEND_URL) {
      throw new Error('BACKEND_URL not configured');
    }

    const backendUrl = `${process.env.BACKEND_URL}/facebook/image/${encodeURIComponent(name)}`.replace(/([^:]\/)\/+/g, "$1");
    console.log('Forwarding request to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API Error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 