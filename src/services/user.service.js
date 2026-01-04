const { users } = require("../../database");
const { getDb } = require("../db/db");
// const Event = require("../models/Event");

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
        (tenant_uid, username, email, password_hash, role)
      values
        ($(tenant_uid), $(username), $(email), $(password_hash), $(role))
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
        ${providePasswordHash ? "u.password_hash," : ""}
        t.tenant_id
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
  const { uid, username, role, email, status } = data;
  const db = getDb();

  const response = await db.oneOrNone(
    `
    UPDATE users
    SET
      email = COALESCE($(email), email),
      username = COALESCE($(username), username),
      role = COALESCE($(role), role),
      status = COALESCE($(status), status)
    WHERE uid = $(uid)
    RETURNING *;
    `,
    { email, username, role, status, uid }
  );

  return response;
};

module.exports = {
  createUserService,
  getUsersService,
  deleteEventService,
  updateUserService,
};
