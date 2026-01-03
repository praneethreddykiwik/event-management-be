const { getDb } = require("../db/db");

const createTask = ({
  tenantUid,
  eventUid,
  title,
  description = null,
  priority = "medium",
  dueAt = null,
  assignedToUid = null,
  actorUid,
}) => {
  const sql = `
    INSERT INTO tasks (
      tenant_uid, event_uid, title, description,
      priority, due_at, assigned_to_uid,
      created_by_uid, updated_by_uid
    )
    VALUES (
      $(tenant_uid), $(event_uid), $(title), $(description),
      $(priority), $(due_at), $(assigned_to_uid),
      $(actor_uid), $(actor_uid)
    )
    RETURNING *;
  `;

  const db = getDb();
  return db.one(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    title,
    description,
    priority,
    due_at: dueAt,
    assigned_to_uid: assignedToUid,
    actor_uid: actorUid,
  });
};

async function updateTask(
  tenantUid,
  taskUid,
  patch = {}, // { title, description, status, priority, dueAt, assignedToUid }
  actorUid
) {
  const sql = `
    UPDATE tasks
    SET
      title = COALESCE($(title), title),
      description = COALESCE($(description), description),
      status = COALESCE($(status), status),
      priority = COALESCE($(priority), priority),
      due_at = COALESCE($(due_at), due_at),
      assigned_to_uid = COALESCE($(assigned_to_uid), assigned_to_uid),
      updated_at = now(),
      updated_by_uid = $(actor_uid)
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(task_uid)
      AND status <> 'deleted'
    RETURNING *;
  `;

  const db = getDb();
  return db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    task_uid: taskUid,
    title: patch.title ?? null,
    description: patch.description ?? null,
    status: patch.status ?? null,
    priority: patch.priority ?? null,
    due_at: patch.dueAt ?? null,
    assigned_to_uid: patch.assignedToUid ?? null,
    actor_uid: actorUid,
  });
}

async function deleteTask(tenantUid, taskUid, actorUid) {
  const sql = `
    UPDATE tasks
    SET
      status = 'deleted',
      updated_at = now(),
      updated_by_uid = $(actor_uid)
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(task_uid)
      AND status <> 'deleted'
    RETURNING uid, status, updated_at, updated_by_uid;
  `;

  const db = getDb();
  return db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    task_uid: taskUid,
    actor_uid: actorUid,
  });
}
