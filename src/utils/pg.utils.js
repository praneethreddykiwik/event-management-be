const convertQueryParams = (value) => {
  if (!value) {
    return "";
  }
  if (!value.includes(",")) {
    return value;
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

module.exports = { convertQueryParams };
