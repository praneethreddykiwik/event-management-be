const createUserReqModel = (tenantUid, username, email, passwordHash, role) => {
  return {
    tenant_uid: tenantUid,
    username,
    email,
    password_hash: passwordHash,
    role,
  };
};

const createEventReqModel = (req) => {
  return {
    tenant_uid: req.session.user.tenantUid,
    event_name: req.body.eventName,
    event_type: req.body.eventType,
    scheduled_at: req.body.scheduledAt,
    venue: req.body.venue || null,
    expected_attendees: Number(req.body.expectedAttendees || 0),
    status: req.body.status,
    assigned_event_manager_uid: req.body.assignedEventManagerUid, // uuid
    comments: req.body.comments || null,
    created_by_uid: req.session.user.uid,
  };
};

module.exports = {
  createUserReqModel,
  createEventReqModel,
};
