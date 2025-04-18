import { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

// Pass-through to the backend
export default async function handler(req: NextApiRequest, res: NextApiResponse)
{
    // Check if BACKEND_URL is set
    if (!process.env.BACKEND_URL)
    {
        console.error('BACKEND_URL is not set');
        return res.status(500).json({ error: 'Backend URL not configured' });
    }

    // Get the slug from the request
    const slug = req.query.slug as string[];
    if (!slug)
    {
        return res.status(400).json({ error: 'No slug provided' });
    }

    // Construct the backend URL
    const url = new URL(join(...slug), process.env.BACKEND_URL).toString();
    console.log(`Passing request to ${url}`);

    // Prepare headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Copy relevant headers from the incoming request
    if (req.headers.authorization)
    {
        headers['Authorization'] = req.headers.authorization;
    }

    try {
        // Prepare the request body for non-GET requests
        let body = undefined;
        if (req.method !== 'GET' && req.body)
        {
            body = JSON.stringify(req.body);
        }

        // Make the request to the backend
        const response = await fetch(url, {
            method: req.method,
            headers: headers,
            body: body,
        });

        // Get the response data
        const data = await response.json();

        // Forward the status code and data
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Error in API route:', error);
        return res.status(500).json({ 
            error: 'Failed to process request',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
