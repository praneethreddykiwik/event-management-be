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

const updateTaskService = ({
  tenantUid,
  taskUid, // required
  title, // optional
  description, // optional (can be null)
  priority, // optional
  dueAt, // optional (can be null)
  assignedToUid, // optional (can be null)
  status, // optional (if you have status column)
  updatedByUid, // required
}) => {
  const sql = `
    UPDATE tasks
    SET
      title = COALESCE($(title), title),
      description = COALESCE($(description), description),
      priority = COALESCE($(priority), priority),
      due_at = COALESCE($(due_at), due_at),
      assigned_to_uid = COALESCE($(assigned_to_uid), assigned_to_uid),
      status = COALESCE($(status), status),
      updated_by_uid = $(updated_by_uid),
      updated_at = NOW()
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(task_uid)
    RETURNING *;
  `;

  const db = getDb();
  return db.one(sql, {
    tenant_uid: tenantUid,
    task_uid: taskUid,
    title: title ?? null,
    description: description ?? null,
    priority: priority ?? null,
    due_at: dueAt ?? null,
    assigned_to_uid: assignedToUid ?? null,
    status: status ?? null,
    updated_by_uid: updatedByUid,
  });
};

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
    { ...params },
  );
  // join tenants t on t.uid = t.tenant_uid

  return users;
};

const getTasksByEventService = async (tenantUid, eventUid) => {
  const sql = `
  SELECT
    e.uid              AS "eventUid",
    e.event_name       AS "eventName",
    e.event_type       AS "eventType",
    e.scheduled_at     AS scheduledAt,
    e.venue,
    e.status           AS "eventStatus",

    t.uid              AS "taskUid",
    t.title            AS "taskTitle",
    t.status           AS "taskStatus",
    t.priority,
    t.due_at           AS "taskDueAt",
    t.description AS "taskDescription",
    t.due_at AS "taskDueAt",
    t.assigned_to_uid AS "taskAssignedToUid",
    t.created_at AS "taskCreatedAt",

    u.username,
    CONCAT(u.first_name, ' ', u.last_name) as "taskAssignedTo"

  FROM events e
  JOIN tasks t
    ON t.event_uid = e.uid
  JOIN users u
    ON u.uid = e.assigned_to_uid
  WHERE e.uid = $(eventUid)
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
  updateTaskService,
  acceptTaskService,
  declineTaskService,
};
