//Product functions
import { turso } from "../turso-client.mjs";
import { translateRow } from "../utils/fromRows.mjs";

/**
 * @typedef {{id: number, name: string, price: number,description: string}} Product
 */
const productSchema = `
   id INTEGER PRIMARY KEY,
   slug TEXT UNIQUE NOT NULL,
   name TEXT,
   description TEXT,
   price REAL
 `;

/**
 * @param {string} slug the unique slug of the Product
 */
async function getBySlug(slug) {
  try {
    const response = await turso.execute({
      sql: `SELECT * FROM Products WHERE slug = ?;`,
      args: [slug],
    });
    const product = translateRow(response.rows[0], response.columns);
    return { product };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

/**
 * @param {string} name
 */
async function insertOne(name, price, description) {
  try {
    price = Number(price.toFixed(2));
    const slug = name.toLowerCase().replace(/\s/g, "_");
    const result = await turso.execute({
      sql: `INSERT INTO Products ( name, slug, description, price ) VALUES ( ? , ? , ? , ? ) RETURNING *;`,
      args: [name, slug, description, price],
    });
    return { product: translateRow(result.rows[0], result.columns) };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

/**
 * @param {number} id the id of the product to be updated.
 * @param {{name?:string,description?:string,price?:number}} productUpdate the updates permissible on the product table.
 * @note if name is updated, then slug is automatically updated.
 * @about allows updating the 'name', 'desscription', and 'price' of a product.
 * @returns {Promise<{product:Product, error:undefined}|{product: undefined, error:unknown}>}
 */
async function updateOne(id, productUpdate) {
  try {
    const setters = [];
    const args = [];
    if (productUpdate.name) {
      //need to update slug as well on name change
      const newSlug = productUpdate.name.replace(/\s/g, "_");
      setters.push("name=?", "slug=?");
      args.push(productUpdate.name, newSlug);
    }
    if (productUpdate.price) {
      //round price to money format
      const p = Number(productUpdate.price.toFixed(2));
      setters.push("price=?");
      args.push(p);
    }
    if (productUpdate.description) {
      setters.push("description=?");
      args.push(productUpdate.description);
    }
    args.push(id);
    const sql = `UPDATE Products SET ${setters.join(",")} WHERE id = ? RETURNING *;`;
    console.log("UPDATE SQL: ", sql);
    const response = await turso.execute({
      sql,
      args,
    });
    const product = translateRow(response.rows[0], response.columns);
    return { product };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

//creates the product table

export const ProductInitializer = async () => {
  return turso.execute(
    `CREATE TABLE IF NOT EXISTS Products (${productSchema})`,
  );
  //todo: make batch to set up indexes as well
  // return turso.batch([
  //   `CREATE TABLE IF NOT EXISTS Products (${productSchema})`,
  //   `CREATE INDEX ...`,
  // ])
};

export const Product = {
  getBySlug,
  insertOne,
  updateOne,
};
