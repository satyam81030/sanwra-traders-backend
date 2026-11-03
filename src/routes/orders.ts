import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { Order } from "../models/Order";

export const ordersRouter = Router();

function serialize(doc: InstanceType<typeof Order>) {
  const o = doc.toObject();
  return {
    id: String(o._id),
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    items: o.items,
    total: o.total,
    currency: o.currency,
    status: o.status,
    paymentMethod: o.paymentMethod,
    note: o.note,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

/** Public: submit order after UPI payment */
ordersRouter.post("/", async (req, res) => {
  try {
    const customerName = String(req.body?.customerName || "").trim();
    const customerPhone = String(req.body?.customerPhone || "").trim();
    const note = String(req.body?.note || "").trim();
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (!customerName || !customerPhone) {
      res.status(400).json({ error: "Name and phone are required" });
      return;
    }
    if (items.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    const normalized = items.map(
      (raw: {
        productId?: string;
        name?: string;
        price?: number;
        size?: string;
        quantity?: number;
        imageUrl?: string;
      }) => {
        const name = String(raw?.name || "").trim();
        const price = Number(raw?.price);
        const quantity = Math.max(1, Number(raw?.quantity) || 1);
        if (!name || Number.isNaN(price) || price < 0) {
          throw new Error("Each item needs name and valid price");
        }
        return {
          productId: String(raw?.productId || ""),
          name,
          price,
          size: String(raw?.size || ""),
          quantity,
          imageUrl: String(raw?.imageUrl || ""),
        };
      }
    );

    const total = normalized.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      customerName,
      customerPhone,
      items: normalized,
      total,
      note,
      status: "pending",
      paymentMethod: "upi",
    });

    res.status(201).json({ order: serialize(order) });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Failed to create order";
    res.status(400).json({ error: message });
  }
});

/** Admin: list orders */
ordersRouter.get("/", requireAdmin, async (req, res) => {
  try {
    const filter: Record<string, unknown> = {};
    if (typeof req.query.status === "string" && req.query.status) {
      filter.status = req.query.status;
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders: orders.map(serialize) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list orders" });
  }
});

/** Admin: update status */
ordersRouter.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const status = String(req.body?.status || "").trim();
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      res.status(400).json({ error: "status must be pending, confirmed, or cancelled" });
      return;
    }
    order.status = status;
    await order.save();
    res.json({ order: serialize(order) });
  } catch {
    res.status(400).json({ error: "Invalid order id" });
  }
});
