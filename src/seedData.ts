import { Product } from "./models/Product";

/** Placeholder product imagery (Unsplash — free to use for demos). */
const SAMPLE = [
  {
    name: "Indigo Khadi Shirt",
    description:
      "Handwoven khadi cotton in deep indigo. Soft collar, mother-of-pearl buttons, cut for everyday wear from market mornings to evening chai.",
    price: 1899,
    currency: "INR",
    size: "M",
    category: "shirts",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
  },
  {
    name: "Sand Linen Trousers",
    description:
      "Breathable sand-washed linen with a clean front crease. Mid-rise, tapered ankle — made for warm days and long walks.",
    price: 2499,
    currency: "INR",
    size: "L",
    category: "trousers",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
  },
  {
    name: "Marigold Block-Print Dress",
    description:
      "Cotton voile dress with marigold block print. Soft gathers at the waist, side pockets, and a hem that moves with you.",
    price: 3299,
    currency: "INR",
    size: "S",
    category: "dresses",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
  },
  {
    name: "Charcoal Wool Overshirt",
    description:
      "Heavyweight brushed wool overshirt in charcoal. Dual chest pockets, horn buttons — layer over tees or under a coat.",
    price: 4599,
    currency: "INR",
    size: "L",
    category: "outerwear",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
  },
  {
    name: "Cream Merino Crew",
    description:
      "Fine merino crewneck in warm cream. Light enough for layered days, soft enough for bare skin.",
    price: 2799,
    currency: "INR",
    size: "M",
    category: "knitwear",
    available: false,
    imageUrl:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
  },
  {
    name: "Woven Leather Belt",
    description:
      "Vegetable-tanned leather belt with a woven face and brushed brass buckle. Fits 28–36 waist with spare holes.",
    price: 999,
    currency: "INR",
    size: "One size",
    category: "accessories",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  },
] as const;

export async function seedProductsIfEmpty(): Promise<number> {
  const count = await Product.countDocuments();
  if (count > 0) return 0;
  await Product.insertMany([...SAMPLE]);
  console.log(`[seed] Inserted ${SAMPLE.length} sample products`);
  return SAMPLE.length;
}
