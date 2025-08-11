import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "../../../lib/mongoose";
import { Request } from "../../../models/Request";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const requests = req.body; 

    if (!Array.isArray(requests)) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const savedRequests = await Promise.all(
      requests.map((req: any) => {
        const newRequest = new Request({
          firewallId: req.id,
          name: req.name,
          labels: req.labels,
          created: new Date(req.created),
          publicIp: req.publicIp,
          duration: req.duration,
          requestedBy: req.requestedBy
        });
        return newRequest.save();
      })
    );

    return res.status(201).json({ message: "Requests saved", data: savedRequests });
  } catch (error) {
    console.error("Error saving requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
