import { NextApiRequest, NextApiResponse } from 'next';

// Pass-through to the backend, but set a cookie if the login succeeds
export default async function loginRoute(req: NextApiRequest, res: NextApiResponse)
{
    if (!process.env.BACKEND_URL)
    {
        return res.status(500).json({ error: 'BACKEND_URL is not set' });
    }
    if (req.method !== 'POST')
    {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Get the backend URL
    const url = `${process.env.BACKEND_URL}login`;

    // Pass the request
    const response = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
    });
    const json = await response.json();

    // If the login was successful, set a cookie
    if (response.status === 200)
    {
        res.setHeader('Set-Cookie', `login_token=${json.user.login_token}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=8640000`);
    }

    res.status(response.status).json(json);
};
