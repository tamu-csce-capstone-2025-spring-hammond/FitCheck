import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { date } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing outfit ID' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    // First verify if the outfit exists
    console.log('Verifying outfit exists:', id);
    const outfitResponse = await fetch(`${backendUrl}/outfits/${id}`);
    if (!outfitResponse.ok) {
      console.error('Outfit not found:', {
        status: outfitResponse.status,
        statusText: outfitResponse.statusText
      });
      return res.status(404).json({ error: 'Outfit not found' });
    }

    // If outfit exists, proceed with logging
    const requestBody = {
      outfit_id: Number(id),
      date: date
    };

    console.log('Attempting to log outfit:', {
      url: `${backendUrl}/outfit_wear_history/`,
      requestBody
    });

    const response = await fetch(`${backendUrl}/outfit_wear_history/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Backend returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully logged outfit:', data);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error logging outfit:', error);
    return res.status(500).json({ 
      error: 'Failed to log outfit',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 