import { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!process.env.BACKEND_URL) {
        console.error('BACKEND_URL not set');
        return res.status(500).json({ error: 'Backend URL not configured' });
    }

    const slug = req.query.slug as string[];
    if (!slug) {
        return res.status(400).json({ error: 'No slug provided' });
    }

    // Construct the backend URL with /api prefix
    const path = `api/ebay/${slug.join('/')}`;
    const url = new URL(path, process.env.BACKEND_URL).toString();
    console.log(`Passing eBay request to ${url}`);

    // Prepare headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Get the login token from the cookie
    const loginToken = req.cookies.login_token;
    if (loginToken) {
        headers['Authorization'] = `Bearer ${loginToken}`;
    }

    try {
        const response = await fetch(url, {
            method: req.method,
            headers: headers,
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Error in eBay API route:', error);
        return res.status(500).json({ 
            error: 'Failed to process eBay request',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 