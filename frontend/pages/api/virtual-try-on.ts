// pages/api/virtual-try-on.ts

import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = { resultUrl?: string; error?: string };

// ← this must be the hf.space URL for your *duplicated* Space
const PREDICT_URL =
  "https://anishfish-kolors-virtual-try-on.hf.space/api/predict/tryon";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { personImageUrl, clothingImageUrl } = req.body as {
    personImageUrl:  string;
    clothingImageUrl: string;
  };

  try {
    // 1) Call the Space on hf.space
    const spaceRes = await fetch(PREDICT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          { path: personImageUrl },
          { path: clothingImageUrl },
          0,
          true
        ],
      }),
    });

    if (!spaceRes.ok) {
      const txt = await spaceRes.text();
      throw new Error(`Space predict failed: ${spaceRes.status} ${txt}`);
    }

    // 2) Parse the JSON
    const json = await spaceRes.json();
    const first = json.data?.[0];
    let resultUrl: string;

    if (typeof first === 'string') {
      // sometimes it's directly a data‑URI
      resultUrl = first;
    } else if (first && typeof first === 'object' && 'url' in first) {
      // often it's { url: "https://..." }
      resultUrl = (first as any).url;
    } else {
      throw new Error("Unexpected response shape");
    }

    // 3) Return to your React component
    return res.status(200).json({ resultUrl });
  } catch (err: any) {
    console.error("virtual-try-on error:", err);
    return res.status(500).json({ error: err.message });
  }
}
