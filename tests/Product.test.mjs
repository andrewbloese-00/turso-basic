import { Product, ProductInitializer } from "../models/Product.mjs";
import { config } from "dotenv";
config();
async function TestProduct() {
  await ProductInitializer();

  // const p1 = await Product.insertOne(
  //   "Test Product",
  //   124.99,
  //   "A test productsx",
  // );
  const getOne = await Product.getBySlug("test_product");
  console.log(getOne);
}
TestProduct();
