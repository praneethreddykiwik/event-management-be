const { getDb } = require("../db/db");

const createTaskService = (payload) => {
  const {
    tenantUid,
    eventUid,
    createdByUid,
    updatedByUid,
    assignedToUid = null,
    qaAssignedTo,
  } = payload;

  const sql = `
    INSERT INTO tasks (
      tenant_uid, event_uid, title, description,
      priority, due_at, assigned_to_uid,
      created_by_uid, updated_by_uid, status,
      qa_assigned_to_uid
    )
    VALUES (
      $(tenant_uid), $(event_uid), $(title), $(description),
      $(priority), $(due_at), $(assigned_to_uid),
      $(created_by_uid), $(updated_by_uid), $(status), $(qa_assigned_to_uid)
    )
    RETURNING *;
  `;

  const db = getDb();
  return db.one(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    title: payload.title,
    description: payload.description,
    priority: payload.priority,
    due_at: payload.dueAt,
    status: payload.status,
    assigned_to_uid: assignedToUid,
    created_by_uid: createdByUid,
    updated_by_uid: updatedByUid,
    qa_assigned_to_uid: qaAssignedTo,
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
  status, // optional
  qaAssignedTo,
  updatedByUid, // required
  isQaApproved,
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
      qa_assigned_to_uid = COALESCE($(qa_assigned_to_uid), qa_assigned_to_uid),
      is_qa_approved = COALESCE($(is_qa_approved), is_qa_approved),
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
    qa_assigned_to_uid: qaAssignedTo,
    is_qa_approved: isQaApproved,
  });
};

async function deleteTaskService(tenantUid, taskUid, declinedByUid) {
  const sql = `
    UPDATE tasks
    SET
      status = 'deleted',
      updated_at = now(),
      updated_by_uid = $(updated_by)
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(task_uid)
      AND status <> 'deleted'
    RETURNING uid, status, updated_at, updated_by_uid;
  `;

  const db = getDb();
  return db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    task_uid: taskUid,
    updated_by: declinedByUid,
  });
}

const getTaskService = async (query) => {
  // tenantUid, eventUid,
  const conditions = [];
  const params = {};

  const queries = [
    {
      query: "taskUid",
      condition: "t.uid = $(taskUid)",
      value: query.taskUid,
    },
    {
      query: "tenant_d",
      condition: "t.tenant_uid = $(tenantUid)",
      value: query.tenantId,
    },
    {
      query: "event_id",
      condition: "t.event_uid = $(eventUid)",
      value: query.eventUid,
    },
    {
      query: "username",
      condition: "u.username = $(username)",
      value: query.username,
    },
  ];

  queries.forEach((el) => {
    if (query[el.query]) {
      conditions.push(el.condition);
      params[el.query] = el.value;
    }
  });

  const whereClause = conditions.length
    ? `where ${conditions.join(" and ")}`
    : "";

  const db = getDb();
  const users = await db.any(
    `
      select
        t.uid as "taskUid",
        t.tenant_uid as "tenantUid",
        t.event_uid as "eventUid",
        t.title as "taskTitle",
        t.description as "taskDescription",
        t.status as "taskStatus",
        t.priority as "taskPriority",
        t.due_at as "taskDueAt",
        t.assigned_to_uid as "taskAssignedToUid",
        t.created_at as "taskCreatedAt",
        t.updated_at as "taskUpdatedAt",
        t.created_by_uid as "taskCreatedByUid",
        t.updated_by_uid as "taskUpdatedByUid",
        t.qa_assigned_to_uid as "qaAssignedToUid",
        t.is_qa_approved as "taskIsQaApproved",
        t.qa_approved_by as "taskQaApprovedBy",
        t.qa_approved_at as "taskQaApprovedAt",

        CONCAT_WS(' ', taskAssignedTo.first_name, taskAssignedTo.last_name) as "taskAssignedTo",

        e.event_name as "eventName",
        CONCAT_WS(' ', eventAssignedTo.first_name, eventAssignedTo.last_name) as "eventAssignedTo",
        CONCAT_WS(' ', qaAssignedTo.first_name, qaAssignedTo.last_name) as "qaAssignedTo",
        e.venue as "eventVenue",
        eventStatus.status as "eventStatus"

      from tasks t
      LEFT JOIN events e
        ON t.event_uid = e.uid

      LEFT JOIN users taskAssignedTo
        ON t.assigned_to_uid = taskAssignedTo.uid

      LEFT JOIN users eventAssignedTo
        ON e.assigned_to_uid = eventAssignedTo.uid

      LEFT JOIN events eventStatus
        ON t.event_uid = eventStatus.uid

      LEFT JOIN users qaAssignedTo
       ON t.qa_assigned_to_uid = qaAssignedTo.uid
      ${whereClause}
      `,
    { ...params },
  );
  // join tenants t on t.uid = t.tenant_uid

  return users;
};

// checkHere
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

    t.qa_assigned_to_uid AS "qaAssignedToUid",
    t.is_qa_approved AS "isQaApproved",
    qaAssigned.first_name AS "qaAssignedToFirstName",
    qaAssigned.last_name AS "qaAssignedToLastName",
    CONCAT(qaAssigned.first_name, ' ', qaAssigned.last_name) as "qaAssignedTo",

    u.username,
    CONCAT(u.first_name, ' ', u.last_name) as "taskAssignedTo"

  FROM events e
  JOIN tasks t
    ON t.event_uid = e.uid

  JOIN users u
    ON u.uid = t.assigned_to_uid

  LEFT JOIN users qaAssigned
  ON qaAssigned.uid = t.qa_assigned_to_uid

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

