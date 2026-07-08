const { getDb } = require("../db/db");

const bookmarkReqService = async (payload) => {
  const { user_id, bookmark_name, entity_type, entity_id } = payload;

  const sql = `SELECT * FROM toggle_bookmark($1, $2, $3, $4)`;
  const values = [user_id, bookmark_name, entity_type, entity_id];

  const db = getDb();
  const response = await db.one(sql, values);

  return response;
};

const getAllBookmarksByUserService = async (userId) => {
  const sql = `
    SELECT uid, user_id, bookmarks
    FROM bookmarks
    WHERE user_id = $(user_id)
  `;

  const db = getDb();
  const row = await db.oneOrNone(sql, { user_id: userId });

  if (!row || !row.bookmarks) {
    return [];
  }

  const flattened = Object.entries(row.bookmarks).flatMap(
    ([bookmark_name, byType]) =>
      Object.entries(byType).map(([entity_type, entity_ids]) => ({
        bookmark_name,
        entity_type,
        entity_ids,
      })),
  );

  return flattened;
};

module.exports = { bookmarkReqService, getAllBookmarksByUserService };
