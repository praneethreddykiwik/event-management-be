const { getDb } = require("../db/db");

const bookmarkReqService = async (payload) => {
  const values = [
    payload.entity_type,
    payload.bookmark_name,
    payload.entity_id,
    payload.user_id,
  ];
  const sql = `
  INSERT INTO bookmarks (
    uid,
    entity_type,
    bookmark_name,
    entity_id,
    user_id,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    $1,         
    $2,         
    $3,         
    $4,         
    now(),
    now()
)
ON CONFLICT (user_id, entity_type, entity_id)
DO UPDATE SET
    bookmark_name = EXCLUDED.bookmark_name,
    updated_at = now()
RETURNING *;`;
  const db = getDb();
  const createdRes = await db.one(sql, values);
  console.log("createEventService", createdRes);
  return createdRes;
};

module.exports = { bookmarkReqService };
