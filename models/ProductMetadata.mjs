//Product functions
import { turso } from "../turso-client.mjs";
import { translateRow } from "../utils/fromRows.mjs";

/**
 * @typedef {{id: number, product?:number, name:string,content:string, is_property: (0|1) }} ProductMetadata
 */
const productMetadataSchema = `
  id integer PRIMARY KEY,
  product REFERENCES Products(id),
  name TEXT,
  content TEXT,
  is_property integer
`;

async function insertOne(product_id, name, content, isProperty = 0) {
  try {
    const response = await turso.execute({
      sql: "INSERT INTO ProductMetadata (product,name,content,is_property) VALUES (?, ?, ?, ?) RETURNING *",
      args: [product_id, name, content, isProperty],
    });
    const metadata = translateRow(response.rows[0], response.columns);
    return { metadata };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

async function getByProduct(product_id) {
  try {
    const result = await turso.execute({
      sql: "SELECT name,content,is_property FROM ProductMetadata WHERE product = ?;",
      args: [product_id],
    });

    const metadatas = [];
    for (const row of result.rows) {
      metadatas.push(translateRow(row, result.columns));
    }
    return { metadatas };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

//creates the product metatdata table
export const ProductMetadataInitializer = async () => {
  return turso.execute(
    `CREATE TABLE IF NOT EXISTS ProductMetadata (${productMetadataSchema});`,
  );
  //todo: make batch to set up indexes as well
  // return turso.batch([
  //   `CREATE TABLE IF NOT EXISTS Products (${productSchema})`,
  //   `CREATE INDEX ...`,
  // ])
};

export const ProductMetadata = {
  insertOne,
  getByProduct,
};
