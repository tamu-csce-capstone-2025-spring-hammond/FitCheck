// pages/api/virtual-try-on.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// We want to stream the raw multipart body through
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const BACKEND_URL = process.env.BACKEND_URL;
  if (!BACKEND_URL) {
    return res.status(500).json({ error: 'Backend URL not configured' });
  }

  const url = `${BACKEND_URL.replace(/\/$/, '')}/upload-user-selfie`;

  // Build headers: forward auth *and* content-type
  const headers: Record<string, string> = {};

  // Get the login token from the cookie
  const loginToken = req.cookies.login_token;
  if (loginToken) {
      headers['Authorization'] = `Bearer ${loginToken}`;
  }

  // Copy relevant headers from the incoming request
  if (req.headers.authorization)
  {
      headers['Authorization'] = req.headers.authorization;
  }
  
  // **CRITICAL** forward the multipart boundary
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'] as string;
  }

  try {
    const backendRes = await fetch(url, {
      method: 'POST',
      headers,
      // Proxy the raw request stream
      body: req as any,
      duplex: 'half', // needed for streaming bodies in Next.js
    });

    // Mirror status and headers
    res.status(backendRes.status);
    const contentType = backendRes.headers.get('Content-Type');
    if (contentType) res.setHeader('Content-Type', contentType);

    // Stream the response body back
    const buffer = await backendRes.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err: any) {
    console.error('Error proxying to upload-user-selfie:', err);
    return res.status(500).json({ error: err.message });
  }
}
