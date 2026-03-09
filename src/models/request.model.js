const createUserReqModel = (
  tenantUid,
  username,
  email,
  passwordHash,
  role,
  firstName,
  lastName,
  mobile,
) => {
  return {
    tenant_uid: tenantUid,
    username,
    email,
    password_hash: passwordHash,
    role,
    first_name: firstName,
    last_name: lastName,
    mobile,
  };
};

// ======================= Tasks Section models =======================

const createTaskReqModel = (req) => {
  return {
    tenantUid: req.body.tenantUid,
    eventUid: req.body.eventUid,
    title: req.body.title,
    description: req.body.description || null,
    priority: req.body.priority || "medium",
    dueAt: req.body.dueAt || null,
    assignedToUid: req.body.assignedToUid || null,
    createdByUid: req.body.createdByUid || req.session.user.uid,
    updatedByUid: req.body.updatedByUid || req.session.user.uid,
    status: req.body.status,
  };
};

// ======================= Events Section models =======================

const createEventReqModel = (req) => {
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

const acceptEventReqModel = (req) => {
  return {
    tenantUid: req.body.tenantUid,
    eventUid: req.body.eventUid,
    eventManagerUid: req.body.eventManagerUid,
  };
};

const declineEventReqModel = (req) => {
  return {
    tenantUid: req.body.tenantUid,
    eventUid: req.body.eventUid,
    eventManagerUid: req.body.eventManagerUid,
    declineReason: req.body.declineReason,
  };
};

const updateEventReqModel = (req) => {
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

module.exports = {
  // User exports
  createUserReqModel,

  // Task exports
  createTaskReqModel,

  // Event exports
  createEventReqModel,
  declineEventReqModel,
  updateEventReqModel,
  acceptEventReqModel,
};
