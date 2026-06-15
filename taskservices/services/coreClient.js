import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Base URL of the Spring Boot core service (PostgreSQL source of truth).
const CORESERVICES_URL = process.env.CORESERVICES_URL || "http://localhost:8001";

// All core endpoints require the JWT in the "Token" header, exactly like the
// rest of the project. We forward the same token the caller presented.
function authHeader(token) {
    return { headers: { Token: token }, timeout: 60000 };
}

// Fetch a single student's academic report (averages, attendance %, subject
// performance, weak/strong subjects, ranking). This is the single source of
// truth that analytics + embeddings are derived from.
export async function getReport(studentid, token) {
    const url = `${CORESERVICES_URL}/report/${studentid}`;
    const { data } = await axios.get(url, authHeader(token));
    return data;
}

// Fetch one page of students.
export async function getStudents(page, size, token) {
    const url = `${CORESERVICES_URL}/student/getallstudents/${page}/${size}`;
    const { data } = await axios.get(url, authHeader(token));
    return data;
}

// Fetch raw marks for a student.
export async function getMarks(studentid, token) {
    const url = `${CORESERVICES_URL}/marks/getmarks/${studentid}`;
    const { data } = await axios.get(url, authHeader(token));
    return data;
}

// Fetch raw attendance for a student.
export async function getAttendance(studentid, token) {
    const url = `${CORESERVICES_URL}/attendance/getattendance/${studentid}`;
    const { data } = await axios.get(url, authHeader(token));
    return data;
}
