const createTaskTable = `
    CREATE TABLE IF NOT EXISTS "emdb-schema".tasks (
  uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_uid UUID NOT NULL
    REFERENCES "emdb-schema".tenants(uid)
    ON DELETE CASCADE,
  event_uid UUID NOT NULL
    REFERENCES "emdb-schema".events(uid)
    ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NULL,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled', 'deleted')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  due_at TIMESTAMPTZ NULL,
  assigned_to_uid UUID NULL
    REFERENCES "emdb-schema".users(uid),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_uid UUID NULL REFERENCES "emdb-schema".users(uid),
  updated_by_uid UUID NULL REFERENCES "emdb-schema".users(uid)
);
`;

const changeConstraint = `
ALTER TABLE "emdb-schema".tasks
DROP CONSTRAINT tasks_status_check;


ALTER TABLE "emdb-schema".tasks
ADD CONSTRAINT tasks_status_check
CHECK (
  status = ANY (
    ARRAY[
      'not_started'::text,
      'assigned'::text,
      'in_progress'::text,
      'completed'::text,
      'cancelled'::text,
      'deleted'::text
    ]
  )
);

`;

// phase 2
const createTable = `CREATE TABLE IF NOT EXISTS "emdb-schema".tasks (
  uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  tenant_uid UUID NOT NULL,
  CONSTRAINT fk_tasks_tenant_uid
    FOREIGN KEY (tenant_uid)
    REFERENCES "emdb-schema".tenants(uid)
    ON DELETE CASCADE,

  event_uid UUID NOT NULL,
  CONSTRAINT fk_tasks_event_uid
    FOREIGN KEY (event_uid)
    REFERENCES "emdb-schema".events(uid)
    ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT NULL,

  status TEXT NOT NULL DEFAULT 'not_started',
  CONSTRAINT tasks_status_check
    CHECK (
      status IN (
        'not_started',
        'assigned',
        'in_progress',
        'completed',
        'cancelled',
        'deleted'
      )
    ),

  priority TEXT NOT NULL DEFAULT 'medium',
  CONSTRAINT tasks_priority_check
    CHECK (priority IN ('low', 'medium', 'high')),

  due_at TIMESTAMPTZ NULL,

  assigned_to_uid UUID NULL,
  CONSTRAINT fk_tasks_assigned_to_uid
    FOREIGN KEY (assigned_to_uid)
    REFERENCES "emdb-schema".users(uid),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_by_uid UUID NULL,
  CONSTRAINT fk_tasks_created_by_uid
    FOREIGN KEY (created_by_uid)
    REFERENCES "emdb-schema".users(uid),

  updated_by_uid UUID NULL,
  CONSTRAINT fk_tasks_updated_by_uid
    FOREIGN KEY (updated_by_uid)
    REFERENCES "emdb-schema".users(uid)
);`;
