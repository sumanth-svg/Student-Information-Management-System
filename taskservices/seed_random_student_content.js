// Add random tasks, assignments, and insights for every student.
//
// Run from taskservices:
//   node seed_random_student_content.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import pg from "pg";

import Tasks from "./models/tasks.js";
import TaskAssignment from "./models/taskAssignment.js";
import Insight from "./models/insight.js";

dotenv.config();

const { Client } = pg;

const pgClient = new Client({
    user: "postgres",
    password: "mistake",
    host: "localhost",
    port: 5432,
    database: "mth",
});

const taskTemplates = [
    ["Review lecture notes", "Revise the latest module notes and mark confusing topics.", 2, 0],
    ["Practice SQL joins", "Solve join queries using student, marks, and attendance style data.", 1, 0],
    ["Update study tracker", "Record completed subjects and next revision date.", 3, 1],
    ["Prepare viva points", "Write short answers for likely DBMS viva questions.", 2, 0],
    ["Check attendance summary", "Review attendance percentage and plan catch-up classes.", 2, 0],
    ["Revise normalization", "Practice 1NF, 2NF, 3NF, and BCNF examples.", 1, 0],
];

const assignmentTemplates = [
    ["ER Diagram Practice", "Create an ER diagram for a course registration system.", "PENDING"],
    ["SQL Query Sheet", "Submit ten SQL queries covering joins, grouping, and subqueries.", "IN_PROGRESS"],
    ["Normalization Worksheet", "Normalize sample tables and explain each step.", "PENDING"],
    ["Mini Project Update", "Upload a short progress note for the DBMS mini project.", "COMPLETED"],
    ["Attendance Reflection", "Write a short plan for improving class consistency.", "PENDING"],
    ["Indexing Notes", "Prepare notes on indexing and query performance.", "IN_PROGRESS"],
];

const insightTemplates = [
    ["Performance", "is showing steady progress and should continue weekly revision."],
    ["Attendance", "needs to keep attendance consistent over the next two weeks."],
    ["Improvement", "would benefit from extra practice on SQL and schema design."],
    ["Engagement", "has been active in coursework and can take on a slightly harder task."],
    ["Planning", "should split project work into smaller checkpoints before the deadline."],
    ["Revision", "should revisit previous mistakes before starting the next assignment."],
];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickMany(items, count) {
    return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

function futureDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
}

function deadlineString(daysFromNow) {
    return futureDate(daysFromNow).toISOString().slice(0, 10);
}

async function getStudentUsers() {
    const result = await pgClient.query(`
        select
            u.id as user_id,
            u.fullname as name,
            u.email,
            s.id as student_id,
            s.rollno
        from users u
        left join students s on lower(s.email) = lower(u.email)
        where u.role = 1 and u.status = 1
        order by u.id
    `);

    return result.rows.map((row) => ({
        studentId: row.student_id ? Number(row.student_id) : null,
        userId: Number(row.user_id),
        rollno: row.rollno || `USER-${row.user_id}`,
        name: row.name,
        email: row.email,
    }));
}

async function addRandomContent(students, { onlyEmpty = false } = {}) {
    const tasks = [];
    const assignments = [];
    const insights = [];

    for (const student of students) {
        if (onlyEmpty) {
            const [taskCount, assignmentCount, insightCount] = await Promise.all([
                Tasks.countDocuments({ createdby: student.userId }),
                TaskAssignment.countDocuments({ studentId: student.userId }),
                Insight.countDocuments({ studentId: student.userId }),
            ]);

            if (taskCount > 0 && assignmentCount > 0 && insightCount > 0) {
                continue;
            }
        }

        pickMany(taskTemplates, randomInt(1, 3)).forEach(([title, description, priority, status], index) => {
            tasks.push({
                title: `${title} - ${student.name}`,
                description: `${description} Student: ${student.rollno}.`,
                assignedto: student.userId,
                priority,
                deadline: deadlineString(randomInt(3, 24) + index),
                status,
                createdby: student.userId,
                vector: [],
            });
        });

        pickMany(assignmentTemplates, randomInt(1, 3)).forEach(([title, description, status], index) => {
            assignments.push({
                studentId: student.userId,
                title: `${title}`,
                description: `${description} Assigned to ${student.name} (${student.rollno}).`,
                dueDate: futureDate(randomInt(5, 30) + index),
                status,
            });
        });

        pickMany(insightTemplates, randomInt(1, 3)).forEach(([type, content], index) => {
            insights.push({
                studentId: student.userId,
                type,
                content: `${student.name} ${content}`,
                generatedAt: futureDate(index),
            });
        });
    }

    await Tasks.insertMany(tasks);
    await TaskAssignment.insertMany(assignments);
    await Insight.insertMany(insights);

    return { tasks: tasks.length, assignments: assignments.length, insights: insights.length };
}

async function run() {
    try {
        if (!process.env.DBURL) throw new Error("DBURL is missing in taskservices/.env");

        await pgClient.connect();
        const students = await getStudentUsers();

        if (students.length === 0) {
            throw new Error("No active student user accounts found");
        }

        await mongoose.connect(process.env.DBURL, { serverSelectionTimeoutMS: 30000, family: 4 });
        const onlyEmpty = process.argv.includes("--only-empty");
        const counts = await addRandomContent(students, { onlyEmpty });

        console.log("Random student content added.");
        console.log(`Students: ${students.length}`);
        console.log(`Tasks inserted: ${counts.tasks}`);
        console.log(`Assignments inserted: ${counts.assignments}`);
        console.log(`Insights inserted: ${counts.insights}`);
    } catch (error) {
        console.error("Random seed failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pgClient.end().catch(() => {});
        await mongoose.disconnect().catch(() => {});
    }
}

run();
