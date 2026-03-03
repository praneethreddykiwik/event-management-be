/** @format */

const { getDb } = require("../db/db");

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
  const limit = query.limit || 50;
  const offset = query.offset || 0;

  console.log("abdul query", query);

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
      limit $(limit) offset $(offset)
    `,
    { ...params, limit, offset },
  );

  return users;
};

const getEventManagersService = async (query, providePasswordHash) => {
  const limit = query.limit || 50;
  const offset = query.offset || 0;

  console.log("abdul query", query);

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
      where t.tenant_id = $(tenantId) and u.role in ('event_manager', 'admin')
    `,
    { tenantId: query.tenantId },
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

const userEventsTasksService = async (tenantUid, assignedToUid) => {
  const sql = `
  SELECT
  e.uid AS "eventUid",
  e.event_name AS "eventName",
  e.event_type AS "eventType",
  e.scheduled_at AS "evenScheduledAt",
  e.venue AS "eventVenue",
  e.expected_attendees AS "expectedAttendees",
  e.status AS "eventStatus",
  e.assigned_to_uid AS "eventAssignedToUid",
  e.created_at AS "eventCreatedAt",

  u.first_name AS "eventAssignedToFirstName",
  u.last_name AS "eventAssignedToLastName",
  u.username AS "eventAssignedToUsername",


  t.uid AS "taskUid",
  t.title AS "taskTitle",
  t.status AS "taskStatus",
  t.description AS "taskDescription",
  t.due_at AS "taskDueAt",
  t.assigned_to_uid AS "taskAssignedToUid",
  t.created_at AS "taskCreatedAt"

FROM events e


LEFT JOIN users u
  ON u.uid = e.assigned_to_uid

LEFT JOIN tasks t
  ON t.event_uid = e.uid
  AND t.status <> 'deleted'

WHERE e.tenant_uid = $(tenantUid)
  AND e.assigned_to_uid = $(assignedToUid)
  AND e.status <> 'deleted'

ORDER BY e.created_at DESC, t.created_at ASC;
`;
  const db = getDb();
  const rows = await db.any(sql, { tenantUid, assignedToUid });
  console.log("abdul rows", { tenantUid, assignedToUid });
  return rows;
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

module.exports = {
  createUserService,
  getUsersService,
  deleteEventService,
  updateUserService,
  userEventsTasksService,
  deleteUserService,
  getEventManagersService,
};
