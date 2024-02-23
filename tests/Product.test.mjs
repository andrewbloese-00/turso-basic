import { Product, ProductInitializer } from "../models/Product.mjs";
import { config } from "dotenv";
import { PASS, FAIL, Divider } from "./fmt.mjs";
config();
async function TestProduct() {
  await ProductInitializer();
  await testGetSlug();
  await testUpdateOne();
}

async function testGetSlug() {
  Divider("Get Product via Slug");
  console.time("Get Product via Slug");
  const { product, error } = await Product.getBySlug("test_product");
  console.timeEnd("Get Product via Slug");
  if (error) return FAIL("GET PRODUCT SLUG", error);
  Divider("Results: Get Product Via Slug");
  return PASS("GET PRODUCT SLUG", product);
}

async function testUpdateOne() {
  Divider("Update Product");
  console.time("Update Product");
  const { product, error } = await Product.updateOne(1, {
    price: 120.225,
  });
  console.timeEnd("Update Product");
  if (error) return FAIL("Update Product", error);
  return PASS("Update Product", product);
}

async function testInsertOne() {
  const p1 = await Product.insertOne(
    "Test Product",
    124.99,
    "A test productsx",
  );
}

TestProduct();
