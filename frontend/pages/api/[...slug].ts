import { NextApiRequest, NextApiResponse } from 'next';

// Pass-through to the backend
export default async function backendRoute(req: NextApiRequest, res: NextApiResponse)
{
    if (!process.env.BACKEND_URL)
    {
        return res.status(500).json({ error: 'BACKEND_URL is not set' });
    }
    if (!req.url)
    {
        return res.status(500).json({ error: 'URL is not set' });
    }

    // Add the `Authorization` header to the request
    const loginToken = req.cookies["login_token"] || "";
    const headers = new Headers(req.headers as HeadersInit);
    headers.set('Authorization', `Bearer ${loginToken}`);

    // Get the backend URL
    const backend_url = req.url.replace(/^\/api\//, '');
    const url = `${process.env.BACKEND_URL}${backend_url}`;
    console.log(`Passing request to ${url}`);

    // Pass the request
    const response = await fetch(url, {
        method: req.method,
        headers: headers,
        body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });

    // Pass the response
    let responseBody;
    try {
        responseBody = await response.json();
    } catch {
        console.log("Non-JSON response");
        res.status(response.status).send(response.statusText);
        return;
    }
    res.status(response.status).json(responseBody);
};
