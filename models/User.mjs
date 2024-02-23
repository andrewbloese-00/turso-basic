//User Functions
import { turso } from "../turso-client.mjs";
import { translateRow } from "../utils/fromRows.mjs";
import { verifyHash, hashPassword } from "../utils/passwordHash.mjs";
/**
 * @typedef {{id: number, name: string, email: string: password}} ServerOnlyUser
 * @typedef {{id:number, name:string, email:string}} ClientUser
 */
//note that the password field is hashed before being sent to db
const userSchema = `
   id INTEGER PRIMARY KEY,
   name TEXT,
   email TEXT UNIQUE NOT NULL,
   password TEXT NOT NULL
 `;

/**
 * @param {string} id the users unique id
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
 * @param {string} name the users name
 * @param {string} email a valid & unique email
 * @param {string} password a secure password that will be hashed prior to being saved to the database
 * @returns {Promise<{}>}
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

/**
 * @param {string} email the users email
 * @param {string} password the users password
 * @returns { Promise<{error:unknown}|{token:string}>}
 */
async function signin(email, password) {
  try {
    const query = await turso.execute({
      sql: "SELECT * FROM Users WHERE email = ?",
      args: [email],
    });
    if (!query.rows.length) throw new Error("user not found");
    const user = translateRow(query.rows[0], query.columns);
    const valid = await verifyHash(password, user.password);
    if (!valid) throw new Error("Invalid Credentials");
    //TODO: implement tokens instead of raw ID
    return { token: user.id };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

//creates the user table
export const UserInitializer = async () => {
  return turso.execute(`CREATE TABLE IF NOT EXISTS Users (${userSchema})`);
  //todo: make batch to set up indexes as well
  // return turso.batch([
  //   `CREATE TABLE IF NOT EXISTS Users (${productSchema})`,
  //   `CREATE INDEX ...`,
  // ])
};

export const User = {
  getById,
  signup,
  signin,
};
