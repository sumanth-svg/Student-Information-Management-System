import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRouter from './controllers/taskController.js';
import academicRouter from './controllers/academicController.js';
import assignmentRouter from './controllers/assignmentController.js';
import insightRouter from './controllers/insightController.js';
import { connectDB } from './config/db.js';
import { generateVector } from './services/vectorService.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Token"]
}));

app.use(express.json());

app.use("/task", taskRouter);
app.use("/academic", academicRouter);
app.use("/assignment", assignmentRouter);
app.use("/insight", insightRouter);

app.get("/", async (req, res) => {
    res.json({
        code: 200,
        message: "Task Service Started...."
    });
});

// This ensures Express always returns JSON for unknown routes
app.use((req, res) => {
    res.status(404).json({
        code: 404,
        message: "API route not found"
    });
});

const PORT = process.env.PORT || 8002;

// Start server only after MongoDB connection succeeds
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Task Service running on http://localhost:" + PORT);
    });

    // Warm up the embedding model in the background so the first task create /
    // update isn't blocked by the (~30s) one-time model load.
    generateVector("warmup")
        .then(() => console.log("Embedding model warmed up"))
        .catch((e) => console.log("Embedding warmup skipped:", e.message));
});

