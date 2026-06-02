const generateCreateTenantReq = (body) => {
  if (!body) {
    console.error("[generateCreateTenantReq]", "Missing body");
  }

  return {
    tenantId: body.tenantId,
    name: body.name,
    updatedBy: body.updatedBy,
  };
};

module.exports = {
  generateCreateTenantReq,
};
