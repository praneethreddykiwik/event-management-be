const createUsersTable = `
	create table users (
		uid uuid primary key default gen_random_uuid(),
		tenant_uid uuid not null,
		constraint fk_users_tenant_uid
			foreign key (tenant_uid)
			references tenants(uid)
			on delete cascade,
		username text not null,
		email text not null,
		password_hash text not null,
		role text not null,
		constraint users_role_check
			check (role in ('admin', 'event_manager', 'vendor', 'customer')),
		status text not null default 'active',
		constraint users_status_check
			check (status in ('ACTIVE', 'DISABLED'))
	);

	-- (1) multiple users per tenant → allowed (no unique on tenant_uid)
	create index idx_users_tenant_uid
	on users (tenant_uid);
	
	-- (2) same email allowed across tenants, but NOT inside same tenant
	create unique index users_tenant_email_unique
	on users (tenant_uid, lower(email));
	
	-- (3) same username allowed across tenants, but NOT inside same tenant
	create unique index users_tenant_username_unique
	on users (tenant_uid, username);
`;

const modification = `
	ALTER TABLE users
	ALTER COLUMN status SET DEFAULT 'ACTIVE';
`;

const addFirstNameMobileColumns = `
	-- Step 1: Add columns (nullable + temp default for mobile)

	ALTER TABLE users
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN mobile BIGINT;


-- Adjust values as needed.

UPDATE users
SET
  first_name = 'Unknown',
  mobile = 0
WHERE first_name IS NULL
   OR mobile IS NULL;

   -- Step 3: Enforce NOT NULL constraints
   ALTER TABLE users
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN mobile SET NOT NULL;

`;
