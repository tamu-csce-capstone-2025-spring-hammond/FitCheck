import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    // Remove trailing slash if it exists
    backendUrl = backendUrl.replace(/\/$/, '');
    
    console.log('Fetching wear history from:', `${backendUrl}/outfit_wear_history/`);
    const response = await fetch(`${backendUrl}/outfit_wear_history/`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching wear history:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      return res.status(response.status).json({ 
        error: 'Failed to fetch wear history',
        details: errorText
      });
    }

    const wearHistory = await response.json();
    
    // Fetch outfit details for each wear history entry
    const outfitsWithDetails = await Promise.all(
      wearHistory.map(async (history: any) => {
        const outfitResponse = await fetch(`${backendUrl}/outfits/${history.outfit_id}`);
        if (!outfitResponse.ok) {
          console.error(`Failed to fetch outfit ${history.outfit_id}`);
          return null;
        }
        const outfitDetails = await outfitResponse.json();
        return {
          ...history,
          outfit: outfitDetails
        };
      })
    );

    // Filter out any failed outfit fetches
    const validOutfits = outfitsWithDetails.filter((outfit: any) => outfit !== null);
    
    console.log('Successfully fetched wear history with outfit details:', validOutfits);
    return res.status(200).json(validOutfits);
  } catch (error) {
    console.error('Error in wear history API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 