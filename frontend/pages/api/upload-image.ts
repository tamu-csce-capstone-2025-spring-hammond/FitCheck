// pages/api/upload-image.ts

import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error parsing file" });
    }

    let file = files.file;
    if (Array.isArray(file)) {
      file = file[0];
    }

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileStream = fs.createReadStream(file.filepath);
    const formData = new FormData();
    formData.append("file", fileStream, file.originalFilename || "photo.jpg");

    try {
      console.log(`${backendUrl}upload-image`);
      console.log(formData.getHeaders());
      console.log("Boundary:", formData.getBoundary());
      const response = await fetch(`${backendUrl}upload-image`, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(), // Get headers with boundary
      });

      const result = await response.json();
      return res.status(200).json(result);
    } catch (e) {
      console.error("Upload to backend failed", e);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}
