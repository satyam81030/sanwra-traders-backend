import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryEnabled, config } from "../config";

export type UploadedImage = { url: string; publicId: string };

function ensureUploadsDir(): void {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

function configureCloudinary(): void {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadedImage> {
  if (cloudinaryEnabled()) {
    configureCloudinary();
    const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: config.cloudinary.folder,
      resource_type: "image",
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  ensureUploadsDir();
  const safe = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const dest = path.join(config.uploadsDir, safe);
  fs.writeFileSync(dest, buffer);
  return { url: `/uploads/${safe}`, publicId: "" };
}

export async function resolveImageInput(input?: {
  imageUrl?: string;
  dataUrl?: string;
}): Promise<UploadedImage | null> {
  if (input?.dataUrl?.startsWith("data:image/")) {
    const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(input.dataUrl);
    if (!match) throw new Error("Invalid image data URL");
    const buffer = Buffer.from(match[2], "base64");
    return uploadBuffer(buffer, "upload.jpg", match[1]);
  }
  if (input?.imageUrl?.trim()) {
    return { url: input.imageUrl.trim(), publicId: "" };
  }
  return null;
}

export async function deleteImage(publicId?: string): Promise<void> {
  if (!publicId || !cloudinaryEnabled()) return;
  configureCloudinary();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("[images] Failed to delete Cloudinary asset:", err);
  }
}
