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

const isToday = (dbDate) => {
  if (!dbDate) {
    return false;
  }

  const date = new Date(dbDate);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const sortByDbDateDesc = (arr, dateKey) => {
  if (!Array.isArray(arr)) {
    return [];
  }

  return [...arr].sort((a, b) => {
    const dateA = new Date(a[dateKey]).getTime();
    const dateB = new Date(b[dateKey]).getTime();

    return dateB - dateA;
  });
};

const sortByDbDateAsc = (arr, dateKey) => {
  if (!Array.isArray(arr)) {
    return [];
  }

  return [...arr].sort((a, b) => {
    const dateA = new Date(a[dateKey]).getTime();
    const dateB = new Date(b[dateKey]).getTime();

    return dateA - dateB;
  });
};

module.exports = {
  hashPassword,
  verifyPassword,
  comparePassword,
  snakeToCamel,
  camelToWords,
  isToday,
  sortByDbDateDesc,
  sortByDbDateAsc,
};
