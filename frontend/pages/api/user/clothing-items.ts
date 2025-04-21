import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const baseUrl = process.env.BACKEND_URL?.replace(/\/$/, ''); // Remove trailing slash if exists
    console.log('Backend URL:', baseUrl);
    
    // Get the login token from cookies
    const loginToken = req.cookies.login_token;
    console.log('Login token from cookie:', loginToken);
    
    if (!loginToken) {
      return res.status(401).json({ error: 'Not logged in' });
    }
    
    // First get the user data to get the user ID
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${loginToken}`
      }
    });
    
    console.log('User response status:', userResponse.status);
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Failed to fetch user data: ${userResponse.statusText}. Details: ${errorText}`);
    }
    
    const userData = await userResponse.json();
    console.log('User data:', userData);
    
    // Now fetch the user's clothing items using their ID
    const clothingResponse = await fetch(`${baseUrl}/users/${userData.id}`, {
      headers: {
        'Authorization': `Bearer ${loginToken}`
      }
    });
    
    console.log('Clothing response status:', clothingResponse.status);
    
    if (!clothingResponse.ok) {
      const errorText = await clothingResponse.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Failed to fetch clothing items: ${clothingResponse.statusText}. Details: ${errorText}`);
    }
    
    const clothingData = await clothingResponse.json();
    console.log('Clothing data:', clothingData);
    
    return res.status(200).json(clothingData.clothing_items || []);
  } catch (error) {
    console.error('Error in clothing-items API:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch clothing items',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 