import { randomBytes, pbkdf2 } from "crypto";

const ITERATIONS = 1000;
const KEY_LEN = 64;
const DIGEST = "sha512";

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await new Promise((resolve, reject) => {
    pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derived) => {
      if (err) reject(err);
      resolve(derived.toString("hex"));
    });
  });
  return `${salt}${hash}`;
}

/**
 * @param {string} plaintext
 * @param {string} cipher
 */
export async function verifyHash(plaintext, cipher) {
  try {
    const salt = cipher.slice(0, 32);
    const hash = cipher.slice(32);

    const derivedHash = await new Promise((resolve, reject) => {
      pbkdf2(plaintext, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derived) => {
        if (err) return reject(err);
        resolve(derived.toString("hex"));
      });
    });

    return derivedHash === hash;
  } catch (error) {
    console.error(error);
    return false;
  }
}
