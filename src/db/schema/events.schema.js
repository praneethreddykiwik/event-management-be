const createEventsTable = `
CREATE TABLE IF NOT EXISTS "emdb-schema".events (
  uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  tenant_uid UUID NOT NULL,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL,

  scheduled_at TIMESTAMPTZ NOT NULL,
  venue TEXT,
  expected_attendees INTEGER NOT NULL DEFAULT 0 CHECK (expected_attendees >= 0),

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',
      'assigned',
      'accepted',
      'declined',
      'in_progress',
      'completed',
      'cancelled'
    )),

  assigned_event_manager_uid UUID NULL,
  assigned_at TIMESTAMPTZ NULL,
  accepted_at TIMESTAMPTZ NULL,
  declined_at TIMESTAMPTZ NULL,
  decline_reason TEXT NULL,

  comments TEXT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_by_uid UUID NULL,
  updated_by_uid UUID NULL,

  -- Foreign Keys
  CONSTRAINT fk_events_tenant_uid
    FOREIGN KEY (tenant_uid)
    REFERENCES "emdb-schema".tenants(uid)
    ON DELETE CASCADE,

  CONSTRAINT fk_events_assigned_event_manager_uid
    FOREIGN KEY (assigned_event_manager_uid)
    REFERENCES "emdb-schema".users(uid),

  CONSTRAINT fk_events_created_by_uid
    FOREIGN KEY (created_by_uid)
    REFERENCES "emdb-schema".users(uid),

  CONSTRAINT fk_events_updated_by_uid
    FOREIGN KEY (updated_by_uid)
    REFERENCES "emdb-schema".users(uid)
);
`;

const updateConstraint = `
BEGIN;
ALTER TABLE events
DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE "emdb-schema".events
ADD CONSTRAINT events_status_check
CHECK (
  status IN (
    'pending',
    'assigned',
    'accepted',
    'ready',
    'in_progress',
    'completed',
    'declined',
    'cancelled',
    'deleted'
  )
);
COMMIT;
`;

const addColumns = `
  ALTER TABLE events
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS deleted_by_uid UUID NULL REFERENCES "emdb-schema".users(uid),
  ADD COLUMN IF NOT EXISTS delete_reason TEXT NULL;
`;
