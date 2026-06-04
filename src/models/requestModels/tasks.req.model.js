const generateGetTasksByEventReq = (query, session) => {
  if (!query || !session) {
    console.error("[generateGetTasksByEventReq]", "Missing query or session");
  }

  return {
    tenantUid: query.tenantUid || session?.user?.tenantUid,
    eventUid: query.eventUid,
  };
};

const generateCreateTaskReq = (req) => {
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
    qaAssignedTo: req.body.qaAssignedTo,
  };
};

const generateUpdateTaskReq = (body, session) => {
  if (!body || !session) {
    console.error("[generateUpdateTaskReq]", "Missing body or session");
  }

  return {
    tenantUid: body.tenantUid || session?.user?.tenantUid,
    taskUid: body.taskUid,
    title: body.title,
    description: body.description,
    priority: body.priority,
    dueAt: body.dueAt,
    assignedToUid: body.assignedToUid,
    status: body.status,
    updatedByUid: body.updatedByUid || session?.user?.uid,
  };
};

const generateAssignTaskReq = (body, session) => {
  if (!body || !session) {
    console.error("[generateAssignTaskReq]", "Missing body or session");
  }

  return {
    taskUid: body.taskUid,
    assignedToUid: body.assignedToUid,
    updatedByUid: body.updatedByUid || session?.user?.uid,
  };
};

const generateAcceptTaskReq = (body, session) => {
  if (!body || !session) {
    console.error("[generateAcceptTaskReq]", "Missing body or session");
  }

  return {
    taskUid: body.taskUid,
    assignedToUid: body.assignedToUid || session?.user?.uid,
  };
};

const generateDeclineTaskReq = (body, session) => {
  if (!body || !session) {
    console.error("[generateDeclineTaskReq]", "Missing body or session");
  }

  return {
    taskUid: body.taskUid,
    declinedByUid: body.declinedByUid || session?.user?.uid,
  };
};

const generateDeleteTaskReq = (body, session) => {
  if (!body || !session) {
    console.error("[generateDeleteTaskReq]", "Missing body or session");
  }

  return {
    taskUid: body.taskUid,
    tenantUid: body.tenantUid || session?.user?.tenantUid,
    declinedByUid: body.declinedByUid || session?.user?.uid,
  };
};

module.exports = {
  generateGetTasksByEventReq,
  generateUpdateTaskReq,
  generateAssignTaskReq,
  generateAcceptTaskReq,
  generateDeclineTaskReq,
  generateDeleteTaskReq,
  generateCreateTaskReq,
};
