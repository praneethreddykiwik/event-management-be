const { getDb } = require("../db/db");

const createEventService = async (payload) => {
  const sql = `
  INSERT INTO events (
    tenant_uid,
    event_name,
    event_type,
    scheduled_at,
    venue,
    expected_attendees,
    status,
    comments,
    assigned_to_uid,
    assigned_at,
    created_by_uid
  )
  VALUES (
    $(tenant_uid),
    $(event_name),
    $(event_type),
    $(scheduled_at),
    $(venue),
    $(expected_attendees),
    $(status),
    $(comments),
    $(assigned_to_uid),
    now(),
    $(created_by_uid)
  )
  RETURNING *;
`;

  const db = getDb();
  const createdRes = await db.one(sql, payload);
  console.log("createEventService", createdRes);
  return createdRes;
};

async function listEvents(tenantUid, role, userUid, filters) {
  const {
    status,
    from, // ISO date-time or date
    to,
    assignedTo, // uuid (admin only; EM ignored)
    limit = 20,
    offset = 0,
    includeDeleted = false,
  } = filters;

  const safeLimit = Math.min(Number(limit) || 20, 100);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  // RBAC base conditions
  // - admin: all tenant events
  // - event_manager: only events assigned to them (tenant-scoped)
  const baseWhere = [];
  const params = {
    tenant_uid: tenantUid,
    limit: safeLimit,
    offset: safeOffset,
  };

  baseWhere.push(`e.tenant_uid = $(tenant_uid)`);

  if (!includeDeleted) {
    baseWhere.push(`e.status <> 'deleted'`);
  }

  if (role === "event_manager") {
    baseWhere.push(`e.assigned_to_uid = $(me_uid)`);
    params.me_uid = userUid;
  } else if (role === "admin" && assignedTo) {
    baseWhere.push(`e.assigned_to_uid = $(assigned_to)`);
    params.assigned_to = assignedTo;
  }

  if (status) {
    baseWhere.push(`e.status = $(status)`);
    params.status = status;
  }

  if (from) {
    baseWhere.push(`e.scheduled_at >= $(from)`);
    params.from = from;
  }
  if (to) {
    baseWhere.push(`e.scheduled_at <= $(to)`);
    params.to = to;
  }

  const whereSql = baseWhere.length ? `WHERE ${baseWhere.join(" AND ")}` : "";

  const sql = `
    SELECT e.*
    FROM events e
    ${whereSql}
    ORDER BY e.scheduled_at DESC
    LIMIT $(limit) OFFSET $(offset);
  `;

  const db = getDb();
  return db.any(sql, params);
}

// aadil
async function getEventsService(query, includeDeleted = false) {
  const conditions = [];
  const params = {};

  const queries = [
    // { query: "tenantId", condition: "t.tenant_id = $(tenantId)" },
    { query: "eventUid", condition: "e.uid = $(eventUid)" },
    {
      query: "assignedToUid",
      condition: "e.assigned_to_uid = $(assignedToUid)",
    },
  ];

  queries.forEach((el) => {
    if (query[el.query]) {
      conditions.push(el.condition);
      params[el.query] = query[el.query];
    }
  });
  // conditions.push(
  //   "($(events_status_check)::boolean = true OR status <> 'deleted')"
  // );

  const whereClause = conditions.length
    ? `where ${conditions.join(" and ")}`
    : "";

  const db = getDb();
  const events = await db.any(
    `
      select
        e.uid,
        e.tenant_uid as "tenantUid",
        e.event_name as "eventName",
        e.event_type as "eventType",
        e.scheduled_at as "scheduledAt",
        e.venue,
        e.expected_attendees as "expectedAttendees",
        e.status,
        e.assigned_to_uid as "assignedToUid",
        e.assigned_at as "assignedAt",
        e.accepted_at as "acceptedAt",
        e.declined_at as "declinedAt",
        e.decline_reason as "declineReason",
        e.comments,
        e.created_at as "createdAt",
        e.updated_at as "updatedAt",
        e.created_by_uid as "createdByUid",
        e.updated_by_uid as "updatedByUid",
        e.deleted_at as "deletedAt",
        e.delete_reason as "deleteReason",
        u.first_name as "firstName"
        from events e
        left join users u on u.uid = e.assigned_to_uid
        ${whereClause}
        `,
    {
      tenant_uid: query.tenantUid,
      eventUid: query.eventUid,
      assignedToUid: query.assignedToUid,
      include_deleted: includeDeleted,
    }
  );

  return events;
}

