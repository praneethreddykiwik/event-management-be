const generateGetEventReq = (query, session) => {
  if (!query || !session) {
    console.error("[generateGetEventReq]", "Missing query or session");
  }

  return {
    tenantUid: query.tenantUid || session?.user?.tenantUid,
    eventUid: query.eventUid,
    assignedToUid: query.assignedToUid,
    status: query.status,
  };
};

const generatecreateEventReq = (req) => {
  return {
    tenant_uid: req.body.tenantUid || req.session?.user?.tenantUid,
    event_name: req.body.eventName,
    event_type: req.body.eventType,
    scheduled_at: req.body.scheduledAt,
    venue: req.body.venue || null,
    expected_attendees: Number(req.body.expectedAttendees || 0),
    status: req.body.status,
    assigned_to_uid: req.body.assignedToUid,
    comments: req.body.comments || null,
    created_by_uid: req.body.uid || req.session?.user?.uid,
  };
};

const generateAcceptEventReq = (req) => {
  return {
    tenantUid: req.body.tenantUid,
    eventUid: req.body.eventUid,
    eventManagerUid: req.body.eventManagerUid,
  };
};

const generateUpdateEventReq = (req) => {
  const {
    eventUid,
    tenantUid: bodyTenantUid,
    updatedByUid: bodyUpdatedByUid,
    ...updateDetails
  } = req.body;

  const tenantUid = bodyTenantUid || req.session?.user?.tenantUid;
  const updatedByUid = bodyUpdatedByUid || req.session?.user?.uid;

  return {
    tenantUid,
    updatedByUid,
    eventUid,
    event_name: updateDetails.eventName,
    comments: updateDetails.comments,
    event_type: updateDetails.eventType,
    scheduled_at: updateDetails.scheduledAt,
    expected_attendees: updateDetails.expectedAttendees,
    assigned_to_uid: updateDetails.assignedToUid,
    status: updateDetails.status,
    venue: updateDetails.venue,
  };
};

const generateDeleteEventReq = (body, session) => {
  if (!body || !session) {
    console.error("[generateDeleteEventReq]", "Missing body or session");
  }

  return {
    tenantUid: body.tenantUid || session?.user?.tenantUid,
    eventUid: body.eventUid,
    actorUid: body.deletedByUid || session?.user?.uid,
    deleteReason: body.deleteReason || null,
  };
};

const generateAssignEventReq = (body, session) => {
  if (!body || !session) {
    console.error("[generateAssignEventReq]", "Missing body or session");
  }

  return {
    tenantUid: body.tenantUid || session?.user?.tenantUid,
    eventUid: body.eventUid,
    assignedToUid: body.assignedToUid,
    updatedByUid: body.updatedByUid || session?.user?.uid,
  };
};

const generateDeclineEventReq = (req) => {
  return {
    tenantUid: req.body.tenantUid,
    eventUid: req.body.eventUid,
    eventManagerUid: req.body.eventManagerUid,
    declineReason: req.body.declineReason,
  };
};

module.exports = {
  generateGetEventReq,
  generateDeleteEventReq,
  generateAssignEventReq,
  generatecreateEventReq,
  generateAcceptEventReq,
  generateUpdateEventReq,
  generateDeclineEventReq,
};
