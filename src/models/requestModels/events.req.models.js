const generateGetEventReq = (query, session) => {
  if (!query || !session) {
    console.error("[generateGetEventReq]", "Missing query or sesion");
  }

  return {
    tenantUid: query.tenantUid || session?.user?.tenantUid,
    eventUid: query.eventUid,
    assignedToUid: query.assignedToUid,
    status: query.status,
  };
};

module.exports = { generateGetEventReq };
