const { getDb } = require("../db/db");

const bookmarkReqService = async (payload) => {
  const values = [
    payload.entity_type,
    payload.bookmark_name,
    payload.user_id,
    payload.entity_id,
  ];

  const sql = `
  INSERT INTO bookmarks (
    uid,
    entity_type,
    bookmark_name,
    user_id,
    entity_ids
  )
  VALUES (
    gen_random_uuid(),
    $1,         
    $2,         
    $3,         
    ARRAY[$4::uuid]
  )
  ON CONFLICT (user_id, bookmark_name, entity_type) 
  DO UPDATE SET
    entity_ids = CASE 
        WHEN $4::uuid = ANY(bookmarks.entity_ids) 
        THEN array_remove(bookmarks.entity_ids, $4::uuid)
        ELSE array_append(bookmarks.entity_ids, $4::uuid)
    END
  RETURNING *;`;

  const db = getDb();
  const response = await db.one(sql, values);

  return response;
};


const getAllBookmarksByUserService = async ({ user_id }) => {
  const values = [user_id];
  const sql = `
    SELECT uid, entity_type, bookmark_name, entity_ids, user_id
    FROM bookmarks
    WHERE user_id = $1
  `;

  const db = getDb();
  const responseEntity = await db.any(sql, values);
  return responseEntity;
};

module.exports = { bookmarkReqService, getAllBookmarksByUserService };
