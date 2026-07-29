/** @format */

const utils = require("../utils/utils");
const { getDb } = require("../db/db");
const { convertQueryParams } = require("../utils/pg.utils");

const deleteEventService = async (eventId) => {
  const deleted = await Event.findOneAndDelete({ eventId });

  if (!deleted) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  return deleted;
};

const createUserService = async (payload) => {
  const db = getDb();
  const response = await db.one(
    `
      insert into users
        (tenant_uid, username, email, password_hash, role, first_name, last_name, mobile)
      values
        ($(tenant_uid), $(username), $(email), $(password_hash), $(role), $(first_name), $(last_name), $(mobile))
      returning
        uid, username, email, role, status
    `,
    payload,
  );

  return response;
};

const getUsersService = async (query, providePasswordHash) => {
  const limit = query.limit || 100;

  const conditions = [];
  const params = {};

  const queries = [
    { query: "tenantId", condition: "t.tenant_id = $(tenantId)" },
    { query: "username", condition: "u.username = $(username)" },
    { query: "email", condition: "lower(u.email) = lower($(email))" },
    { query: "status", condition: "u.status IN ($(status:csv))" },
    { query: "role", condition: "u.role IN ($(role:csv))" },
  ];

  queries.forEach((el) => {
    if (query[el.query]) {
      conditions.push(el.condition);
      params[el.query] = convertQueryParams(query[el.query]);
    }
  });

  const whereClause = conditions.length
    ? `where ${conditions.join(" and ")}`
    : "";

  const db = getDb();
  const users = await db.any(
    `
      select
        u.uid,
        u.username,
        u.email,
        u.role,
        u.status,
        u.first_name as "firstName",
        u.last_name as "lastName", 
        u.mobile,
        ${providePasswordHash ? "u.password_hash," : ""}
        t.tenant_id,
        t.uid as "tenantUid"
      from users u
      join tenants t on t.uid = u.tenant_uid
      ${whereClause}
      limit $(limit)
    `,
    { ...params, limit },
  );

  return users;
};

