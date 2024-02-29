import { Product, ProductInitializer } from "../models/Product.mjs";
import {
  ProductVariant,
  ProductVariantInitializer,
} from "../models/ProductVariant.mjs";
import {
  ProductVariantType,
  ProductVariantTypesInitializer,
} from "../models/ProductVariantType.mjs";
import { groupBy } from "../utils/groupBy.mjs";

import { DropProducts } from "./Product.test.mjs";
import { DropProductVariants } from "./ProductVariant.test.mjs";
import { DropProductVariantTypes } from "./ProductVariantType.test.mjs";
import { FAIL, PASS } from "./fmt.mjs";

async function initializeDB() {
  console.time("Initialize DB");
  await ProductInitializer();
  await ProductVariantTypesInitializer();
  await ProductVariantInitializer();
  console.timeEnd("Initialize DB");
}

async function teardownDB() {
  console.time("Teardown DB");
  console.log("DROP ProductVariants...");
  await DropProductVariants();
  console.log("DROP ProductVariantTypes...");
  await DropProductVariantTypes();
  console.log("DROP Products...");
  await DropProducts();
  console.timeEnd("Teardown DB");
}

async function ProductsAdvancedTest() {
  //create 3 products
  const { products, error } = await Product.insertMany(
    [
      {
        name: "T-Shirt",
        price: 24.99,
        category: "Apparel",
        description: "A basic t-shirt, comes in black or white.",
      },
      {
        name: "Sweatshirt",
        price: 49.99,
        category: "Apparel",
        description: "A basic sweatshirt, comes in black or white.",
      },
      {
        name: "Hoodie",
        price: 54.99,
        category: "Apparel",
        description: "A basic hoodie, comes in black or white.",
      },
    ],
    true,
  );
  if (error) return FAIL("INSERT PRODUCTS", error);
  PASS("INSERT PRODUCTS");

  //create two product variant types
  const shirtSize = await ProductVariantType.createOne(
    "Size",
    "The sizing for apparel products",
  );
  const color = await ProductVariantType.createOne(
    "Color",
    "The color of some product",
  );
  if (color.error || shirtSize.error)
    return FAIL("INSERT PRODUCT VARIANT TYPES", {
      color: color.error,
      shirtSize: shirtSize.error,
    });
  PASS("INSERT PRODUCT VARIANT TYPES");
  //create variants for each of the products
  const colorID = color.product_variant_type.id;
  const shirtSizeID = shirtSize.product_variant_type.id;

  for (const product of products) {
    await ProductVariant.insertMany(
      [
        {
          product_id: product.id,
          variant_name: "Small",
          variant_type: shirtSizeID,
          price_mod: 0,
        },
        {
          product_id: product.id,
          variant_name: "Medium",
          variant_type: shirtSizeID,
          price_mod: 0,
        },
        {
          product_id: product.id,
          variant_name: "Large",
          variant_type: shirtSizeID,
          price_mod: 0,
        },
        {
          product_id: product.id,
          variant_name: "Black",
          variant_type: colorID,
          price_mod: 0,
        },
        {
          product_id: product.id,
          variant_name: "White",
          variant_type: colorID,
          price_mod: 0,
        },
      ],
      true,
    );
  }

  for (let i = 0; i < products.length; i++) {
    const { variants, error } = await ProductVariant.getVariants(
      products[i].id,
    );
    if (error) {
      console.warn(`Error on getting variants for request #${i + 1}`);
      console.error(error);
      continue;
    }
    products[i]["variants"] = variants;
    console.log(
      "Product with grouped variants:\n",
      JSON.stringify(products[i], null, 4),
    );
  }
}

async function main() {
  await initializeDB();
  await ProductsAdvancedTest();
  await teardownDB();
}
main();
