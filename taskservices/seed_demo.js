// Deterministic demo seed for Student Deck.
//
// Resets PostgreSQL (users + students) and MongoDB (tasks, assignments,
// insights) to a known state so a reviewer can immediately demo CRUD as both
// ADMIN and STUDENT.
//
// Ownership convention (consistent across all Mongo collections):
//   tasks.createdby   = owning user's numeric id (PostgreSQL users.id == JWT crid)
//   assignments.studentId = same owning user id
//   insights.studentId    = same owning user id
//
// Run:  node seed_demo.js   (from the taskservices directory)

import dotenv from "dotenv";
import mongoose from "mongoose";
import pg from "pg";

import Tasks from "./models/tasks.js";
import TaskAssignment from "./models/taskAssignment.js";
import Insight from "./models/insight.js";

dotenv.config();

const { Client } = pg;

// ---- Postgres connection (matches application.properties) ----
const pgClient = new Client({
    user: "postgres",
    password: "postgresumanth8215",
    host: "localhost",
    port: 5432,
    database: "mth",
});

// ---- Demo data pools ----
const FIRST = ["Aarav", "Vivaan", "Aditya", "Diya", "Ananya", "Ishaan", "Saanvi", "Kabir",
    "Anaya", "Reyansh", "Myra", "Arjun", "Aadhya", "Vihaan", "Pari", "Sai",
    "Riya", "Krishna", "Aarohi", "Shaurya", "Anika", "Atharv", "Navya", "Dhruv",
    "Kiara", "Rohan", "Ira", "Ayaan", "Siya", "Karan"];
const LAST = ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Reddy", "Rao",
    "Nair", "Iyer", "Joshi", "Mehta", "Shah", "Bose", "Das", "Mukherjee",
    "Kapoor", "Malhotra", "Agarwal", "Bansal", "Chauhan", "Yadav", "Pillai",
    "Jain", "Mishra", "Pandey", "Dixit", "Tiwari", "Saxena", "Bhat"];
const DEPTS = ["Computer Science", "Electrical Engineering", "Mechanical Engineering",
    "Civil Engineering", "Information Technology"];
const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Data Structures", "Algorithms",
    "Databases", "Operating Systems", "Networks"];
const INSIGHT_TYPES = ["Performance", "Attendance", "Engagement", "Improvement"];

function pick(arr, i) { return arr[i % arr.length]; }
function rangeCount(min, max, i) { return min + (i % (max - min + 1)); }

async function seedPostgres() {
    await pgClient.connect();

    // Clean slate (CASCADE handles dependent rows; RESTART IDENTITY resets ids).
    await pgClient.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
    await pgClient.query("TRUNCATE TABLE students RESTART IDENTITY CASCADE");

    // Admin first -> users.id = 1
    await pgClient.query(
        `INSERT INTO users (fullname, phone, email, password, role, status)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        ["System Administrator", "9000000000", "admin@microtask.com", "admin123", 5, 1]
    );

    const students = []; // { uid, name, email, rollno }
    for (let i = 0; i < 30; i++) {
        const name = `${pick(FIRST, i)} ${pick(LAST, i)}`;
        const email = `student${i + 1}@demo.com`;
        const rollno = `STU2026${String(i + 1).padStart(3, "0")}`;
        const dept = pick(DEPTS, i);
        const semester = (i % 8) + 1;

        // Student user (role 1) -> users.id = i + 2 (admin took id 1)
        const u = await pgClient.query(
            `INSERT INTO users (fullname, phone, email, password, role, status)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
            [name, `98765${String(10000 + i)}`, email, "student123", 1, 1]
        );
        const uid = u.rows[0].id;

        // Student academic record (admin CRUD-on-Students domain)
        await pgClient.query(
            `INSERT INTO students (rollno, name, email, department, semester, status)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [rollno, name, email, dept, semester, 1]
        );

        students.push({ uid, name, email, rollno });
    }

    return students;
}

async function seedMongo(students) {
    await mongoose.connect(process.env.DBURL, { serverSelectionTimeoutMS: 30000, family: 4 });

    await Tasks.deleteMany({});
    await TaskAssignment.deleteMany({});
    await Insight.deleteMany({});

    let taskCount = 0, asgCount = 0, insCount = 0;

    for (let i = 0; i < students.length; i++) {
        const { uid, name } = students[i];

        // 1-3 tasks
        const nTasks = rangeCount(1, 3, i);
        for (let t = 0; t < nTasks; t++) {
            await Tasks.create({
                title: `${pick(SUBJECTS, i + t)} task ${t + 1}`,
                description: `Complete ${pick(SUBJECTS, i + t)} work for ${name}.`,
                assignedto: uid,
                priority: (t % 3) + 1,
                deadline: `2026-07-${String((i % 27) + 1).padStart(2, "0")}`,
                status: t % 2,            // 0 = open, 1 = done
                createdby: uid,
                vector: []                 // embeddings are optional for the CRUD demo
            });
            taskCount++;
        }

        // 1-4 assignments
        const nAsg = rangeCount(1, 4, i);
        const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];
        for (let a = 0; a < nAsg; a++) {
            await TaskAssignment.create({
                studentId: uid,
                title: `${pick(SUBJECTS, i + a + 2)} assignment ${a + 1}`,
                description: `Assignment ${a + 1} on ${pick(SUBJECTS, i + a + 2)} for ${name}.`,
                dueDate: new Date(`2026-08-${String((a % 27) + 1).padStart(2, "0")}T00:00:00Z`),
                status: pick(STATUSES, i + a)
            });
            asgCount++;
        }

        // 1-2 insights
        const nIns = rangeCount(1, 2, i);
        for (let n = 0; n < nIns; n++) {
            await Insight.create({
                studentId: uid,
                type: pick(INSIGHT_TYPES, i + n),
                content: `${pick(INSIGHT_TYPES, i + n)} insight for ${name}: keep an eye on ${pick(SUBJECTS, i + n)}.`,
                generatedAt: new Date(`2026-06-${String((n % 27) + 1).padStart(2, "0")}T00:00:00Z`)
            });
            insCount++;
        }
    }

    return { taskCount, asgCount, insCount };
}

async function run() {
    try {
        console.log("Seeding PostgreSQL (users + students)...");
        const students = await seedPostgres();
        console.log(`  -> 1 admin + ${students.length} student users + ${students.length} student records`);

        console.log("Seeding MongoDB (tasks + assignments + insights)...");
        const counts = await seedMongo(students);
        console.log(`  -> ${counts.taskCount} tasks, ${counts.asgCount} assignments, ${counts.insCount} insights`);

        console.log("\n================ DEMO CREDENTIALS ================");
        console.log("ADMIN   : admin@microtask.com / admin123  (role 5)");
        console.log("STUDENTS: student1@demo.com .. student30@demo.com / student123  (role 1)");
        console.log("Sample  : student1@demo.com, student2@demo.com, student3@demo.com");
        console.log("=================================================");
        console.log("\nSeed complete.");
    } catch (e) {
        console.error("SEED FAILED:", e);
        process.exitCode = 1;
    } finally {
        await pgClient.end().catch(() => {});
        await mongoose.disconnect().catch(() => {});
    }
}

run();
