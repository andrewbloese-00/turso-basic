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
      sql: "INSERT INTO ProductVariantTypes (name,description) VALUES ( ? , ? ) RETURNING *;",
      args: [name, description],
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

/**
 * @param {number} id the ProductVariantTypes id column.
 */
async function getById(id) {
  try {
    const response = await turso.execute({
      sql: "SELECT * FROM ProductVariantTypes WHERE id = ?",
      args: [id],
    });
    const variant_type = translateRow(response.rows[0], response.columns);
    return { variant_type };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

/**
 * @param {number} id the id of the product to be updated.
 * @param {{name?:string,description?:string}} productVariantTypeUpdate the updates permissible on the ProductVariantTypes table.
 * @about allows updating the 'name', or 'description' of a product variant type.
 * @returns {Promise<{product_variant:Product, error:undefined}|{product: undefined, error:unknown}>}
 */
async function updateOne(id, productVariantTypeUpdate) {
  try {
    const setters = [];
    const args = [];
    if (productVariantTypeUpdate.name) {
      setters.push("name=?");
      args.push(productVariantTypeUpdate.name);
    }
    if (productVariantTypeUpdate.description) {
      //round price to money format
      setters.push("description=?");
      args.push(productVariantTypeUpdate.description);
    }
    args.push(id);
    const sql = `UPDATE ProductVariantTypes SET ${setters.join(",")} WHERE id = ? RETURNING *;`;
    const response = await turso.execute({ sql, args });
    const variant_type = translateRow(response.rows[0], response.columns);
    return { variant_type };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

//creates the product variants table
export const ProductVariantTypesInitializer = async () => {
  return turso.execute(
    `CREATE TABLE IF NOT EXISTS ProductVariantTypes (${productVariantTypesSchema});`,
  );
  //todo: make batch to set up indexes as well
  // return turso.batch([
  //   `CREATE TABLE IF NOT EXISTS Products (${productSchema})`,
  //   `CREATE INDEX ...`,
  // ])
};

export const ProductVariantType = {
  createOne,
  getById,
  updateOne,
};
