const { getDb } = require("../db/db");

const bookmarkReqService = async ({entityId, entityType, bookmarkName, userId}) => {

  const sql = `SELECT * FROM toggle_bookmark($(user_uid), $(entity_type), $(bookmark_name), $(entity_id))`;
  const db = getDb();

  const response = await db.one(sql, {
    user_uid: userId,
    entity_type: entityType,
    bookmark_name: bookmarkName,
    entity_id: entityId
  });

  return response;
};

const getBookmarksByTypeService = async ({ userId, entityType }) => {
  const sql = `
    SELECT bookmarks
    FROM bookmarks
    WHERE user_id = $(user_uid) AND entity_type = $(entity_type)
  `;

  const db = getDb();
  const row = await db.oneOrNone(sql, {
    user_uid: userId,
    entity_type: entityType
  });

  return row?.bookmarks ?? {};
};

module.exports = { bookmarkReqService, getBookmarksByTypeService };