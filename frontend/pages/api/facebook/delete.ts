import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const baseUrl = process.env.BACKEND_URL?.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/facebook/delete?name=${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Failed to delete product' });
  }
} 