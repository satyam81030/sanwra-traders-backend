import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/auth";
import { getOrCreateSettings } from "../models/Settings";
import { deleteImage, resolveImageInput, uploadBuffer } from "../services/images";

export const settingsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});

function serialize(doc: Awaited<ReturnType<typeof getOrCreateSettings>>) {
  const o = doc.toObject();
  return {
    whatsapp: o.whatsapp,
    phone: o.phone,
    address: o.address,
    upiId: o.upiId,
    upiQrUrl: o.upiQrUrl,
    paymentNote: o.paymentNote,
    updatedAt: o.updatedAt,
  };
}

/** Public store settings (contact + UPI) */
settingsRouter.get("/", async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ settings: serialize(settings) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load settings" });
  }
});

/** Admin update */
settingsRouter.put("/", requireAdmin, upload.single("upiQr"), async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    if (req.body?.whatsapp !== undefined)
      settings.whatsapp = String(req.body.whatsapp).trim();
    if (req.body?.phone !== undefined) settings.phone = String(req.body.phone).trim();
    if (req.body?.address !== undefined) settings.address = String(req.body.address).trim();
    if (req.body?.upiId !== undefined) settings.upiId = String(req.body.upiId).trim();
    if (req.body?.paymentNote !== undefined)
      settings.paymentNote = String(req.body.paymentNote).trim();

    if (req.file) {
      await deleteImage(settings.upiQrPublicId);
      const uploaded = await uploadBuffer(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      settings.upiQrUrl = uploaded.url;
      settings.upiQrPublicId = uploaded.publicId;
    } else if (req.body?.upiQrUrl !== undefined || req.body?.dataUrl !== undefined) {
      const resolved = await resolveImageInput({
        imageUrl: req.body?.upiQrUrl,
        dataUrl: req.body?.dataUrl,
      });
      if (resolved) {
        await deleteImage(settings.upiQrPublicId);
        settings.upiQrUrl = resolved.url;
        settings.upiQrPublicId = resolved.publicId;
      }
    }

    await settings.save();
    res.json({ settings: serialize(settings) });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Failed to update settings";
    res.status(500).json({ error: message });
  }
});
