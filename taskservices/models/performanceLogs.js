import mongoose from "mongoose";

// Tracks academic events (marks updates, attendance updates, analytics
// generation, embedding rebuilds) using the real PostgreSQL student id.
const performanceLogSchema = new mongoose.Schema({
    studentid: {
        type: Number,
        required: true
    },

    // e.g. "MARKS_UPDATE", "ATTENDANCE_UPDATE", "ANALYTICS_GENERATED", "EMBEDDING_REBUILT"
    eventtype: {
        type: String,
        required: true
    },

    details: {
        type: Object,
        default: {}
    }
}, {
    timestamps: {
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    }
});

// Explicitly use MongoDB collection name "performance_logs"
const PerformanceLogs = mongoose.model("PerformanceLogs", performanceLogSchema, "performance_logs");

export default PerformanceLogs;
