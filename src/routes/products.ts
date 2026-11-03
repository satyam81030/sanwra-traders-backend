import { Router } from "express";
import multer from "multer";
import { PRODUCT_CATEGORIES, Product } from "../models/Product";
import { requireAdmin } from "../middleware/auth";
import { deleteImage, resolveImageInput, uploadBuffer } from "../services/images";

export const productsRouter = Router();

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

const CATEGORIES = PRODUCT_CATEGORIES;

function serialize(doc: InstanceType<typeof Product>) {
  const o = doc.toObject();
  return {
    id: String(o._id),
    name: o.name,
    description: o.description,
    price: o.price,
    currency: o.currency,
    size: o.size,
    category: o.category,
    available: o.available,
    imageUrl: o.imageUrl,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

function parseBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
}

productsRouter.get("/", async (req, res) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.available === "true") filter.available = true;
    if (req.query.available === "false") filter.available = false;
    if (typeof req.query.category === "string" && req.query.category) {
      filter.category = req.query.category;
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ products: products.map(serialize) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list products" });
  }
});

productsRouter.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ product: serialize(product) });
  } catch {
    res.status(400).json({ error: "Invalid product id" });
  }
});

productsRouter.post("/", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim();
    const price = Number(req.body?.price);
    const size = String(req.body?.size || "").trim();
    const category = String(req.body?.category || "").trim();
    const available = parseBool(req.body?.available, true);
    const currency = String(req.body?.currency || "INR").trim() || "INR";

    if (!name || !description || !size || !category || Number.isNaN(price) || price < 0) {
      res.status(400).json({
        error: "name, description, price (>=0), size, and category are required",
      });
      return;
    }
    if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(", ")}` });
      return;
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const uploaded = await uploadBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
      imageUrl = uploaded.url;
      imagePublicId = uploaded.publicId;
    } else {
      const resolved = await resolveImageInput({
        imageUrl: req.body?.imageUrl,
        dataUrl: req.body?.dataUrl,
      });
      if (resolved) {
        imageUrl = resolved.url;
        imagePublicId = resolved.publicId;
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      currency,
      size,
      category,
      available,
      imageUrl,
      imagePublicId,
    });
    res.status(201).json({ product: serialize(product) });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Failed to create product";
    res.status(500).json({ error: message });
  }
});

productsRouter.put("/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (req.body?.name !== undefined) product.name = String(req.body.name).trim();
    if (req.body?.description !== undefined)
      product.description = String(req.body.description).trim();
    if (req.body?.price !== undefined) {
      const price = Number(req.body.price);
      if (Number.isNaN(price) || price < 0) {
        res.status(400).json({ error: "price must be a non-negative number" });
        return;
      }
      product.price = price;
    }
    if (req.body?.size !== undefined) product.size = String(req.body.size).trim();
    if (req.body?.category !== undefined) {
      const category = String(req.body.category).trim();
      if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
        res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(", ")}` });
        return;
      }
      product.category = category;
    }
    if (req.body?.available !== undefined)
      product.available = parseBool(req.body.available, product.available);
    if (req.body?.currency !== undefined)
      product.currency = String(req.body.currency).trim() || product.currency;

    if (req.file) {
      await deleteImage(product.imagePublicId);
      const uploaded = await uploadBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
      product.imageUrl = uploaded.url;
      product.imagePublicId = uploaded.publicId;
    } else if (req.body?.imageUrl !== undefined || req.body?.dataUrl !== undefined) {
      const resolved = await resolveImageInput({
        imageUrl: req.body?.imageUrl,
        dataUrl: req.body?.dataUrl,
      });
      if (resolved) {
        await deleteImage(product.imagePublicId);
        product.imageUrl = resolved.url;
        product.imagePublicId = resolved.publicId;
      }
    }

    await product.save();
    res.json({ product: serialize(product) });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Failed to update product";
    res.status(500).json({ error: message });
  }
});

productsRouter.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    await deleteImage(product.imagePublicId);
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Invalid product id" });
  }
});
