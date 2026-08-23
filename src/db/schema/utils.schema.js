const indexing = `
    create index idx_user_tenant_id on tenants(id);
    explain analyze select * from tenants where id = '550e8400-e29b-41d4-a716-446655440000';
`;

const deleteTable = `DROP TABLE IF EXISTS tenants CASCADE;`;

const clearTable = `TRUNCATE TABLE tenants;`;

const show_search_path = `show search_path;`;

const checkCurrentDB = `
  select
    current_database() as db,
    current_user as usr,
    current_schema() as schema,
    current_setting('search_path') as search_path;
`;
