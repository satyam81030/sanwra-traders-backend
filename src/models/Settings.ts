import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "store" },
    whatsapp: { type: String, default: "8959630167" },
    phone: { type: String, default: "8959630167" },
    address: { type: String, default: "" },
    upiId: { type: String, default: "" },
    upiQrUrl: { type: String, default: "" },
    upiQrPublicId: { type: String, default: "" },
    paymentNote: {
      type: String,
      default: "UPI से पेमेंट करें, फिर ऑर्डर सबमिट करें / Pay via UPI, then submit your order.",
    },
  },
  { timestamps: true }
);

export const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export async function getOrCreateSettings() {
  let doc = await Settings.findOne({ key: "store" });
  if (!doc) {
    doc = await Settings.create({ key: "store" });
  }
  return doc;
}
