import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('BACKEND_URL not configured');
    }

    const loginToken = req.cookies.login_token;
    console.log('Raw token:', loginToken); // Debug the actual token value

    if (!loginToken) {
      return res.status(401).json({ message: 'No authorization token found' });
    }

    // Ensure token is properly formatted with 'Bearer' prefix if required
    const formattedToken = loginToken.startsWith('Bearer ') ? loginToken : `Bearer ${loginToken}`;
    console.log('Formatted token:', formattedToken);

    const backendUrl = `${process.env.BACKEND_URL}/users/me`.replace(/\/+$/, '');
    console.log('Fetching from:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': formattedToken,
        'Content-Type': 'application/json',
      },
    });

    const responseBody = await response.text();
    console.log('Backend response:', response.status, responseBody);

    if (!response.ok) {
      return res.status(response.status).json({ 
        message: 'Backend request failed',
        error: responseBody
      });
    }

    try {
      const userData = JSON.parse(responseBody);
      return res.status(200).json(userData);
    } catch (e) {
      console.error('Failed to parse JSON:', responseBody);
      throw new Error('Invalid JSON response from backend');
    }

  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}