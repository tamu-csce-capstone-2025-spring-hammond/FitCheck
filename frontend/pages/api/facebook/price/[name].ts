import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name } = req.query;
    const baseUrl = process.env.BACKEND_URL?.replace(/\/$/, ''); // Remove trailing slash if exists
    const response = await fetch(`${baseUrl}/facebook/price/${encodeURIComponent(name as string)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching price:', error);
    return res.status(500).json({ error: 'Failed to fetch price' });
  }
} 