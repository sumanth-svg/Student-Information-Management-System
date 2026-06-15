import mongoose from "mongoose";

// Stores computed analytics for a student. The numbers mirror the Spring Boot
// /report/{studentid} output (single source of truth) so PostgreSQL and MongoDB
// never disagree. One document per student (upserted on regeneration).
const analyticsDataSchema = new mongoose.Schema({
    studentid: {
        type: Number,
        required: true,
        unique: true
    },

    rollno: {
        type: String
    },

    name: {
        type: String
    },

    department: {
        type: String
    },

    averagemarks: {
        type: Number,
        default: 0
    },

    attendancepercentage: {
        type: Number,
        default: 0
    },

    // [{ subject, average }]
    subjectperformance: {
        type: [Object],
        default: []
    },

    // [{ semester, average }]
    semesterperformance: {
        type: [Object],
        default: []
    },

    weaksubjects: {
        type: [String],
        default: []
    },

    strongsubjects: {
        type: [String],
        default: []
    },

    rank: {
        type: Number,
        default: 0
    },

    totalranked: {
        type: Number,
        default: 0
    }
}, {
    timestamps: {
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    }
});

// Explicitly use MongoDB collection name "analytics_data"
const AnalyticsData = mongoose.model("AnalyticsData", analyticsDataSchema, "analytics_data");

export default AnalyticsData;
