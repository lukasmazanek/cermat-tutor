-- ADR-023 Phase 2: Supabase Schema
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  problems_count INTEGER DEFAULT 0
);

-- Attempts table
CREATE TABLE attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id UUID REFERENCES sessions(id),

  -- Question snapshot
  question_id TEXT NOT NULL,
  question_stem TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty INTEGER NOT NULL,

  -- Answer
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('numeric', 'type_recognition', 'lightning')),

  -- Analysis
  hints_used INTEGER DEFAULT 0,
  hints_shown JSONB DEFAULT '[]',
  time_spent_ms INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_topic ON attempts(topic);
CREATE INDEX idx_attempts_created_at ON attempts(created_at DESC);
CREATE INDEX idx_attempts_question_id ON attempts(question_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Row Level Security (allows anon key to read/write for any user_id)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (single-user app)
CREATE POLICY "Allow all for sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for attempts" ON attempts FOR ALL USING (true) WITH CHECK (true);

-- Error queue table (questions to review later)
CREATE TABLE error_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,

  -- Question snapshot
  question_id TEXT NOT NULL,
  question_stem TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty INTEGER NOT NULL,

  -- Context at time of error
  user_answer TEXT,  -- What they had entered (if anything)
  hints_shown JSONB DEFAULT '[]',
  time_spent_ms INTEGER DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'mastered')),
  reviewed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_error_queue_user_id ON error_queue(user_id);
CREATE INDEX idx_error_queue_status ON error_queue(status);
CREATE INDEX idx_error_queue_topic ON error_queue(topic);

-- RLS
ALTER TABLE error_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for error_queue" ON error_queue FOR ALL USING (true) WITH CHECK (true);
