const { getDb } = require("../db/db");

const fetchAllTenantsService = async (req) => {
  const db = getDb();
  const response = await db.any(`
  SELECT uid, tenant_id, name, status, created_at, updated_at
  FROM tenants
  ORDER BY created_at DESC
`);

  return response;
};

const getTenantByIdService = async (tenantId) => {
  const db = getDb();
  const response = await db.oneOrNone(
    `
      SELECT uid, tenant_id, name, status, created_at, updated_at
      FROM tenants
      WHERE tenant_id = $(tenant_id)
      `,
    { tenant_id: tenantId },
  );

  return response;
};

const createTenantService = async (req) => {
  const { tenantId, name, updatedBy } = req.body;
  // const name = req.body.name;

  const db = getDb();
  const response = await db.one(
    `
      INSERT INTO tenants (tenant_id, name, updated_by)
      VALUES ($(tenantId), $(name), $(updatedBy))
      RETURNING uid, tenant_id, name, status, created_at, updated_at, updated_by 
      `,
    { tenantId, name, updatedBy },
  );

  return response;
};
const createTenantServices = async (req) => {
  const { tenantId, name, updatedBy } = req.body;

  const db = getDb();

  const response = await db.one(
    `
      INSERT INTO "emdb-schema".tenants 
        (tenant_id, name, updated_by)
      VALUES 
        ($(tenantId), $(name), $(updatedBy))
      RETURNING 
        uid, 
        tenant_id, 
        name, 
        status, 
        created_at, 
        updated_at, 
        updated_by
    `,
    { tenantId, name, updatedBy },
  );

  return response;
};

module.exports = {
  fetchAllTenantsService,
  createTenantService,
  getTenantByIdService,
  createTenantServices,
};
