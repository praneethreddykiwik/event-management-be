const { getDb } = require("../db/db");

const createTaskService = ({
  tenantUid,
  eventUid,
  title,
  description = null,
  priority = "medium",
  dueAt = null,
  assignedToUid = null,
  createdByUid,
  updatedByUid,
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
      $(created_by_uid), $(updated_by_uid)
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
    created_by_uid: createdByUid,
    updated_by_uid: updatedByUid,
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

const getTaskService = async (query) => {
  // tenantUid, eventUid,
  const conditions = [];
  const params = {};

  const queries = [
    { query: "tenantId", condition: "t.tenant_uid = $(tenantUid)" },
    { query: "eventUid", condition: "t.event_uid = $(eventUid)" },
    { query: "username", condition: "u.username = $(username)" },
  ];

  queries.forEach((el) => {
    if (query[el.query]) {
      conditions.push(el.condition);
      params[el.query] = query[el.query];
    }
  });

  const whereClause = conditions.length
    ? `where ${conditions.join(" and ")}`
    : "";

  const db = getDb();
  const users = await db.any(
    `
      select
        *
      from tasks t
      ${whereClause}
      `,
    { ...params }
  );
  // join tenants t on t.uid = t.tenant_uid

  return users;
};

const getTasksByEventService = async (tenantUid, eventUid) => {
  const sql = `
  SELECT
    e.uid              AS "eventUid",
    e.event_name,
    e.event_type,
    e.scheduled_at,
    e.venue,
    e.status           AS "eventStatus",
    t.uid              AS "taskUid",
    t.title            AS "taskTitle",
    t.status           AS "taskStatus",
    t.priority,
    t.due_at
  FROM events e
  JOIN tasks t
    ON t.event_uid = e.uid
  JOIN users u
    ON u.uid = t.assigned_to_uid
  WHERE
    AND e.event_uid = $(eventUid)
  ORDER BY
    e.scheduled_at DESC;
`;

  const db = getDb();
  const rows = await db.any(sql, {
    eventUid,
    tenant_uid: tenantUid,
  });
  return rows;
};

async function assignTaskService(taskUid, assignedToUid, updatedByUid) {
  const sql = `
  UPDATE tasks
  SET
    assigned_to_uid = $(assignedToUid),
    status = 'assigned',
    updated_at = NOW(),
    updated_by_uid = $(updatedByUid)
  WHERE uid = $(taskUid)
  RETURNING *;
`;

  const db = getDb();
  await db.one(sql, {
    taskUid,
    assignedToUid,
    updatedByUid,
  });
}

async function acceptTaskService(taskUid, assignedToUid) {
  const sql = `
  UPDATE tasks
  SET
    assigned_to_uid = $(assignedToUid),
    status = assigned,
    updated_at = NOW(),
    updated_by_uid = $(assignedToUid)
  WHERE uid = $(taskUid)
  RETURNING *;
`;

  const db = getDb();
  await db.one(sql, {
    taskUid,
    assignedToUid,
  });
}

async function declineTaskService(taskUid, assignedToUid) {
  const sql = `
  UPDATE tasks
  SET
    assigned_to_uid = $(assignedToUid),
    status = assigned,
    updated_at = NOW(),
    updated_by_uid = $(assignedToUid)
  WHERE uid = $(taskUid)
  RETURNING *;
`;

  const db = getDb();
  await db.one(sql, {
    taskUid,
    assignedToUid,
  });
}

module.exports = {
  createTaskService,
  getTaskService,
  getTasksByEventService,
  assignTaskService,
  updateTask,
  acceptTaskService,
  declineTaskService,
};
