//Product functions
import { turso } from "../turso-client.mjs";
import { translateRow } from "../utils/fromRows.mjs";
import { verifyHash, hashPassword } from "../utils/passwordHash.mjs";
/**
 * @typedef {{id: number, name: string, price: number,description: string}} Product
 */

//note that the password field is hashed before being sent to db
const userSchema = `
   id INTEGER PRIMARY KEY,
   name TEXT,
   email TEXT UNIQUE NOT NULL,
   password TEXT NOT NULL
 `;

/**
 * @param {string} slug the unique slug of the Product
 */
async function getById(id) {
  try {
    const resultSet = await turso.execute({
      sql: `SELECT (id,name,email) FROM Users WHERE id = id`,
      args: [id],
    });
    const user = translateRow(resultSet.rows[0], resultSet.columns);
    return { user };
  } catch (error) {
    return { error };
  }
}

/**
 * @param {string} name
 */
async function signup(name, email, password) {
  try {
    const passwordHash = await hashPassword(password);
    const result = await turso.execute({
      sql: `INSERT INTO Users ( name, email, password ) VALUES ( ? , ? , ? )`,
      args: [name, email, passwordHash],
    });
    //TODO generate token - dont just return id...
    const user = translateRow(result.rows[0], result.columns);
    return { token: user.id || null };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

async function signin(email, password) {
  try {
    // step 1: find user matching email
    const query = await turso.execute({
      sql: "SELECT * FROM Users WHERE email = ?",
      args: [email],
    });

    // See if the password matches
    if (!query.rows.length) throw new Error("user not found");
    const user = translateRow(query.rows[0], query.columns);
    const valid = await verifyHash(password, user.password);
    if (!valid) throw new Error("Invalid Credentials");
    // TODO: if does return a token
    return { token: user.id };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

//creates the product table

export const UserInitializer = async () => {
  return turso.execute(`CREATE TABLE IF NOT EXISTS Users (${userSchema})`);
  //todo: make batch to set up indexes as well
  // return turso.batch([
  //   `CREATE TABLE IF NOT EXISTS Products (${productSchema})`,
  //   `CREATE INDEX ...`,
  // ])
};

export const User = {
  getById,
  signup,
  signin,
};
