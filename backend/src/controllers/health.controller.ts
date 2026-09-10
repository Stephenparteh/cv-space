import type { Request, Response } from "express";
import { getDbStatus } from "../config/db.js";

export const getHealth = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: getDbStatus(),
  });
};
