const generateLoadUserReq = (body) => {
  if (!body) {
    console.error("[generateLoadUserReq]", "Missing body");
  }

  return {
    tenantId: body.tenantId,
    username: body.username,
  };
};

module.exports = {
  generateLoadUserReq,
};