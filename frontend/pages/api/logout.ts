import { NextApiRequest, NextApiResponse } from 'next';

export default async function logoutRoute(req: NextApiRequest, res: NextApiResponse)
{
    // Remove the login token cookie
    res.setHeader('Set-Cookie', `login_token=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0`);
    res.status(200).json({ message: 'Logged out' });
};
