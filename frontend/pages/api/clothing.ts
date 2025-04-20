import { NextApiRequest, NextApiResponse } from "next";

export default async function backendRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Request method:", req.method);
  console.log("Request body:", req.body);
  try {
    const { slug } = req.query;
    console.log("slug:", slug);

    const path = Array.isArray(slug) ? slug.join("/") : slug;

    // Ensure proper URL formatting with trailing slash
    const backendUrl = `${process.env.BACKEND_URL}${path}`.replace(
      /([^:]\/)\/+/g,
      "$1"
    );

    console.log("Passing request to", backendUrl);

    const loginToken = req.cookies.login_token;

    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        Authorization: loginToken || "",
        "Content-Type": "application/json",
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    // Log the response status and headers
    console.log("Backend response status:", response.status);
    console.log("Backend response headers:", response.headers);

    // Try to parse the response as JSON
    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error("Failed to parse response as JSON:", error);
      // If we can't parse as JSON, try to get the text
      const text = await response.text();
      console.error("Response text:", text);
      throw new Error(`Backend returned non-JSON response: ${text}`);
    }

    // Log the parsed data
    console.log("Backend response data:", data);

    res.status(response.status).json(data);
  } catch (error) {
    console.error("API route error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
