const createUserReqModel = (
  tenantUid,
  username,
  email,
  passwordHash,
  role,
  firstName,
  lastName,
  mobile
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

module.exports = {
  createUserReqModel,
  createEventReqModel,
  declineEventReqModel,
  acceptEventReqModel,
};
