import { Router } from "express";
import { Product } from "../models/Product.mjs";
export const productsRouter = Router();

const NOT_FOUND = { error: "Product Not Found" };
productsRouter.route("/:slug").get(async (req, res) => {
  const { product, error } = await Product.getBySlug(req.params.slug);
  if (error) res.status(404).json(NOT_FOUND);
  res.status(200).json({ product });
});
