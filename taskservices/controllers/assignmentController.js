import express from 'express';
import TaskAssignment from '../models/taskAssignment.js';
import { verifyToken, isAdmin, ownerFilter } from '../middleware/auth.js';

const router = express.Router();

// All assignment routes require a valid JWT.
router.use(verifyToken);

// List assignments. Admin sees all; a student sees only their own.
router.get('/getall', async (req, res) => {
  try {
    const filter = ownerFilter(req.user, "studentId");
    const assignments = await TaskAssignment.find(filter).sort({ createdAt: -1 });
    res.json({ code: 200, message: "Assignments fetched successfully", assignments });
  } catch (e) {
    res.json({ code: 500, message: e.message, assignments: [] });
  }
});

// Get one assignment (ownership enforced for students).
router.get('/get/:id', async (req, res) => {
  try {
    const assignment = await TaskAssignment.findOne({ _id: req.params.id, ...ownerFilter(req.user, "studentId") });
    if (!assignment) return res.json({ code: 404, message: "Assignment not found" });
    res.json({ code: 200, assignment });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// Create assignment. Students always own what they create; an admin may target
// another user by sending studentId, otherwise it defaults to their own id.
router.post('/create', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!isAdmin(req.user) || data.studentId == null) {
      data.studentId = req.user.crid;
    }
    const assignment = await TaskAssignment.create(data);
    res.json({ code: 200, message: "New assignment has been created", assignment });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// Update assignment (ownership enforced for students).
router.put('/update/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.studentId; // owner cannot be reassigned via update
    delete data._id;
    const updated = await TaskAssignment.findOneAndUpdate(
      { _id: req.params.id, ...ownerFilter(req.user, "studentId") },
      data,
      { new: true }
    );
    if (!updated) return res.json({ code: 404, message: "Assignment not found or not allowed to update" });
    res.json({ code: 200, message: "Assignment updated successfully", assignment: updated });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// Delete assignment (ownership enforced for students).
router.delete('/delete/:id', async (req, res) => {
  try {
    const deleted = await TaskAssignment.findOneAndDelete({ _id: req.params.id, ...ownerFilter(req.user, "studentId") });
    if (!deleted) return res.json({ code: 404, message: "Assignment not found or not allowed to delete" });
    res.json({ code: 200, message: "Assignment has been deleted" });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

export default router;
