CREATE TABLE papers (id TEXT PRIMARY KEY, exam TEXT NOT NULL, fingerprint TEXT NOT NULL UNIQUE, content TEXT NOT NULL, created INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE attempts (id TEXT PRIMARY KEY, student TEXT NOT NULL, exam TEXT NOT NULL, paper TEXT NOT NULL REFERENCES papers(id), started INTEGER NOT NULL, deadline INTEGER NOT NULL, ended INTEGER, score INTEGER, answers TEXT NOT NULL DEFAULT '{}', flags TEXT NOT NULL DEFAULT '[]', position INTEGER NOT NULL DEFAULT 0, revision INTEGER NOT NULL DEFAULT 0, UNIQUE(student,paper));
--> statement-breakpoint
CREATE UNIQUE INDEX active_attempt ON attempts(student,exam) WHERE ended IS NULL;
