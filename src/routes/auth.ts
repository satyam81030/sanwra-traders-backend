import { Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { requireAdmin } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  if (
    email !== config.adminEmail.toLowerCase() ||
    password !== config.adminPassword
  ) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ email, role: "admin" }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  res.json({
    token,
    admin: { email, role: "admin" as const },
  });
});

authRouter.get("/me", requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});
