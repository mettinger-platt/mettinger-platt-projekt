CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  german TEXT NOT NULL,
  platt TEXT NOT NULL,
  note TEXT,
  submitter TEXT,
  period TEXT,
  image_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_german ON entries(german);
