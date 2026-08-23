const { getDb } = require("../db/db");

const createTaskComment = async ({
  tenantUid,
  taskUid,
  commentText,
  createdByUid,
  createdByName,
}) => {
  const sql = `
    INSERT INTO task_comments (
      tenant_uid,
      task_uid,
      comment_text,
      created_by_uid
    ) VALUES (
      $(tenantUid),
      $(taskUid),
      $(commentText),
      $(createdByUid)
    )
    RETURNING
      uid AS "commentUid",
      tenant_uid AS "tenantUid",
      task_uid AS "taskUid",
      comment_text AS "commentText",
      created_by_uid AS "createdByUid",
      updated_by_uid AS "updatedByUid",
      deleted_by_uid AS "deletedByUid",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      deleted_at AS "deletedAt";
  `;

  const params = {
    tenantUid,
    taskUid,
    commentText,
    createdByUid,
  };

  const db = getDb();
  const data = await db.one(sql, params);
  return { ...data, createdByName };
};

const getTaskComments = async ({ tenantUid, taskUid }) => {
  const sql = `
    SELECT
      tc.uid AS "commentUid",
      tc.tenant_uid AS "tenantUid",
      tc.task_uid AS "taskUid",
      tc.comment_text AS "commentText",

      tc.created_by_uid AS "createdByUid",
      CONCAT_WS(' ', created_by.first_name, created_by.last_name) AS "createdByName",

      tc.updated_by_uid AS "updatedByUid",
      CONCAT_WS(' ', updated_by.first_name, updated_by.last_name) AS "updatedByName",

      tc.deleted_by_uid AS "deletedByUid",
      CONCAT_WS(' ', deleted_by.first_name, deleted_by.last_name) AS "deletedByName",

      tc.created_at AS "createdAt",
      tc.updated_at AS "updatedAt",
      tc.deleted_at AS "deletedAt"
    FROM task_comments tc
    LEFT JOIN users created_by
      ON created_by.uid = tc.created_by_uid
    LEFT JOIN users updated_by
      ON updated_by.uid = tc.updated_by_uid
    LEFT JOIN users deleted_by
      ON deleted_by.uid = tc.deleted_by_uid
    WHERE tc.tenant_uid = $(tenantUid)
      AND tc.task_uid = $(taskUid)
      AND tc.deleted_at IS NULL
    ORDER BY tc.created_at DESC;
  `;

  const params = {
    tenantUid,
    taskUid,
  };

  const db = getDb();
  return db.any(sql, params);
};

// not getting used
const getTaskCommentByUid = async ({ tenantUid, taskUid, commentUid }) => {
  const sql = `
    SELECT
      tc.uid AS "commentUid",
      tc.tenant_uid AS "tenantUid",
      tc.task_uid AS "taskUid",
      tc.comment_text AS "commentText",

      tc.created_by_uid AS "createdByUid",
      CONCAT_WS(' ', created_by.first_name, created_by.last_name) AS "createdByName",

      tc.updated_by_uid AS "updatedByUid",
      CONCAT_WS(' ', updated_by.first_name, updated_by.last_name) AS "updatedByName",

      tc.deleted_by_uid AS "deletedByUid",
      CONCAT_WS(' ', deleted_by.first_name, deleted_by.last_name) AS "deletedByName",

      tc.created_at AS "createdAt",
      tc.updated_at AS "updatedAt",
      tc.deleted_at AS "deletedAt"
    FROM task_comments tc
    LEFT JOIN users created_by
      ON created_by.uid = tc.created_by_uid
    LEFT JOIN users updated_by
      ON updated_by.uid = tc.updated_by_uid
    LEFT JOIN users deleted_by
      ON deleted_by.uid = tc.deleted_by_uid
    WHERE tc.tenant_uid = $(tenantUid)
      AND tc.task_uid = $(taskUid)
      AND tc.uid = $(commentUid)
      AND tc.deleted_at IS NULL;
  `;

  const params = {
    tenantUid,
    taskUid,
    commentUid,
  };

  const db = getDb();
  return db.oneOrNone(sql, params);
};

const updateTaskComment = async ({
  tenantUid,
  taskUid,
  commentUid,
  commentText,
  updatedByUid,
}) => {
  const sql = `
    UPDATE task_comments
    SET
      comment_text = $(commentText),
      updated_by_uid = $(updatedByUid),
      updated_at = now()
    WHERE tenant_uid = $(tenantUid)
      AND task_uid = $(taskUid)
      AND uid = $(commentUid)
      AND deleted_at IS NULL
    RETURNING
      uid AS "commentUid",
      tenant_uid AS "tenantUid",
      task_uid AS "taskUid",
      comment_text AS "commentText",
      created_by_uid AS "createdByUid",
      updated_by_uid AS "updatedByUid",
      deleted_by_uid AS "deletedByUid",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      deleted_at AS "deletedAt";
  `;

  const params = {
    tenantUid,
    taskUid,
    commentUid,
    commentText,
    updatedByUid,
  };

  const db = getDb();
  return db.oneOrNone(sql, params);
};

const deleteTaskComment = async ({
  tenantUid,
  taskUid,
  commentUid,
  deletedByUid,
}) => {
  const sql = `
    UPDATE task_comments
    SET
      deleted_by_uid = $(deletedByUid),
      deleted_at = now()
    WHERE tenant_uid = $(tenantUid)
      AND task_uid = $(taskUid)
      AND uid = $(commentUid)
      AND deleted_at IS NULL
    RETURNING
      uid AS "commentUid",
      tenant_uid AS "tenantUid",
      task_uid AS "taskUid",
      comment_text AS "commentText",
      created_by_uid AS "createdByUid",
      updated_by_uid AS "updatedByUid",
      deleted_by_uid AS "deletedByUid",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      deleted_at AS "deletedAt";
  `;

  const params = {
    tenantUid,
    taskUid,
    commentUid,
    deletedByUid,
  };

  const db = getDb();
  return db.oneOrNone(sql, params);
};

module.exports = {
  createTaskComment,
  getTaskComments,
  getTaskCommentByUid,
  updateTaskComment,
  deleteTaskComment,
};
