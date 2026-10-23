import "dotenv/config";
import { connectDb, disconnectDb } from "./db";
import { seedProductsIfEmpty } from "./seedData";
import { Product } from "./models/Product";

async function run() {
  await connectDb();
  const inserted = await seedProductsIfEmpty();
  const total = await Product.countDocuments();
  console.log(`Seed complete. Inserted ${inserted}. Total products: ${total}`);
  await disconnectDb();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
