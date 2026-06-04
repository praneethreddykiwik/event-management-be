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

// ======================= Events Section models =======================

const declineEventReqModel = (req) => {
  return {
    tenantUid: req.body.tenantUid,
    eventUid: req.body.eventUid,
    eventManagerUid: req.body.eventManagerUid,
    declineReason: req.body.declineReason,
  };
};

module.exports = {
  // User exports
  createUserReqModel,
  // Event exports
  declineEventReqModel,
};
