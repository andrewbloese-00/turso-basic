import { TestProducts, DropProducts } from "./Product.test.mjs";
import {
  ProductVariantTypeTests,
  DropProductVariantTypes,
} from "./ProductVariantType.test.mjs";
import {
  ProductVariantsTests,
  DropProductVariants,
} from "./ProductVariant.test.mjs";
import { Divider } from "./fmt.mjs";
import { ProductVariantTypesInitializer } from "../models/ProductVariantType.mjs";
import { ProductVariantInitializer } from "../models/ProductVariant.mjs";
import { ProductInitializer } from "../models/Product.mjs";

async function initializeDB() {
  await ProductInitializer();
  await ProductVariantTypesInitializer();
  await ProductVariantInitializer();
}

async function test() {
  console.time("Setup DB");
  await initializeDB();
  console.timeEnd("Setup DB");

  console.time("Turso Tests");
  Divider("Products");
  await TestProducts();

  Divider("Product Variant Type");
  await ProductVariantTypeTests();

  Divider("Product Variants");
  await ProductVariantsTests();
  console.timeEnd("Turso Tests");

  Divider("CLEANUP");
  await DropProductVariants();
  await DropProductVariantTypes();
  await DropProducts();
}

test();
