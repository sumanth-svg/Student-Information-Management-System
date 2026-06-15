// Additive CRUD showcase seed for Student Deck.
//
// Creates stable demo accounts and MongoDB records without resetting the whole
// project database. Re-running this script only updates the seeded demo rows
// (matched by rollno / email / title) so it can be re-run safely.
//
// Run from taskservices:
//   node seed_crud_showcase.js

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

const demoStudents = [
    {
        fullname: "Aarav Demo",
        phone: "9811100001",
        email: "demo.student1@studentdeck.local",
        rollno: "DEMO2026001",
        department: "Computer Science",
        semester: 3,
        focus: "Database normalization",
    },
    {
        fullname: "Diya Demo",
        phone: "9811100002",
        email: "demo.student2@studentdeck.local",
        rollno: "DEMO2026002",
        department: "Information Technology",
        semester: 5,
        focus: "React integration",
    },
    {
        fullname: "Kabir Demo",
        phone: "9811100003",
        email: "demo.student3@studentdeck.local",
        rollno: "DEMO2026003",
        department: "Computer Science",
        semester: 4,
        focus: "API testing",
    },
    {
        fullname: "Ananya Demo",
        phone: "9811100004",
        email: "demo.student4@studentdeck.local",
        rollno: "DEMO2026004",
        department: "Data Science",
        semester: 6,
        focus: "Analytics review",
    },
];

const taskTemplates = [
    ["Schema Review", "Check table relationships, keys, and CRUD constraints.", 1, 0],
    ["API Smoke Test", "Verify create, read, update, and delete calls through the gateway.", 2, 0],
    ["UI Validation", "Confirm the student-facing table displays current assignment status.", 2, 1],
    ["Final Notes", "Prepare short notes for the admin CRUD walkthrough.", 3, 0],
];

const assignmentTemplates = [
    ["ER Diagram Submission", "Submit the latest ER diagram with entities, keys, and relationships.", "PENDING"],
    ["CRUD API Report", "Document one create, read, update, and delete example from the app.", "IN_PROGRESS"],
    ["Frontend Demo Recording", "Record the student view showing assigned work and insights.", "COMPLETED"],
    ["Admin Review Checklist", "Prepare data checks for the admin page demonstration.", "PENDING"],
];

const insightTypes = ["Performance", "Engagement", "Improvement", "Attendance"];

async function upsertAdmin() {
    await pgClient.query(
        `INSERT INTO users (fullname, phone, email, password, role, status)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (email) DO UPDATE
         SET fullname = EXCLUDED.fullname,
             phone = EXCLUDED.phone,
             password = EXCLUDED.password,
             role = EXCLUDED.role,
             status = EXCLUDED.status`,
        ["System Administrator", "9000000000", "admin@microtask.com", "admin123", 5, 1]
    );
}

async function upsertStudentUser(student) {
    const result = await pgClient.query(
        `INSERT INTO users (fullname, phone, email, password, role, status)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (email) DO UPDATE
         SET fullname = EXCLUDED.fullname,
             phone = EXCLUDED.phone,
             password = EXCLUDED.password,
             role = EXCLUDED.role,
             status = EXCLUDED.status
         RETURNING id`,
        [student.fullname, student.phone, student.email, "student123", 1, 1]
    );

    const userId = Number(result.rows[0].id);

    await pgClient.query(
        `INSERT INTO students (rollno, name, email, department, semester, status)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (rollno) DO UPDATE
         SET name = EXCLUDED.name,
             email = EXCLUDED.email,
             department = EXCLUDED.department,
             semester = EXCLUDED.semester,
             status = EXCLUDED.status`,
        [student.rollno, student.fullname, student.email, student.department, student.semester, 1]
    );

    return { ...student, userId };
}

function dueDate(studentIndex, assignmentIndex) {
    return new Date(`2026-07-${String(18 + studentIndex * 2 + assignmentIndex).padStart(2, "0")}T00:00:00Z`);
}

async function replaceMongoDemoRows(students) {
    // Re-runs of this script only touch rows whose title/content exactly match
    // what we are about to insert. Other demo data (e.g. from seed_demo.js or
    // seed_random_student_content.js) is left untouched.
    const titlesToReplace = [];
    const assignmentTitlesToReplace = [];
    const insightsToReplace = [];
    students.forEach((student) => {
        taskTemplates.forEach(([title], index) => {
            titlesToReplace.push(`${title} - ${student.fullname} (${index + 1})`);
        });
        assignmentTemplates.forEach(([title], index) => {
            assignmentTitlesToReplace.push(`${title} (${index + 1})`);
            insightsToReplace.push(
                `Insight for ${student.fullname}: ${title} is in progress; next step is ${student.focus}.`
            );
        });
    });

    if (titlesToReplace.length) {
        await Tasks.deleteMany({ title: { $in: titlesToReplace } });
    }
    if (assignmentTitlesToReplace.length) {
        await TaskAssignment.deleteMany({ title: { $in: assignmentTitlesToReplace } });
    }
    if (insightsToReplace.length) {
        await Insight.deleteMany({ content: { $in: insightsToReplace } });
    }

    const tasks = [];
    const assignments = [];
    const insights = [];

    students.forEach((student, sIndex) => {
        taskTemplates.forEach(([title, description, priority, status], index) => {
            tasks.push({
                title: `${title} - ${student.fullname} (${index + 1})`,
                description: `${description} Focus area: ${student.focus}.`,
                assignedto: student.userId,
                priority,
                deadline: `2026-07-${String(10 + sIndex * 3 + index).padStart(2, "0")}`,
                status,
                createdby: student.userId,
                vector: [],
            });
        });

        assignmentTemplates.forEach(([title, description, status], index) => {
            assignments.push({
                studentId: student.userId,
                title: `${title} (${index + 1})`,
                description: `${description} Assigned to ${student.fullname}.`,
                dueDate: dueDate(sIndex, index),
                status,
            });

            insights.push({
                studentId: student.userId,
                type: insightTypes[index],
                content: `Insight for ${student.fullname}: ${title} is in progress; next step is ${student.focus}.`,
                generatedAt: new Date(`2026-06-${String(15 + index).padStart(2, "0")}T00:00:00Z`),
            });
        });
    });

    await Tasks.insertMany(tasks);
    await TaskAssignment.insertMany(assignments);
    await Insight.insertMany(insights);

    return { tasks: tasks.length, assignments: assignments.length, insights: insights.length };
}

async function run() {
    try {
        if (!process.env.DBURL) throw new Error("DBURL is missing in taskservices/.env");

        await pgClient.connect();
        await upsertAdmin();
        const students = [];
        for (const student of demoStudents) {
            students.push(await upsertStudentUser(student));
        }

        await mongoose.connect(process.env.DBURL, { serverSelectionTimeoutMS: 30000, family: 4 });
        const counts = await replaceMongoDemoRows(students);

        console.log("CRUD showcase data is ready.");
        console.log(`Students: ${students.length}`);
        console.log(`Tasks: ${counts.tasks}`);
        console.log(`Assignments: ${counts.assignments}`);
        console.log(`Insights: ${counts.insights}`);
        console.log("");
        console.log("Admin login: admin@microtask.com / admin123");
        console.log("Student login: demo.student1@studentdeck.local / student123");
        console.log("Other students: demo.student2@studentdeck.local .. demo.student4@studentdeck.local / student123");
    } catch (error) {
        console.error("CRUD showcase seed failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pgClient.end().catch(() => {});
        await mongoose.disconnect().catch(() => {});
    }
}

run();
