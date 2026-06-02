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

module.exports = {
  generateGetEventReq,
  generateDeleteEventReq,
  generateAssignEventReq,
};