// 'low'::text, 'medium'::text, 'high'::text])))
const qaEventsAndTasksService = async (tenantUid, assignedToUid) => {
  const sql = `
    SELECT
      e.uid AS "eventUid",
      e.event_name AS "eventName",
      e.event_type AS "eventType",
      e.scheduled_at AS "eventScheduledAt",
      e.venue AS "eventVenue",
      e.expected_attendees AS "expectedAttendees",
      e.status AS "eventStatus",
      e.assigned_to_uid AS "eventAssignedToUid",
      e.created_at AS "eventCreatedAt",

      assigned.first_name AS "eventAssignedToFirstName",
      assigned.last_name AS "eventAssignedToLastName",
      assigned.username AS "eventAssignedToUsername",

      t.uid AS "taskUid",
      t.title AS "taskTitle",
      t.status AS "taskStatus",
      t.description AS "taskDescription",
      t.due_at AS "taskDueAt",
      t.assigned_to_uid AS "taskAssignedToUid",
      t.created_at AS "taskCreatedAt",
      t.updated_at AS "taskUpdatedAt",
      t.priority AS "taskPriority",

      t.qa_assigned_to_uid AS "qaAssignedToUid",
      t.is_qa_approved AS "isQaApproved",
      qaAssigned.first_name AS "qaAssignedToFirstName",
      qaAssigned.last_name AS "qaAssignedToLastName",
      CONCAT(qaAssigned.first_name, ' ', qaAssigned.last_name) as "qaAssignedTo",

      taskAssigned.first_name AS "taskAssignedToFirstName",
      taskAssigned.last_name AS "taskAssignedToLastName",
      CONCAT(taskAssigned.first_name, ' ', taskAssigned.last_name) as "taskAssignedTo",
      taskAssigned.username AS "taskAssignedToUsername"

    FROM events e

    LEFT JOIN users assigned
      ON assigned.uid = e.assigned_to_uid

    JOIN users me
      ON me.uid = $(assignedToUid)

    LEFT JOIN tasks t
      ON t.event_uid = e.uid
      AND t.status <> 'deleted'

    LEFT JOIN users taskAssigned
      ON taskAssigned.uid = t.qa_assigned_to_uid

    LEFT JOIN users qaAssigned
      ON qaAssigned.uid = t.qa_assigned_to_uid

    WHERE e.tenant_uid = $(tenantUid)
      AND (
        me.role = 'admin'
        OR e.assigned_to_uid = $(assignedToUid)
        OR t.qa_assigned_to_uid = $(assignedToUid)
      )

    ORDER BY e.created_at DESC, t.created_at ASC;
  `;

  const db = getDb();
  const rows = await db.any(sql, { tenantUid, assignedToUid });
  return rows;
};

// _______________________________________________new____________________________
async function taskCompletedService(taskUid) {
  const db = await getDb();
  const sql = `
    UPDATE tasks
    SET 
      status = 'completed',
      is_qa_approved = false
    WHERE uid = $(task_uid);
  `;

  const k = await db.one(sql, { task_uid: taskUid });
  return k;
}
// new
// add single transaction
async function qaRejectTaskService(
  tenantUid,
  eventUid,
  taskUid,
  qaUserUid,
  comments,
) {
  const db = await getDb();
  const reviewSql = `
    INSERT INTO task_qa_reviews (
      tenant_uid,
      event_uid,
      task_uid,
      qa_user_uid,
      review_status,
      comments
    )
    VALUES (
      $(tenant_uid),
      $(event_uid),
      $(task_uid),
      $(qa_user_uid),
      'rejected',
      $(comments)
    );
  `;
  const reviewsUpdateRes = db.one(reviewSql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    task_uid: taskUid,
    qa_user_uid: qaUserUid,
    comments,
  });

  const updateTasksSql = `
    UPDATE tasks
    SET
      is_qa_approved = false,
      status = 'in_progress'
    WHERE uid = $(task_uid);
  `;
  const updateTasksRes = db.one(reviewSql, {
    task_uid: taskUid,
  });

  const res = Promise.all([reviewsUpdateRes, updateTasksRes]);
}
// new
// add single transaction
async function qaApprovesTaskService(
  tenantUid,
  eventUid,
  taskUid,
  qaUserUid,
  comments,
) {
  const db = await getDb();
  const reviewSql = `
    INSERT INTO task_qa_reviews (
      tenant_uid,
      event_uid,
      task_uid,
      qa_user_uid,
      review_status,
      comments
    )
    VALUES (
      $(tenant_uid),
      $(event_uid),
      $(task_uid),
      $(qa_user_uid),
      'approved',
      $(comments)
    );
  `;
  const reviewsUpdateRes = db.one(reviewSql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    task_uid: taskUid,
    qa_user_uid: qaUserUid,
    comments,
  });

  const updateTasksSql = `
    UPDATE tasks
    SET
      is_qa_approved = true,
      qa_approved_by = $(qa_user_uid),
      qa_approved_at = now()
    WHERE uid = $(task_uid);
  `;
  const updateTasksRes = db.one(updateTasksSql, {
    task_uid: taskUid,
    qa_user_uid: qaUserUid,
  });

  const res = Promise.all([reviewsUpdateRes, updateTasksRes]);
}

module.exports = {
  createTaskService,
  getTaskService,
  getTasksByEventService,
  assignTaskService,
  updateTaskService,
  acceptTaskService,
  declineTaskService,
  deleteTaskService,
  qaEventsAndTasksService,
};
