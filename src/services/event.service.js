const { getDb } = require("../db/db");
const { convertQueryParams } = require("../utils/pg.utils");

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

async function getEventsService(query) {
  const conditions = [];
  const params = {
    tenant_uid: query.tenantUid, // required
  };

  const queries = [
    // {
    //   query: "tenantUid",
    //   condition: "t.tenant_uid = $(tenantUid)",
    //   value: query.tenantUid,
    // },
    {
      query: "eventUid",
      condition: "e.uid = $(eventUid)",
      value: query.eventUid,
    },
    {
      query: "assignedToUid",
      condition: "e.assigned_to_uid = $(assignedToUid)",
      value: query.assignedToUid,
    },
    {
      query: "status",
      condition: "e.status IN ($(status:csv))",
      value: convertQueryParams(query.status),
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
  const eventsSQLQuery = db.any(
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
        u.first_name as "firstName",
        u.username as "userName"
        from events e
        left join users u on u.uid = e.assigned_to_uid
        ${whereClause}
        ORDER BY e.created_at DESC;
      `,
    params,
  );

  const statusCountsSQLQuery = getEventStatusCount(db, params);

  const responses = await Promise.all([eventsSQLQuery, statusCountsSQLQuery]);

  const events = responses[0];
  const statusCounts = responses[1];

  return { events, statusCounts };
}

async function getEventStatusCount(db, params) {
  const countResponse = await db.any(
    `
      SELECT 
        e.status,
        COUNT(*) as count
      FROM events e
      WHERE e.tenant_uid = $(tenant_uid)
      GROUP BY e.status
      `,
    params,
  );

  const allStatuses = [
    "pending",
    "assigned",
    "accepted",
    "ready",
    "in_progress",
    "completed",
    "declined",
    "cancelled",
    "deleted",
  ];

  console.log("abdul res", countResponse);

  const statusCountMap = {};

  // allStatuses.forEach((status) => {
  //   statusCountMap[status] = 0;
  // });

  // statusCounts.forEach((row) => {
  //   statusCountMap[row.status] = Number(row.count);
  // });

  const obj = allStatuses.reduce(
    (acu, cur) => {
      const groupObj = countResponse.find((el) => el.status === cur) || {};
      const numberMod = Number(groupObj.count) || 0;

      const restObj = { ...acu };
      restObj[cur] = numberMod;

      restObj.total = restObj.total + numberMod;
      return restObj;
    },
    { total: 0 },
  );

  console.log("abdul statusCounts", obj);

  return obj;
}

async function updateEventService(updatePayload) {
  const { tenantUid, eventUid, updatedByUid: actorUid } = updatePayload;

  const sql = `
    UPDATE events
    SET
      event_name = COALESCE($(event_name), event_name),
      comments = COALESCE($(comments), comments),
      event_type = COALESCE($(event_type), event_type),
      scheduled_at = COALESCE($(scheduled_at), scheduled_at),
      expected_attendees = COALESCE($(expected_attendees), expected_attendees),
      assigned_to_uid = COALESCE($(assigned_to_uid), assigned_to_uid),
      status = COALESCE($(status), status),
      venue = COALESCE($(venue), venue),
      updated_at = now(),
      updated_by_uid = $(actor_uid)
    WHERE tenant_uid = $(tenant_uid)
      AND uid = $(event_uid)
    RETURNING *;
  `;

  const db = getDb();
  return db.oneOrNone(sql, {
    tenant_uid: tenantUid,
    event_uid: eventUid,
    actor_uid: actorUid,
    event_name: updatePayload.event_name ?? null,
    event_type: updatePayload.event_type ?? null,
    scheduled_at: updatePayload.scheduled_at ?? null,
    venue: updatePayload.venue ?? null,
    status: updatePayload.status,
    expected_attendees:
      updatePayload.expected_attendees !== undefined
        ? Number(updatePayload.expected_attendees)
        : null,
    comments: updatePayload.comments ?? null,
    assigned_to_uid: updatePayload.assigned_to_uid,
  });
}

async function assignEventService(
  tenantUid,
  eventUid,
  assignedToUid,
  updatedByUid,
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
  deleteReason = null,
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
  updateEventService,
  assignEventService,
  acceptEvent,
  declineEvent,
  getAllEvents,
  eventsAssignedToMe,
  deleteEvent,
};
