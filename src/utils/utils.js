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

module.exports = {
  hashPassword,
  verifyPassword,
  comparePassword,
};
