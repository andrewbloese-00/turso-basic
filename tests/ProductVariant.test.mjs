import {
  ProductVariant,
  ProductVariantInitializer,
} from "../models/ProductVariant.mjs";
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

async function main() {
  await ProductVariantInitializer();
  // await testInsertSingle();
  await testJoin();
}
main();
