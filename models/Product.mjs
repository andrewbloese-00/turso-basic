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
    const resultSet = await turso.execute({
      sql: `SELECT * FROM Products WHERE slug = ?`,
      args: [slug],
    });
    const product = tranlateRow(resultSet.rows[0], resultSet.columns);
    return { product };
  } catch (error) {
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
      sql: `INSERT INTO Products ( name, slug, description, price ) VALUES ( ? , ? , ? , ? )`,
      args: [name, slug, description, price],
    });
    console.log(result);

    return { product: translateRow(result.rows[0], result.columns) };
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
};
