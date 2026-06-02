const generateGetUsersReq = (query) => {
  if (!query) {
    console.error("[generateGetUsersReq]", "Missing query");
  }

  return {
    tenantUid: query.tenantUid,
    uid: query.uid,
    username: query.username,
    email: query.email,
    role: query.role,
    status: query.status,
  };
};

const generateGetEventManagersReq = (query) => {
  if (!query) {
    console.error("[generateGetEventManagersReq]", "Missing query");
  }

  return {
    tenantUid: query.tenantUid,
    role: query.role,
    status: query.status,
  };
};

const generateUpdateUserReq = (body) => {
  if (!body) {
    console.error("[generateUpdateUserReq]", "Missing body");
  }

  return {
    uid: body.uid,
    mobile: body.mobile,
    status: body.status,
    role: body.role,
    username: body.username,
    email: body.email,
    firstName: body.firstName,
    lastName: body.lastName,
  };
};

const generateUserEventsTasksReq = (query) => {
  if (!query) {
    console.error("[generateUserEventsTasksReq]", "Missing query");
  }

  return {
    tenantUid: query.tenantUid,
    assignedToUid: query.assignedToUid,
  };
};

const generateDeleteUserReq = (query) => {
  if (!query) {
    console.error("[generateDeleteUserReq]", "Missing query");
  }

  return {
    uid: query.uid,
  };
};

module.exports = {
  generateGetUsersReq,
  generateGetEventManagersReq,
  generateUpdateUserReq,
  generateUserEventsTasksReq,
  generateDeleteUserReq,
};