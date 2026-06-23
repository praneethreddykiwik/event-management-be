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
  return createdRes;
};

const getBookmarkByEntityService = async ({
  entity_id,
  entity_type,
  user_id,
}) => {
  const values = [entity_id, entity_type, user_id];
  const sql = `
  SELECT uid, entity_type, bookmark_name, entity_id, user_id
  FROM bookmarks
  WHERE entity_id = $1
  AND entity_type = $2
  AND user_id = $3
  LIMIT 1;
  `;

  const db = getDb();
  const responseEntity = await db.one(sql, values);
  return responseEntity;
};

module.exports = { bookmarkReqService, getBookmarkByEntityService };
