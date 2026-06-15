import mongoose from "mongoose";

// Stores the semantic vector representation of a student built from real
// academic data (student profile + marks + attendance + report analytics).
// The `vector` field is what the MongoDB Atlas Vector Search index is built on.
const studentEmbeddingSchema = new mongoose.Schema({
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

    // Human-readable academic summary the embedding was generated from.
    // Keeping it lets us rebuild / debug embeddings and return context in search.
    summary: {
        type: String,
        required: true
    },

    // 384-dimension vector from Xenova/all-MiniLM-L6-v2
    vector: {
        type: [Number],
        required: true
    }
}, {
    timestamps: {
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    }
});

// Explicitly use MongoDB collection name "student_embeddings"
const StudentEmbeddings = mongoose.model("StudentEmbeddings", studentEmbeddingSchema, "student_embeddings");

export default StudentEmbeddings;
