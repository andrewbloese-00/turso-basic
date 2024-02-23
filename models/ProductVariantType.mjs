//Product functions
import { turso } from "../turso-client.mjs";
import { translateRow } from "../utils/fromRows.mjs";

/**
 * @typedef {{id: number,name:string,description:string }} ProductVariantType
 */
const productVariantTypesSchema = `
  id integer PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text NOT NULL
`;

/**
 * @param {string} name the name of the variant type
 * @param {description} description description of the product variant type.
 */
async function createOne(name, description) {
  console.log({ name, description });
  try {
    const response = await turso.execute({
      sql: "INSERT INTO ProductVariantTypes (name,description) VALUES ( ? , ? );",
      args: [name, description],
    });
    const variantId = response.lastInsertRowid;
    console.log("VARIANT ID", variantId);
    const getInserted = await turso.execute({
      sql: "SELECT * FROM ProductVariantTypes WHERE id = ?;",
      args: [variantId],
    });

    const product_variant_type = translateRow(
      getInserted.rows[0],
      getInserted.columns,
    );
    return { product_variant_type };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

/**
 * @param {number} id the ProductVariantTypes id column.
 */
async function getById(id) {
  try {
    const response = await turso.execute({
      sql: "SELECT * FROM ProductVariantTypes WHERE id = ?",
      args: [id],
    });
    const product_variant_type = translateRow(
      response.rows[0],
      response.columns,
    );
    return { product_variant_type };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

//creates the product variants table
export const ProductVariantTypesInitializer = async () => {
  const stmt = `CREATE TABLE IF NOT EXISTS ProductVariantTypes (${productVariantTypesSchema});`;
  console.log("INITIALIZER\n\n", stmt);

  return turso.execute(stmt);
  //todo: make batch to set up indexes as well
  // return turso.batch([
  //   `CREATE TABLE IF NOT EXISTS Products (${productSchema})`,
  //   `CREATE INDEX ...`,
  // ])
};

export const ProductVariantType = {
  createOne,
  getById,
};
