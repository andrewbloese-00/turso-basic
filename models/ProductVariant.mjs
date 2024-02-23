//Product functions
import { turso } from "../turso-client.mjs";
import { translateRow } from "../utils/fromRows.mjs";

/**
 * @typedef {{id: number, product_id: number, variant_name: string, variant_type: number, price_mod: number}} ProductVariant
 */
const productVariantSchema = `
  id integer PRIMARY KEY,
  product_id integer REFERENCES Products(id),
  variant_name text NOT NULL,
  variant_type integer REFERENCES ProductVariantTypes(id),
  price_mod real DEFAULT 0
 `;

//do a join with product variant types to get full details
async function getVariants(product_id) {
  try {
    const sql = `
         SELECT
             PV.id AS variant_id,
             PV.variant_name AS variant_name,
             PVT.name AS variant_type_name,
             PVT.id AS variant_type_id,
             PVT.description AS variant_type_description,
             PV.price_mod AS variant_price_mod
         FROM
             ProductVariants PV
         JOIN ProductVariantTypes PVT ON PV.variant_type = PVT.id
         WHERE
             PV.product_id = ?
       `;
    const response = await turso.execute({
      sql,
      args: [product_id],
    });
    const variants = [];
    for (let row of response.rows) {
      variants.push(translateRow(row, response.columns));
    }
    return { variants };
  } catch (error) {
    console.error(error);
    return { error: error.message || error || "Unknown Error" };
  }
}

async function insertOne(name, product_id, variant_type_id, price_mod = 0) {
  try {
    const response = await turso.execute({
      sql: "INSERT INTO ProductVariants ( product_id, variant_name, variant_type, price_mod ) VALUES ( ? , ? , ?, ? ) RETURNING *;",
      args: [product_id, name, variant_type_id, price_mod],
    });
    const variant = translateRow(response.rows[0], response.columns);
    return { variant };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

//creates the product variants table
export const ProductVariantInitializer = async () => {
  return turso.execute(
    `CREATE TABLE IF NOT EXISTS ProductVariants (${productVariantSchema})`,
  );
  //todo: make batch to set up indexes as well
  // return turso.batch([
  //   `CREATE TABLE IF NOT EXISTS Products (${productSchema})`,
  //   `CREATE INDEX ...`,
  // ])
};

export const ProductVariant = {
  insertOne,
  getVariants,
};
