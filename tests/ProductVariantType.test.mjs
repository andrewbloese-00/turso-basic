import {
  ProductVariantType,
  ProductVariantTypesInitializer,
} from "../models/ProductVariantType.mjs";
import { Divider } from "./fmt";
import { config } from "dotenv";
config();

async function testInsert() {
  Divider("TEST: INSERT");
  console.time("Create Product Variant Type");
  const { product_variant_type, error } = await ProductVariantType.createOne(
    "Shirt Size",
    "Available shirt sizes",
  );
  console.timeEnd("Create Product Variant Type");
  Divider("RESULT: INSERT");
  if (error) return console.error(" FAILED INSERT TEST ❌\n", error) || false;
  console.log("PASSED INSERT TEST ✅\n", product_variant_type);
  return true;
}

async function testGet() {
  Divider("TEST: GET ONE");
  const { product_variant_type, error } = await ProductVariantType.getById(1);
  Divider("RESULT: GET ONE");
  if (error) return console.error("❌ FAILED GET ONE TEST ❌") || false;
  console.log("PASSED GET ONE TEST ✅\n", product_variant_type);
  return true;
}

async function main() {
  const res = await ProductVariantTypesInitializer();
  console.log(res);
  const inserted = await testInsert();
  if (inserted) await testGet();
}
main();
