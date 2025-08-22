-- Users table (já existe, mas garantindo estrutura completa)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password TEXT,
  pass_hash TEXT,
  google_sub TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  last_login INTEGER
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User calculations/runs
CREATE TABLE IF NOT EXISTS user_calculations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  calculation_type TEXT NOT NULL, -- 'profit', 'equipment', 'mapdrops'
  calculation_data TEXT NOT NULL, -- JSON with all calculation data
  result_data TEXT, -- JSON with results
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  theme TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
  language TEXT DEFAULT 'pt', -- 'pt', 'en'
  currency TEXT DEFAULT 'USD',
  preferences_data TEXT, -- JSON with all preferences
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Equipment builds
CREATE TABLE IF NOT EXISTS user_equipment_builds (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  build_name TEXT NOT NULL,
  equipment_data TEXT NOT NULL, -- JSON with equipment configuration
  build_type TEXT, -- 'damage', 'tank', 'support', etc.
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Map drops history
CREATE TABLE IF NOT EXISTS user_map_drops (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  map_name TEXT NOT NULL,
  drop_data TEXT NOT NULL, -- JSON with drop information
  tokens_earned INTEGER,
  time_spent INTEGER, -- in minutes
  efficiency_rating REAL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User activity log
CREATE TABLE IF NOT EXISTS user_activity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'login', 'calculation', 'equipment_save', etc.
  activity_data TEXT, -- JSON with activity details
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Migrations tracking
CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  executed_at INTEGER NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON user_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_type ON user_calculations(calculation_type);
CREATE INDEX IF NOT EXISTS idx_calculations_created ON user_calculations(created_at);

CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON user_equipment_builds(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_favorite ON user_equipment_builds(is_favorite);

CREATE INDEX IF NOT EXISTS idx_mapdrops_user_id ON user_map_drops(user_id);
CREATE INDEX IF NOT EXISTS idx_mapdrops_map ON user_map_drops(map_name);
CREATE INDEX IF NOT EXISTS idx_mapdrops_created ON user_map_drops(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON user_activity(created_at);