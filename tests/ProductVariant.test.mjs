import { ProductVariant } from "../models/ProductVariant.mjs";
import { turso } from "../turso-client.mjs";
import { Divider, FAIL, PASS } from "./fmt.mjs";

async function testInsertSingle() {
  Divider("TEST: INSERT");
  console.time("Create new Product Variant");
  const { variant, error } = await ProductVariant.insertOne("Medium", 1, 1);
  console.timeEnd("Create new Product Variant");
  Divider("RESULT: INSERT ONE");
  if (error) return FAIL("INSERT ONE", error);
  return PASS("INSERT ONE", variant);
}

async function testJoin() {
  console.time("Variants JOIN");
  const { variants, error } = await ProductVariant.getVariants(1);
  console.timeEnd("Variants JOIN");
  if (error) return FAIL("JOIN Variants", error);
  return PASS("JOIN Variants", variants);
}

async function testUpdate() {
  console.time("Variant Update");
  const { variant, error } = await ProductVariant.updateOne(1, {
    variant_name: "Small",
  });
  console.timeEnd("Variant Update");
  if (error) return FAIL("Variant Update", error);
  return PASS("Variant Update", variant);
}

export async function DropProductVariants() {
  Divider("Cleanup ProductVariants");
  try {
    await turso.execute("DROP TABLE ProductVariants");
    console.log("successfully dropped test data");
  } catch (error) {
    console.warn("Failed to Cleanup ProductVariants... ");
    console.error(error);
    return false;
  }
}

export async function ProductVariantsTests() {
  await testInsertSingle();
  await testJoin();
  await testUpdate();
}
