import { Router } from "express";
import { Product } from "../models/Product.mjs";
import { ProductVariantType } from "../models/ProductVariantType.mjs";
import { ProductVariant } from "../models/ProductVariant.mjs";

import { handleErr } from "../utils/handleErr.mjs";
export const productsRouter = Router();

/**
 * @route GET /api/products?category
 * @param {string|undefined} category - optional category of products to get
 * @param {"name"|"price"} sortBy sort by name or price; default name
 * @param {"ASC"|"DESC"} order ascending or descending order; default ascending
 */
productsRouter.route("/").get(async (req, res) => {
  const sortBy = req.query.sortBy || "name";
  const order = req.query.order ? req.query.order.toUpperCase() : "ASC";
  const { error, products } = await (req.query.category
    ? Product.getCategory(req.query.category, sortBy, order)
    : Product.getAll(sortBy, order));

  //optionally get all variants for each product as well
  if (req.query.extended) {
    for (let p = 0; p < products.length; p++) {
      const { variants, error } = await ProductVariant.getVariants(
        products[p].id,
      );
      if (error) continue;
      products[p]["variants"] = variants;
    }
  }

  if (error) return res.status(400).json({ error });
  return res.status(200).json({ products });
});

/**
 * @route /api/products/:slug
 * @description gets a product idenitified by its url 'slug' if it exists
 */
productsRouter.route("/:slug").get(async (req, res) => {
  const { product, error } = await Product.getBySlug(req.params.slug);
  if (error) return handleErr(req, res, "Product Not Found", 404);
  res.status(200).json({ product });
});

/**
 * @route POST /api/products/
 * @description Creates A New Product
 */
productsRouter.route("/").post(async (req, res) => {
  const { name, price, description, category } = req.body;
  if (!name || !price || !description || !category)
    return handleErr(req, res, "Invalid Request", 400);

  const { product, error } = await Product.insertOne(
    name,
    price,
    description,
    category,
  );
  if (error) return handleErr(req, res, error, 400);
  return res.status(201).json({ product });
});
const updateFields = ["name", "description", "category", "price"];

/**
 * @route PUT /api/products/:productId
 * @description updates a product given its id
 */
productsRouter.route("/:productId").put(async (req, res) => {
  let payload = {};
  if (!req.params.productId)
    return handleErr(req, res, "Invalid request, must provide product id", 400);

  updateFields.forEach((updateField) => {
    if (req.body[updateField]) payload[updateField] = req.body[updateField];
  });

  if (Object.keys(payload).length === 0) {
    return handleErr(req, res, "Invalid Request", 400);
  }

  const { product, error } = await Product.updateOne(
    req.params.productId,
    payload,
  );
  if (error) return handleErr(req, res, error);
  else res.status(200).json({ product });
});

/**
 * @route DELETE /api/products/:productId
 * @description deletes a product by its id, as well as any ProductVariants related to the product.
 */
productsRouter.route("/:productId").delete(async (req, res) => {
  if (!req.params.productId)
    return handleErr(
      req,
      res,
      "Invalid Request! Must provide product id.",
      400,
    );
  const { deleteCount, error } = await Product.deleteOne(req.params.productId);
  if (error) return res.status(400).json({ error });
  else res.status(200).json({ deleteCount });
});

/**
 * @route POST /api/products/variant-types
 * @description creates a new product variant type given name and description
 */
productsRouter.route("/variant-types").post(async (req, res) => {
  const { variant_type, error } = await ProductVariantType.createOne(
    req.body.name,
    req.body.description,
  );
  if (error) return handleErr(req, res, error);
  else return res.status(201).json({ variant_type });
});

/**
 * @route PUT /api/products/variant-types/:variant_id
 * @description updates the name and/or description of the specified product variant type
 */
productsRouter.route("/variant-types/:variant_id").put(async (req, res) => {
  if (!req.params.variant_id)
    return handleErr(req, res, "Must provide a variant id to update.", 400);
  let updates = {};
  if (req.body.name) updates["name"] = req.body.name;
  if (req.body.description) updates["description"] = req.body.description;

  //invalid update fields / no updates given
  if (Object.keys(updates).length === 0)
    return handleErr(
      req,
      res,
      "Updatable fields are 'name' and 'description', must provide at least one!",
      400,
    );

  const { variant_type, error } = await ProductVariantType.updateOne(
    req.params.variant_id,
    updates,
  );
  if (error) return handleErr(req, res, error);
  return res.status(200).json({ variant_type });
});

/**
 * @route POST /api/products/variants
 * @description creates a new product variant  given name, description, and variant id
 */
productsRouter.route("/variants").post(async (req, res) => {
  const { variant_type_id, product_id, name } = req.body;
  const price_mod = req.body.price_mod || 0;
  const { variant, error } = await ProductVariant.insertOne(
    name,
    product_id,
    variant_type_id,
    price_mod,
  );
  if (error) return handleErr(req, res, error);
  return res.status(200).json({ variant });
});

/**
 * @route PUT /api/products/variants/:variant_id
 * @description updates a given product variant's name and/or price_mod. responds with updated variant | error
 */
productsRouter.route("/variants/:variant_id").put(async (req, res) => {
  if (!req.params.variant_id)
    return handleErr(req, res, "Must provide a valid variant_id", 400);
  let updates = {};
  let u = 0;
  if (req.body.name) {
    updates["name"] = req.body.name;
    u++;
  }
  if (req.body.price_mod) {
    updates["price_mod"] = req.body.price_mod;
    u++;
  }
  //check if updates present
  if (u === 0)
    return handleErr(
      req,
      res,
      "Only 'name' or 'price_mod' updates allowed. Must provide at least 1",
      400,
    );

  //update the variant
  const { variant, error } = await ProductVariant.updateOne(
    req.params.variant_id,
    updates,
  );

  if (error) return handleErr(req, res, error);
  res.status(200).json({ variant });
});
