//Product functions
import { turso } from "../turso-client.mjs";
import { translateRow } from "../utils/fromRows.mjs";

/**
 * @typedef {{id: number,price: number, name: string,description: string,category:string}} Product
 */
const productSchema = `
   id INTEGER PRIMARY KEY,
   price REAL,
   slug TEXT UNIQUE NOT NULL,
   name TEXT,
   description TEXT,
   category TEXT
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
 * @param {string} category the product category to grab from
 * @param {"price" | "name" } sortBy order by price or name
 * @param {"ASC" | "DESC"} order ascending or descending
 */
async function getCategory(category, sortBy = "price", order = "ASC") {
  try {
    const results = await turso.execute({
      sql: `SELECT * FROM Products WHERE category = ? ORDER BY ${sortBy} ${order};`,
      args: [category],
    });

    const products = [];
    for (let row of results.rows) {
      products.push(translateRow(row, results.columns));
    }
    return { products };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

/**
 * @param {"price" | "name" } sortBy
 * @param {"ASC" | "DESC"} order
 */
async function getAll(sortBy = "price", order = "ASC") {
  try {
    const results = await turso.execute(
      `SELECT * FROM Products ORDER BY ${sortBy} ${order}`,
    );

    const products = [];
    for (let row of results.rows) {
      products.push(translateRow(row, results.columns));
    }

    return { products };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

/**
 * @param {string} name
 */
async function insertOne(name, price, description, category) {
  try {
    price = Number(price.toFixed(2));
    const slug = name.toLowerCase().replace(/\s/g, "_");
    const result = await turso.execute({
      sql: `INSERT INTO Products ( name, slug, description, price, category ) VALUES ( ? , ? , ? , ?, ? ) RETURNING *;`,
      args: [name, slug, description, price, category],
    });
    return { product: translateRow(result.rows[0], result.columns) };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

/**
 * @param {number} id the id of the product to be updated.
 * @param {{name?:string,description?:string,price?:number,category?:string}} productUpdate the updates permissible on the product table.
 * @note if name is updated, then slug is automatically updated.
 * @about allows updating the 'name', 'category','description', and 'price' of a product.
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
    if (productUpdate.category) {
      setters.push("category=?");
      args.push(productUpdate.category);
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

/**
 * @param {{name:string,price:number,description:string,category}[]} products
 * @param {boolean} returning
 */
async function insertMany(products, returning = false) {
  try {
    //build bulk insert query
    let sql =
      "INSERT INTO Products (name,slug,description,price,category) VALUES";
    const args = [];
    for (let p = 0; p < products.length; p++) {
      const product = products[p];
      sql += ` (?,?,?,?,?)`;
      if (p !== products.length - 1) sql += ",";
      const slug = product.name.toLowerCase().replace(/\s/g, "_");
      args.push(
        product.name,
        slug,
        product.description,
        product.price,
        product.category,
      );
    }
    if (returning) sql += " RETURNING *";
    console.log(sql);
    console.log(args);
    const response = await turso.execute({ sql, args });
    if (returning) {
      const products = [];
      for (let row of response.rows) {
        products.push(translateRow(row, response.columns));
      }
      return { products };
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

//creates the Products table
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
  insertMany,
  updateOne,
  getAll,
  getCategory,
};
