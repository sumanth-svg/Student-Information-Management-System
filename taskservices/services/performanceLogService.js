import PerformanceLogs from "../models/performanceLogs.js";

// Persist a performance log event into MongoDB (performance_logs collection).
// Called both internally (analytics / embedding rebuilds) and by the Spring
// Boot core service on marks / attendance updates.
export async function addLog(studentid, eventtype, details) {
    const sid = Number(studentid);
    if (isNaN(sid)) {
        return { code: 400, message: "Invalid studentid" };
    }
    if (!eventtype) {
        return { code: 400, message: "eventtype is required" };
    }

    try {
        await PerformanceLogs.create({
            studentid: sid,
            eventtype: eventtype,
            details: details || {}
        });
        return { code: 200, message: "Performance log recorded" };
    } catch (e) {
        return { code: 500, message: e.message };
    }
}

// Read the most recent performance logs for a student.
export async function getLogs(studentid) {
    const sid = Number(studentid);
    if (isNaN(sid)) {
        return { code: 400, message: "Invalid studentid", logs: [] };
    }

    try {
        const logs = await PerformanceLogs.find({ studentid: sid })
            .sort({ createdat: -1 })
            .limit(100);

        return {
            code: 200,
            message: "Performance logs fetched successfully",
            totalrecords: logs.length,
            logs: logs
        };
    } catch (e) {
        return { code: 500, message: e.message, logs: [] };
    }
}
