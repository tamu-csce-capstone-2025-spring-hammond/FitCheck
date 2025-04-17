import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('BACKEND_URL not configured');
    }

    const backendUrl = `${process.env.BACKEND_URL}/facebook/catalog`.replace(/([^:]\/)\/+/g, "$1");
    console.log('Forwarding request to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req.body),
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