import mongoose, { Schema, type InferSchemaType } from "mongoose";

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
      enum: ["shirts", "trousers", "dresses", "outerwear", "knitwear", "accessories", "other"],
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