async function updateEvent(tenantUid, eventUid, patch, actorUid) {
  const sql = `
    UPDATE events
    SET
      event_name = COALESCE($(event_name), event_name),
      event_type = COALESCE($(event_type), event_type),
      scheduled_at = COALESCE($(scheduled_at), scheduled_at),
      venue = COALESCE($(venue), venue),
      expected_attendees = COALESCE($(expected_attendees), expected_attendees),
      comments = COALESCE($(comments), comments),
      updated_at = now(),
      updated_by_uid = $(actor_uid)
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(event_uid)
      AND status <> 'deleted'
    RETURNING *;
  `;

  const db = getDb();
  return db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    actor_uid: actorUid,
    event_name: patch.event_name ?? null,
    event_type: patch.event_type ?? null,
    scheduled_at: patch.scheduled_at ?? null,
    venue: patch.venue ?? null,
    expected_attendees:
      patch.expected_attendees !== undefined
        ? Number(patch.expected_attendees)
        : null,
    comments: patch.comments ?? null,
  });
}

async function updateEventService({
  tenantUid,
  eventUid,
  updatedByUid,
  updateFields,
}) {
  // whitelist + map camelCase → snake_case
  const patch = {
    event_name: updateFields.eventName,
    event_type: updateFields.eventType,
    scheduled_at: updateFields.scheduledAt,
    venue: updateFields.venue,
    expected_attendees: updateFields.expectedAttendees,
    comments: updateFields.comments,
  };

  return updateEvent(tenantUid, eventUid, patch, updatedByUid);
}

async function assignEventService(
  tenantUid,
  eventUid,
  assignedToUid,
  updatedByUid
) {
  const sql = `
    UPDATE events
    SET
      assigned_to_uid = $(assigned_to_uid),
      assigned_at = now(),
      status = 'assigned',
      updated_at = now(),
      updated_by_uid = $(updated_by_uid)
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(event_uid)
      AND status <> 'deleted'
    RETURNING *;
  `;

  const db = getDb();
  return db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    assigned_to_uid: assignedToUid,
    updated_by_uid: updatedByUid,
  });
}

async function acceptEvent({ tenantUid, eventUid, eventManagerUid }) {
  const sql = `
    UPDATE events
    SET
      status = 'accepted',
      accepted_at = now(),
      updated_at = now(),
      updated_by_uid = $(manager_uid)
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(event_uid)
      AND assigned_to_uid = $(manager_uid)
      AND status IN ('assigned', 'declined') -- allow accept after reassignment, adjust as you like
    RETURNING *;
  `;
  const db = getDb();
  return db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    manager_uid: eventManagerUid,
  });
}

const declineEvent = async ({
  tenantUid,
  eventUid,
  eventManagerUid,
  declineReason = null,
}) => {
  const sql = `
    UPDATE events
    SET
      status = 'declined',
      declined_at = now(),
      decline_reason = $(decline_reason),
      updated_at = now(),
      updated_by_uid = $(manager_uid)
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(event_uid)
      AND assigned_to_uid = $(manager_uid)
      AND status IN ('assigned')
    RETURNING *;
  `;

  const db = getDb();
  return db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    manager_uid: eventManagerUid,
    decline_reason: declineReason,
  });
};

// according to tenant
const getAllEvents = async (req) => {
  const sql = `
  SELECT *
  FROM events
  WHERE tenant_uid = $(tenant_uid)
    AND status <> 'deleted'
  ORDER BY scheduled_at DESC;
`;
  const db = getDb();
  const rows = await db.any(sql, { tenant_uid: req.session.user.tenantUid });
  return rows;
};

const eventsAssignedToMe = async (req) => {
  const sql = `
    SELECT *
    FROM events
    WHERE tenant_uid = $(tenant_uid)
      AND assigned_to_uid = $(uid)
    ORDER BY scheduled_at ASC;
    `;

  const db = getDb();
  const rows = await db.any(sql, {
    tenant_uid: req.session.user.tenantUid,
    uid: req.session.user.uid,
  });
  return rows;
};

const deleteEvent = async (
  tenantUid,
  eventUid,
  actorUid,
  deleteReason = null
) => {
  const sql = `
    UPDATE events
    SET
      status = 'deleted',
      deleted_at = now(),
      deleted_by_uid = $(actor_uid),
      delete_reason = $(delete_reason),
      updated_at = now(),
      updated_by_uid = $(actor_uid)
    WHERE uid = $(event_uid)
      AND tenant_uid = $(tenant_uid)
      AND status <> 'deleted'
    RETURNING *;
  `;

  const db = getDb();
  const result = await db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    actor_uid: actorUid,
    delete_reason: deleteReason,
  });

  if (!result) {
    const err = new Error("Event not found or already deleted");
    err.statusCode = 404;
    throw err;
  }

  return result;
};

module.exports = {
  createEventService,
  listEvents,
  getEventsService,
  updateEvent,
  updateEventService,
  assignEventService,
  acceptEvent,
  declineEvent,
  getAllEvents,
  eventsAssignedToMe,
  deleteEvent,
};
