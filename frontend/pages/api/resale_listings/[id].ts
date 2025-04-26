import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    // Remove trailing slash from BACKEND_URL if it exists
    const baseUrl = process.env.BACKEND_URL?.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/resale_listings/${id}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return res.status(response.status).json({ 
        error: 'Failed to fetch listing', 
        details: errorText
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching resale listing:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 