import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Remove trailing slash from BACKEND_URL if it exists
    const baseUrl = process.env.BACKEND_URL?.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/ebay/listing/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Backend error response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      return res.status(response.status).json({ 
        error: 'Failed to process request', 
        details: responseText,
        status: response.status
      });
    }

    try {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return res.status(500).json({ 
        error: 'Invalid JSON response from backend',
        details: responseText
      });
    }
  } catch (error) {
    console.error('Error updating eBay listing:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 