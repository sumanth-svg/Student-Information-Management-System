import mongoose from "mongoose";
const { Schema } = mongoose;

// studentId stores the owning user's numeric id (the JWT "crid"), consistent
// with tasks.createdby and assignments.studentId.
const InsightSchema = new Schema({
  studentId: { type: Number, required: true },
  type: { type: String, required: true }, // e.g., 'Performance', 'Attendance'
  content: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Insight', InsightSchema, "insights");
