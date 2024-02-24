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

async function test() {
  console.time("Turso Tests");
  Divider("Products");
  await TestProducts();

  Divider("Product Variant Type");
  await ProductVariantTypeTests();

  Divider("Product Variants");
  await ProductVariantsTests();

  Divider("CLEANUP");
  await DropProductVariants();
  await DropProductVariantTypes();
  await DropProducts();

  console.timeEnd("Turso Tests");
}

test();
