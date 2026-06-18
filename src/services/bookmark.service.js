const { getDb } = require("../db/db");

const bookmarkEventService = async (payload) => {
  const sql = ``;
  const db = getDb();
  const createdRes = await db.one(sql, payload);
  console.log("createEventService", createdRes);
  return createdRes;
};

module.exports = { bookmarkEventService };
