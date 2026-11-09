-- Run this once against the existing LGU student assistance database before starting the updated server.
ALTER TABLE AssistanceRecords
  ADD COLUMN release_location VARCHAR(255) NULL,
  ADD COLUMN release_instructions TEXT NULL;

-- StudentSubmissions is created automatically by Sequelize sync() when the server starts.
-- It stores uploaded PDF/JPG/PNG documents as base64 data (maximum 5 MB per file).