const getEventManagersService = async (query, providePasswordHash) => {
  const conditions = [];
  const params = {};

  const queries = [
    { query: "tenantId", condition: "t.tenant_id = $(tenantId)" },
    { query: "username", condition: "u.username = $(username)" },
    { query: "email", condition: "lower(u.email) = lower($(email))" },
    { query: "status", condition: "u.status = $(status)" },
    { query: "role", condition: "u.role = $(role)" },
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
        u.uid,
        u.username,
        u.email,
        u.role,
        u.status,
        u.first_name as "firstName",
        u.last_name as "lastName", 
        u.mobile,
        ${providePasswordHash ? "u.password_hash," : ""}
        t.tenant_id,
        t.uid as "tenantUid"
      from users u
      join tenants t on t.uid = u.tenant_uid
      ${whereClause}
    `,
    params,
  );

  return users;
};

const updateUserService = async (data) => {
  const { uid, username, role, email, status, firstName, lastName, mobile } =
    data;

  const db = getDb();

  const response = await db.oneOrNone(
    `
    UPDATE users
    SET
      email = COALESCE($(email), email),
      username = COALESCE($(username), username),
      role = COALESCE($(role), role),
      status = COALESCE($(status), status),
      first_name = COALESCE($(firstName), first_name),
      last_name = COALESCE($(lastName), last_name),
      mobile = COALESCE($(mobile), mobile)
    WHERE uid = $(uid)
    RETURNING *;
    `,
    { email, username, role, status, uid, firstName, lastName, mobile },
  );

  return response;
};

// qa_assigned_to_uid: qaAssignedTo,
const userEventsTasksService = async (tenantUid, assignedToUid, status) => {
  const statusArr = status?.split(",") || [];
  const taskJoinType = statusArr.length ? "INNER JOIN" : "LEFT JOIN";
  const statusCondition = statusArr.length
    ? "AND t.status IN ($(statusArr:csv))"
    : "";
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

    ${taskJoinType} tasks t
      ON t.event_uid = e.uid
      ${statusCondition}

    LEFT JOIN users taskAssigned
      ON taskAssigned.uid = t.assigned_to_uid

    LEFT JOIN users qaAssigned
      ON qaAssigned.uid = t.qa_assigned_to_uid

    WHERE e.tenant_uid = $(tenantUid)
      AND (
        me.role = 'admin'
        OR e.assigned_to_uid = $(assignedToUid)
        OR t.assigned_to_uid = $(assignedToUid)
      )

    ORDER BY e.created_at DESC, t.created_at ASC;
  `;

  const db = getDb();
  const tasksQuery = db.any(sql, {
    tenantUid,
    assignedToUid,
    statusArr,
  });

  const countQuery = getTaskStatusCount(db, tenantUid, assignedToUid);

  const [rows, countObj] = await Promise.all([tasksQuery, countQuery]);

  return {
    rows,
    countObj,
  };
};

const getTaskStatusCount = async (db, tenantUid, assignedToUid) => {
  const countResponse = await db.any(
    `
    SELECT
      t.status,
      COUNT(*) AS count
    FROM tasks t

    JOIN events e
      ON e.uid = t.event_uid

    JOIN users me
      ON me.uid = $(assignedToUid)

    WHERE
      e.tenant_uid = $(tenantUid)
      AND t.status <> 'deleted'
      AND (
        me.role = 'admin'
        OR e.assigned_to_uid = $(assignedToUid)
        OR t.assigned_to_uid = $(assignedToUid)
      )

    GROUP BY t.status;
    `,
    { tenantUid, assignedToUid },
  );

  const allStatuses = [
    "not_started",
    "assigned",
    "in_progress",
    "ready_for_qa",
    "qa_in_progress",
    "completed",
    "cancelled",
    "deleted",
  ];

  return allStatuses.reduce(
    (acc, cur) => {
      const groupObj = countResponse.find((el) => el.status === cur) || {};
      const count = Number(groupObj?.count || 0);

      acc[utils.snakeToCamel(cur)] = count;
      acc.total += count;

      return acc;
    },
    { total: 0 },
  );
};

const deleteUserService = async (uid) => {
  const db = getDb();

  // 1. Check if user is referenced anywhere
  const involvement = await db.one(
    `
    SELECT
      EXISTS (
        SELECT 1 FROM events WHERE assigned_to_uid = $(uid)
      ) AS in_events,
      EXISTS (
        SELECT 1 FROM tasks WHERE assigned_to_uid = $(uid)
      ) AS in_tasks
    `,
    { uid },
  );

  if (involvement.in_events || involvement.in_tasks) {
    const err = new Error("User is involved in event or tasks");
    err.code = 409; // Conflict
    throw err;
  }

  // 2. Hard delete user
  const deletedUser = await db.oneOrNone(
    `
    DELETE FROM users
    WHERE uid = $(uid)
    RETURNING uid, username, email;
    `,
    { uid },
  );

  if (!deletedUser) {
    const err = new Error("User not found");
    err.code = 404;
    throw err;
  }

  return deletedUser;
};

async function listUsers(tenantUid, role, userUid, filters) {
  const {
    role: filterRole,
    status,
    limit = 20,
    offset = 0,
    includeInactive = false,
  } = filters;

  const safeLimit = Math.min(Number(limit) || 20, 100);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  const baseWhere = [];
  const params = {
    tenant_uid: tenantUid,
    limit: safeLimit,
    offset: safeOffset,
  };

  baseWhere.push(`u.tenant_uid = $(tenant_uid)`);

  if (!includeInactive) {
    baseWhere.push(`u.status <> 'inactive'`);
  }

  if (role === "event_manager") {
    baseWhere.push(`u.uid = $(me_uid)`);
    params.me_uid = userUid;
  }

  if (filterRole) {
    baseWhere.push(`u.role = $(filter_role)`);
    params.filter_role = filterRole;
  }

  if (status) {
    baseWhere.push(`u.status = $(status)`);
    params.status = status;
  }

  const whereSql = baseWhere.length ? `WHERE ${baseWhere.join(" AND ")}` : "";

  const sql = `
    SELECT 
      u.uid,
      u.username,
      u.email,
      u.role,
      u.status,
      u.first_name AS "firstName",
      u.last_name AS "lastName",
      u.mobile,
      u.created_at AS "createdAt"
    FROM users u
    ${whereSql}
    ORDER BY u.created_at DESC
    LIMIT $(limit) OFFSET $(offset);
  `;

  const db = getDb();
  return db.any(sql, params);
}

module.exports = {
  createUserService,
  getUsersService,
  deleteEventService,
  updateUserService,
  userEventsTasksService,
  getTaskStatusCount,
  deleteUserService,
  getEventManagersService,
  listUsers,
};
