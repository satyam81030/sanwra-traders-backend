import path from "path";

function requiredInProd(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    console.warn(`[config] ${name} is not set — using insecure fallback. Set it before real traffic.`);
  }
  return fallback;
}

export const config = {
  port: Number(process.env.PORT) || 4311,
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  mongodbUri: process.env.MONGODB_URI?.trim() || "",
  adminEmail: requiredInProd("ADMIN_EMAIL", "admin@sanwratraders.com"),
  adminPassword: requiredInProd("ADMIN_PASSWORD", "changeme-admin"),
  jwtSecret: requiredInProd("JWT_SECRET", "dev-only-change-me-to-a-long-random-string"),
  jwtExpiresIn: "7d" as const,
  corsOrigins: (process.env.CORS_ORIGIN || "http://127.0.0.1:4312,http://localhost:4312")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() || "",
    apiKey: process.env.CLOUDINARY_API_KEY?.trim() || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET?.trim() || "",
    folder: process.env.CLOUDINARY_FOLDER?.trim() || "sanwra-traders",
  },
  uploadsDir: path.join(process.cwd(), "uploads"),
};

export function cloudinaryEnabled(): boolean {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  return Boolean(cloudName && apiKey && apiSecret);
}
