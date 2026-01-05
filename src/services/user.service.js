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
    payload
  );

  return response;
};

const getUsersService = async (query, providePasswordHash) => {
  const limit = query.limit || 50;
  const offset = query.offset || 0;

  const conditions = [];
  const params = {};

  const queries = [
    { query: "tenantId", condition: "t.tenant_id = $(tenantId)" },
    { query: "username", condition: "u.username = $(username)" },
    { query: "email", condition: "lower(u.email) = lower($(email))" },
    { query: "status", condition: "u.status = $(status)" },
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
    { ...params, limit, offset }
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
      status = COALESCE($(status), status)
      first_name = COALESCE($(firstName), firstName),
      last_name = COALESCE($(lastName), lastName),
      mobile = COALESCE($(mobile), mobile)
    WHERE uid = $(uid)
    RETURNING *;
    `,
    { email, username, role, status, uid, firstName, lastName, mobile }
  );

  return response;
};

const userEventsTasksService = async (tenantUid, assignedToUid) => {
  const sql = `
  SELECT
    e.uid AS event_uid,
    e.event_name,
    e.event_type,
    e.scheduled_at,
    e.venue,
    e.expected_attendees,
    e.status AS event_status,
    e.assigned_to_uid AS event_assigned_to_uid,
    e.created_at AS event_created_at,

    t.uid AS task_uid,
    t.title AS task_title,
    t.status AS task_status,
    t.due_at AS task_due_at,
    t.assigned_to_uid AS task_assigned_to_uid,
    t.created_at AS task_created_at
  FROM events e
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

  return rows;
};

module.exports = {
  createUserService,
  getUsersService,
  deleteEventService,
  updateUserService,
  userEventsTasksService,
};
