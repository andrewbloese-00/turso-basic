import { hashPassword, verifyHash } from "../utils/passwordHash.mjs";

async function main() {
  const pw = "a$$word";
  const hash = await hashPassword(pw);
  console.log("HASH: ", hash);
  const verified = await verifyHash(pw, hash);
  console.log("VERIFY: ", verified);

  const allow = await verifyHash("s3xyb34st", hash);
  console.log("REJECT: ", allow === false);
}
main();
