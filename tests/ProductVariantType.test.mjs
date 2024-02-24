import {
  ProductVariantType,
  ProductVariantTypesInitializer,
} from "../models/ProductVariantType.mjs";
import { Divider, PASS, FAIL } from "./fmt.mjs";
import { config } from "dotenv";
config();

async function testInsert() {
  Divider("TEST: INSERT");
  console.time("Create Product Variant Type");
  const { product_variant_type, error } = await ProductVariantType.createOne(
    "pant sizes",
    "Available pant sizes",
  );
  console.timeEnd("Create Product Variant Type");
  Divider("RESULT: INSERT");
  if (error) return console.error(" FAILED INSERT TEST ❌\n", error) || false;
  console.log("PASSED INSERT TEST ✅\n", product_variant_type);
  return true;
}

async function testGet() {
  Divider("TEST: GET ONE");
  const { variant_type, error } = await ProductVariantType.getById(1);
  Divider("RESULT: GET ONE");
  if (error) return console.error("❌ FAILED GET ONE TEST ❌") || false;
  console.log("PASSED GET ONE TEST ✅\n", variant_type);
  return true;
}

async function testUpdate() {
  Divider("TEST: UPDATE ONE");
  console.time("ProductVariantTypes - UPDATE ONE");
  const { variant_type, error } = await ProductVariantType.updateOne(1, {
    name: "shirt size",
  });
  console.timeEnd("ProductVariantTypes - UPDATE ONE");
  Divider("RESULT: UPDATE ONE");
  if (error) return FAIL("UPDATE ONE", error);
  else return PASS("UPDATE ONE", variant_type);
}

async function main() {
  await ProductVariantTypesInitializer();
  await Promise.all([testInsert(), testGet(), testUpdate()]);
}
main();
