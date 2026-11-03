import { Product } from "./models/Product";
import { getOrCreateSettings } from "./models/Settings";

const SAMPLE = [
  {
    name: "Slim Fit Blue Jeans",
    description: "Comfort stretch denim, everyday men's jeans — mid wash, classic five-pocket.",
    price: 1299,
    currency: "INR",
    size: "32",
    category: "jeans",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
  },
  {
    name: "Checked Casual Shirt",
    description: "Soft cotton check shirt for daily wear. Regular fit, button-down collar.",
    price: 899,
    currency: "INR",
    size: "L",
    category: "shirts",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
  },
  {
    name: "Graphic Cotton Tee",
    description: "Breathable cotton t-shirt with bold print. Soft hand-feel, regular fit.",
    price: 499,
    currency: "INR",
    size: "M",
    category: "tshirts",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  },
  {
    name: "Track Lower — Navy",
    description: "Comfortable men's lower for home and travel. Elastic waist, side pockets.",
    price: 699,
    currency: "INR",
    size: "L",
    category: "lowers",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80",
  },
  {
    name: "Polo Collar Tee Pack Feel",
    description: "Smart-casual polo knit — clean collar, short sleeves, everyday colour.",
    price: 799,
    currency: "INR",
    size: "L",
    category: "tshirts",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&q=80",
  },
  {
    name: "Chino Lower — Beige",
    description: "Smart beige chino-style lower. Straight cut for office-casual days.",
    price: 1099,
    currency: "INR",
    size: "34",
    category: "lowers",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
  },
] as const;

export async function seedProductsIfEmpty(): Promise<number> {
  const count = await Product.countDocuments();
  if (count > 0) return 0;
  await Product.insertMany([...SAMPLE]);
  console.log(`[seed] Inserted ${SAMPLE.length} sample products`);
  return SAMPLE.length;
}

export async function seedSettings(): Promise<void> {
  await getOrCreateSettings();
}
