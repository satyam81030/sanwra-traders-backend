import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const PRODUCT_CATEGORIES = [
  "jeans",
  "tshirts",
  "shirts",
  "lowers",
  "trousers",
  "outerwear",
  "accessories",
  "other",
] as const;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    size: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: PRODUCT_CATEGORIES,
    },
    available: { type: Boolean, default: true },
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

export type ProductDoc = InferSchemaType<typeof productSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
