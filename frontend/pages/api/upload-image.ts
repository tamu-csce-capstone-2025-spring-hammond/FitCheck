import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingMessage } from "http";

export const config = {
  api: {
    bodyParser: false, // don't parse the request body
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${backendUrl}/upload-image`, {
      method: "POST",
      headers: {
        ...req.headers, 
      },
      body: req as unknown as BodyInit,
      duplex: "half",
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
}
