import { NextApiRequest, NextApiResponse } from "next";

export default async function backendRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Request method:", req.method);
  try {
    const { slug } = req.query;
    console.log("slug:", slug);

    const path = Array.isArray(slug) ? slug.join("/") : slug;

    // Ensure proper URL formatting by joining with slash
    const backendUrl = `${process.env.BACKEND_URL}/${path}`.replace(
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

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("API route error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
