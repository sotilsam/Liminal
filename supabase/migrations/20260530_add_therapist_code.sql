-- Add therapist_code to therapists table
ALTER TABLE therapists ADD COLUMN IF NOT EXISTS therapist_code TEXT UNIQUE;

-- Add therapist_id FK to patients so we can look up linked patients efficiently
ALTER TABLE patients ADD COLUMN IF NOT EXISTS therapist_id UUID REFERENCES therapists(id) ON DELETE SET NULL;
