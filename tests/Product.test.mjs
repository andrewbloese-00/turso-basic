import { Product, ProductInitializer } from "../models/Product.mjs";
import { config } from "dotenv";
import { PASS, FAIL, Divider } from "./fmt.mjs";
import { turso } from "../turso-client.mjs";
config();
export async function TestProducts() {
  await testInsertOne();
  await testGetSlug();
  await testUpdateOne();
  await testInsertMany();
  await testGetAll();
  await testGetCategory();
  await testDeleteOne();
}

async function testGetSlug() {
  Divider("Get Product via Slug");
  console.time("Get Product via Slug");
  const { product, error } = await Product.getBySlug("test_product");
  console.timeEnd("Get Product via Slug");
  if (error) return FAIL("GET PRODUCT SLUG", error);
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
  Divider("Product Insert One");
  const { product, error } = await Product.insertOne(
    "Test Product",
    124.99,
    "A test product",
    "test",
  );
  if (error) return FAIL("Insert One Product", product);
  return PASS("Insert One Product", product);
}

async function testInsertMany() {
  Divider("Product Insert Many ");
  console.time("Insert Many Products");
  const { products, error } = await Product.insertMany(
    [
      {
        name: "Graphic T-Shirt",
        price: 24.99,
        description: "A t-shirt with a pattern printed on it",
        category: "Apparel",
      },
      {
        name: "Super Comfortable Pants",
        price: 24.99,
        description: "The most comfortable pants ever.",
        category: "Apparel",
      },
      {
        name: "You're not my dad - dad cap",
        price: 24.99,
        description: 'Dad Cap With The Text "you\'re not my dad" on it',
        category: "Apparel",
      },
    ],
    true,
  );
  console.timeEnd("Insert Many Products");
  if (error) return FAIL("Insert Many Products", error);
  return PASS("Insert Many Products", products);
}

async function testGetCategory() {
  Divider("Get Products Category");
  console.time("Get Products Category");
  const { products, error } = await Product.getCategory(
    "Apparel",
    "name",
    "ASC",
  );
  console.timeEnd("Get Products Category");
  if (error) return FAIL("Get Products Category", error);
  return PASS("Get Products Category", products);
}

async function testGetAll() {
  Divider("Get All Products");
  console.time("Get All Products ");
  const { products, error } = await Product.getAll("name", "ASC");
  console.timeEnd("Get All Products ");
  if (error) return FAIL("Get All Products", error);
  return PASS("Get All Products", products);
}

async function testDeleteOne() {
  Divider("Products Delete One");
  console.time("Delete One Product");
  const { deleteCount, error } = await Product.deleteOne(1);
  console.timeEnd("Delete One Product");
  if (error) return FAIL("Delete One Product", error);
  return PASS("Delete One Product", deleteCount);
}

export async function DropProducts() {
  Divider("Cleanup Products");
  try {
    await turso.execute("DROP TABLE Products");
    console.log("successfully dropped test data");
  } catch (error) {
    console.warn("Failed to Cleanup ProductVariants... ");
    console.error(error);
    return false;
  }
}
