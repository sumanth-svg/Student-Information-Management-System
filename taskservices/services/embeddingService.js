import StudentEmbeddings from "../models/studentEmbeddings.js";
import * as coreClient from "./coreClient.js";
import * as vectorService from "./vectorService.js";
import * as performanceLogService from "./performanceLogService.js";

/**
 * Build a human-readable academic summary for a student from REAL data only
 * (student profile + report analytics). This text is what the embedding vector
 * is generated from, so the semantic search reflects true academic standing.
 */
function buildSummary(report) {
    const s = report.student || {};
    const parts = [];

    parts.push(`Student ${s.name || ""} (roll number ${s.rollno || ""}) from the ${s.department || ""} department, semester ${s.semester || ""}.`);
    parts.push(`Average marks ${report.averagemarks}. Attendance ${report.attendancepercentage} percent.`);

    if (report.strongsubjects && report.strongsubjects.length > 0) {
        parts.push(`Performing well and strong in ${report.strongsubjects.join(", ")}.`);
    }
    if (report.weaksubjects && report.weaksubjects.length > 0) {
        parts.push(`Weak and needs improvement in ${report.weaksubjects.join(", ")}.`);
    }

    if (report.subjectperformance && report.subjectperformance.length > 0) {
        const sp = report.subjectperformance
            .map((p) => `${p.subject} average ${p.average}`)
            .join(", ");
        parts.push(`Subject performance: ${sp}.`);
    }

    // Qualitative attendance flag so queries like "poor attendance" match well.
    if (report.attendancepercentage < 75) {
        parts.push("This student has poor and low attendance.");
    } else {
        parts.push("This student has good and regular attendance.");
    }

    if (report.rank && report.totalranked) {
        parts.push(`Ranked ${report.rank} out of ${report.totalranked} students.`);
    }

    return parts.join(" ");
}

/**
 * Generate and store the embedding for a single student.
 */
export async function generateEmbedding(studentid, token) {
    const sid = Number(studentid);
    if (isNaN(sid) || sid <= 0) {
        return { code: 400, message: "Invalid studentid" };
    }

    try {
        const report = await coreClient.getReport(sid, token);
        if (!report || report.code !== 200) {
            return {
                code: report && report.code ? report.code : 500,
                message: report && report.message ? report.message : "Unable to fetch report from core service"
            };
        }

        const summary = buildSummary(report);
        const vector = await vectorService.generateVector(summary);
        const s = report.student || {};

        const saved = await StudentEmbeddings.findOneAndUpdate(
            { studentid: sid },
            {
                studentid: sid,
                rollno: s.rollno,
                name: s.name,
                department: s.department,
                summary: summary,
                vector: vector
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await performanceLogService.addLog(sid, "EMBEDDING_REBUILT", { summary: summary });

        return {
            code: 200,
            message: "Embedding generated successfully",
            embedding: { studentid: saved.studentid, summary: saved.summary }
        };
    } catch (e) {
        return { code: 500, message: e.message };
    }
}

/**
 * Rebuild embeddings for ALL students by paging through the core service.
 * Used by the automation / rebuild endpoint.
 */
export async function rebuildAllEmbeddings(token) {
    try {
        const size = 50;
        let page = 1;
        let processed = 0;
        let failed = 0;
        let totalpages = 1;

        do {
            const res = await coreClient.getStudents(page, size, token);
            if (!res || res.code !== 200) {
                return {
                    code: res && res.code ? res.code : 500,
                    message: res && res.message ? res.message : "Unable to fetch students from core service"
                };
            }

            totalpages = res.totalpages || 1;
            const students = res.students || [];

            for (const student of students) {
                const result = await generateEmbedding(student.id, token);
                if (result.code === 200) {
                    processed++;
                } else {
                    failed++;
                }
            }

            page++;
        } while (page <= totalpages);

        return {
            code: 200,
            message: "Embedding rebuild completed",
            processed: processed,
            failed: failed
        };
    } catch (e) {
        return { code: 500, message: e.message };
    }
}
