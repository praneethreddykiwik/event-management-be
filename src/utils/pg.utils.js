const convertQueryParams = (value) => {
  if (!value) {
    return "";
  }
  if (!value.includes(",")) {
    return value;
  }
  console.log("abdul util 1", value);

  const arr = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  console.log("abdul util 2", arr);
  return arr;
};

module.exports = { convertQueryParams };
