import AnalyticsData from "../models/analyticsData.js";
import * as coreClient from "./coreClient.js";
import * as performanceLogService from "./performanceLogService.js";

/**
 * Generate (or regenerate) analytics for one student.
 *
 * The numbers are NOT recomputed here - they are pulled from the Spring Boot
 * /report endpoint (single source of truth) and stored in the analytics_data
 * collection. This keeps PostgreSQL and MongoDB consistent.
 */
export async function generateAnalytics(studentid, token) {
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

        const student = report.student || {};

        const analytics = {
            studentid: sid,
            rollno: student.rollno,
            name: student.name,
            department: student.department,
            averagemarks: report.averagemarks || 0,
            attendancepercentage: report.attendancepercentage || 0,
            subjectperformance: report.subjectperformance || [],
            semesterperformance: report.semesterperformance || [],
            weaksubjects: report.weaksubjects || [],
            strongsubjects: report.strongsubjects || [],
            rank: report.rank || 0,
            totalranked: report.totalranked || 0
        };

        // Upsert: one analytics document per student.
        const saved = await AnalyticsData.findOneAndUpdate(
            { studentid: sid },
            analytics,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Automatic performance logging.
        await performanceLogService.addLog(sid, "ANALYTICS_GENERATED", {
            averagemarks: analytics.averagemarks,
            attendancepercentage: analytics.attendancepercentage,
            rank: analytics.rank
        });

        return {
            code: 200,
            message: "Analytics generated successfully",
            analytics: saved
        };
    } catch (e) {
        return { code: 500, message: e.message };
    }
}

// Retrieve stored analytics for a student.
export async function getAnalytics(studentid) {
    const sid = Number(studentid);
    if (isNaN(sid) || sid <= 0) {
        return { code: 400, message: "Invalid studentid" };
    }

    try {
        const analytics = await AnalyticsData.findOne({ studentid: sid });
        if (!analytics) {
            return { code: 404, message: "Analytics not found. Generate it first." };
        }
        return { code: 200, message: "Analytics fetched successfully", analytics: analytics };
    } catch (e) {
        return { code: 500, message: e.message };
    }
}
