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
