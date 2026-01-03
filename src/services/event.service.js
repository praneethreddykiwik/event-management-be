const { getDb } = require("../db/db");

// create event + assign event manager
const createEventService = async (req) => {
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
    assigned_event_manager_uid,
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
    'assigned',
    $(comments),
    $(assigned_event_manager_uid),
    now(),
    $(created_by_uid)
  )
  RETURNING *;
`;

  const payload = {
    tenant_uid: req.session.user.tenantUid,
    event_name: req.body.eventName,
    event_type: req.body.eventType,
    scheduled_at: req.body.scheduledAt,
    venue: req.body.venue || null,
    expected_attendees: Number(req.body.expectedAttendees || 0),
    assigned_event_manager_uid: req.body.assignedEventManagerUid, // uuid
    comments: req.body.comments || null,
    created_by_uid: req.session.user.uid,
  };

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
    baseWhere.push(`e.assigned_event_manager_uid = $(me_uid)`);
    params.me_uid = userUid;
  } else if (role === "admin" && assignedTo) {
    baseWhere.push(`e.assigned_event_manager_uid = $(assigned_to)`);
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
async function getEventByUid(tenantUid, eventUid, includeDeleted = false) {
  const sql = `
    SELECT *
    FROM "emdb-schema".events
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(event_uid)
      AND ($(include_deleted)::boolean = true OR status <> 'deleted')
    LIMIT 1;
  `;
  const db = getDb();
  return db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    include_deleted: includeDeleted,
  });
}

async function updateEvent(tenantUid, eventUid, patch, actorUid) {
  const sql = `
    UPDATE "emdb-schema".events
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

async function assignEventManager(tenantUid, eventUid, managerUid, actorUid) {
  const sql = `
    UPDATE "emdb-schema".events
    SET
      assigned_event_manager_uid = $(manager_uid),
      assigned_at = now(),
      status = 'assigned',
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
    manager_uid: managerUid,
    actor_uid: actorUid,
  });
}

async function acceptEvent(db, { tenantUid, eventUid, eventManagerUid }) {
  const sql = `
    UPDATE events
    SET
      status = 'accepted',
      accepted_at = now(),
      updated_at = now(),
      updated_by_uid = $(manager_uid)
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(event_uid)
      AND assigned_event_manager_uid = $(manager_uid)
      AND status IN ('assigned', 'declined') -- allow accept after reassignment, adjust as you like
    RETURNING *;
  `;
  return db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    manager_uid: eventManagerUid,
  });
}

const declineEvent = async (
  tenantUid,
  eventUid,
  managerUid,
  declineReason = null
) => {
  const sql = `
    UPDATE "emdb-schema".events
    SET
      status = 'declined',
      declined_at = now(),
      decline_reason = $(decline_reason),
      updated_at = now(),
      updated_by_uid = $(manager_uid)
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(event_uid)
      AND assigned_event_manager_uid = $(manager_uid)
      AND status IN ('assigned')
    RETURNING *;
  `;

  const db = getDb();
  return db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    manager_uid: managerUid,
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
      AND assigned_event_manager_uid = $(uid)
    ORDER BY scheduled_at ASC;
    `;

  const db = getDb();
  const rows = await db.any(sql, {
    tenant_uid: req.session.user.tenantUid,
    uid: req.session.user.uid,
  });
  return rows;
};

const deleteEvent = async (tenantUid, eventUid, actorUid) => {
  const sql = `
    UPDATE events
    SET
        status = 'deleted',
        deleted_at = now(),
        deleted_by_uid = $(uid),
        delete_reason = $(reason),
        updated_at = now(),
        updated_by_uid = $(uid)
    WHERE uid = $(event_uid) AND tenant_uid = $(tenant_uid);
    `;

  const db = getDb();
  const result = await db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    actor_uid: actorUid,
  });

  if (!result) {
    const err = new Error("Event not found (or already deleted)");
    err.statusCode = 404;
    throw err;
  }

  return result;
};

module.exports = {
  createEventService,
  listEvents,
  getEventByUid,
  updateEvent,
  assignEventManager,
  acceptEvent,
  declineEvent,
  getAllEvents,
  eventsAssignedToMe,
  deleteEvent,
};
