CREATE TABLE students (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, digest TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, student TEXT NOT NULL REFERENCES students(id), expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE auth_limits (bucket TEXT PRIMARY KEY, resets INTEGER NOT NULL, hits INTEGER NOT NULL);
--> statement-breakpoint
ALTER TABLE papers ADD COLUMN oldest_event TEXT;
--> statement-breakpoint
ALTER TABLE papers ADD COLUMN penalty REAL NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE INDEX papers_available ON papers(exam,penalty,oldest_event);
