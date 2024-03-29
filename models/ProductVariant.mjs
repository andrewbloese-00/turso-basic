//Product functions
import { turso } from "../turso-client.mjs";
import { translateRow } from "../utils/fromRows.mjs";
import { groupBy } from "../utils/groupBy.mjs";

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
    return { variants: groupBy(variants, "variant_type_name") };
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

/**
 * @param {ProductVariant[]} variants
 */
async function insertMany(variants, returning = false) {
  try {
    //build bulk insert query
    let sql =
      "INSERT INTO ProductVariants (product_id,variant_name,variant_type,price_mod) VALUES";
    const args = [];
    for (let p = 0; p < variants.length; p++) {
      const productVariant = variants[p];
      sql += ` (?,?,?,?)`;
      if (p !== variants.length - 1) sql += ",";
      args.push(
        productVariant.product_id,
        productVariant.variant_name,
        productVariant.variant_type,
        productVariant.price_mod,
      );
    }
    if (returning) sql += " RETURNING *";
    console.log(sql);
    console.log(args);
    const response = await turso.execute({ sql, args });
    if (returning) {
      /**@type {ProductVariant[]} */
      const productVariants = [];
      for (let row of response.rows) {
        productVariants.push(translateRow(row, response.columns));
      }
      return { productVariants };
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

/**
 * @param {number} id the id of the product variant to be updated.
 * @param {{variant_name?:string,price_mod?:number}} productVariantUpdate the updates permissible on the product table.
 * @about allows updating the 'name', and 'price_mod' of a product variant.
 * @returns {Promise<{variant:ProductVariant, error:undefined}|{variant: undefined, error:unknown}>}
 */
async function updateOne(id, productVariantUpdate) {
  try {
    const setters = [];
    const args = [];
    if (productVariantUpdate.variant_name) {
      setters.push("variant_name=?");
      args.push(productVariantUpdate.variant_name);
    }
    if (productVariantUpdate.price_mod) {
      //round price to money format
      const pm = Number(productVariantUpdate.price.toFixed(2));
      setters.push("price=?");
      args.push(pm);
    }
    args.push(id);
    const sql = `UPDATE ProductVariants SET ${setters.join(",")} WHERE id = ? RETURNING *;`;
    const response = await turso.execute({ sql, args });
    const variant = translateRow(response.rows[0], response.columns);
    return { variant };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

async function deleteOne(id) {
  try {
    const reply = await turso.execute({
      sql: `DELETE FROM ProductVariants WHERE id = ?`,
      args: [id],
    });
    if (reply.rowsAffected === 0) throw new Error("Query Affected No Rows...");
    return { success: true };
  } catch (error) {
    console.warn("Failed to delete product varaint...");
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
  insertMany,
  getVariants,
  updateOne,
  deleteOne,
};
