import express from 'express';
import Insight from '../models/insight.js';
import { verifyToken, isAdmin, ownerFilter } from '../middleware/auth.js';

const router = express.Router();

// All insight routes require a valid JWT.
router.use(verifyToken);

// Admin-only guard for write operations. Students may only VIEW their insights.
function adminOnly(req, res, next) {
  if (!isAdmin(req.user)) {
    return res.json({ code: 403, message: "Only admin can modify insights" });
  }
  next();
}

// List insights. Admin sees all; a student sees only their own.
router.get('/getall', async (req, res) => {
  try {
    const insights = await Insight.find(ownerFilter(req.user, "studentId")).sort({ generatedAt: -1 });
    res.json({ code: 200, message: "Insights fetched successfully", insights });
  } catch (e) {
    res.json({ code: 500, message: e.message, insights: [] });
  }
});

// Get one insight (ownership enforced for students).
router.get('/get/:id', async (req, res) => {
  try {
    const insight = await Insight.findOne({ _id: req.params.id, ...ownerFilter(req.user, "studentId") });
    if (!insight) return res.json({ code: 404, message: "Insight not found" });
    res.json({ code: 200, insight });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// Create insight (admin only).
router.post('/create', adminOnly, async (req, res) => {
  try {
    const insight = await Insight.create(req.body);
    res.json({ code: 200, message: "New insight has been created", insight });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// Update insight (admin only).
router.put('/update/:id', adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;
    const updated = await Insight.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.json({ code: 404, message: "Insight not found" });
    res.json({ code: 200, message: "Insight updated successfully", insight: updated });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// Delete insight (admin only).
router.delete('/delete/:id', adminOnly, async (req, res) => {
  try {
    const deleted = await Insight.findByIdAndDelete(req.params.id);
    if (!deleted) return res.json({ code: 404, message: "Insight not found" });
    res.json({ code: 200, message: "Insight has been deleted" });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

export default router;
