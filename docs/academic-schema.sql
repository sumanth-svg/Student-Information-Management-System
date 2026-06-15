-- ============================================================
-- Academic domain schema (PostgreSQL, database: mth)
-- These tables are auto-created by Hibernate (spring.jpa.hibernate.ddl-auto=update)
-- from the JPA entities. This file documents the resulting schema and provides
-- optional sample seed data.
-- ============================================================

-- Students (mth.models.Students)
CREATE TABLE IF NOT EXISTS students (
    id          BIGSERIAL PRIMARY KEY,
    rollno      VARCHAR(255) UNIQUE,
    name        VARCHAR(255),
    email       VARCHAR(255),
    department  VARCHAR(255),
    semester    INTEGER,
    status      INTEGER
);

-- Marks (mth.models.Marks)
CREATE TABLE IF NOT EXISTS marks (
    id          BIGSERIAL PRIMARY KEY,
    studentid   BIGINT,
    subject     VARCHAR(255),
    semester    INTEGER,
    score       DOUBLE PRECISION,
    maxscore    DOUBLE PRECISION
);

-- Attendance (mth.models.Attendance)
CREATE TABLE IF NOT EXISTS attendance (
    id              BIGSERIAL PRIMARY KEY,
    studentid       BIGINT,
    subject         VARCHAR(255),
    semester        INTEGER,
    totalclasses    INTEGER,
    attendedclasses INTEGER
);

-- ------------------------------------------------------------
-- Optional sample data
-- ------------------------------------------------------------
-- INSERT INTO students (rollno, name, email, department, semester, status)
-- VALUES ('CS001', 'Asha Rao', 'asha@example.com', 'Computer Science', 3, 1),
--        ('CS002', 'Vikram Iyer', 'vikram@example.com', 'Computer Science', 3, 1);

-- INSERT INTO marks (studentid, subject, semester, score, maxscore)
-- VALUES (1, 'Mathematics', 3, 35, 100),
--        (1, 'Science', 3, 82, 100),
--        (2, 'Mathematics', 3, 90, 100);

-- INSERT INTO attendance (studentid, subject, semester, totalclasses, attendedclasses)
-- VALUES (1, 'Mathematics', 3, 40, 22),
--        (1, 'Science', 3, 40, 38);
