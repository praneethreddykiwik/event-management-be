const bcrypt = require("bcrypt");

async function hashPassword(plainPassword) {
  const saltRounds = 12; // can be between 10-14 typically
  return bcrypt.hash(plainPassword, saltRounds);
}

async function verifyPassword(plainPassword, passwordHash) {
  const verification = await bcrypt.compare(plainPassword, passwordHash);
  return verification;
}

const comparePassword = async (plainPassword, hash) => {
  const isValid = await bcrypt.compare(plainPassword, hash);
  return isValid;
};

const snakeToCamel = (str) =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const camelToWords = (str) => {
  const result = str.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

module.exports = {
  hashPassword,
  verifyPassword,
  comparePassword,
  snakeToCamel,
  camelToWords,
};
