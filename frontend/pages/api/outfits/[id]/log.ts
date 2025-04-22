import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;
  const { date } = req.body;

  try {
    // Check if outfit exists and belongs to the user
    const outfit = await prisma.outfit.findUnique({
      where: {
        id: Number(id),
        user_id: Number(session.user.id),
      },
    });

    if (!outfit) {
      return res.status(404).json({ message: "Outfit not found" });
    }

    // Create OOTD entry
    const ootd = await prisma.ootd.create({
      data: {
        outfit_id: Number(id),
        user_id: Number(session.user.id),
        date: new Date(date),
      },
    });

    return res.status(200).json(ootd);
  } catch (error) {
    console.error("Error logging outfit:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} 