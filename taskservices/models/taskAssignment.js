import mongoose from "mongoose";
const { Schema } = mongoose;

// studentId stores the owning user's numeric id (the JWT "crid"), matching the
// ownership convention used by the tasks collection (createdby). This keeps a
// single, consistent owner key across all task-service collections.
const TaskAssignmentSchema = new Schema({
  studentId: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  status: { type: String, enum: ["PENDING", "IN_PROGRESS", "COMPLETED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('TaskAssignment', TaskAssignmentSchema, "assignments");
