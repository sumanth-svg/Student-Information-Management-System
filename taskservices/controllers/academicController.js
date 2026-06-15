import express from "express";
import * as analyticsService from "../services/analyticsService.js";
import * as embeddingService from "../services/embeddingService.js";
import * as searchService from "../services/searchService.js";
import * as performanceLogService from "../services/performanceLogService.js";

const router = express.Router();

// ---- Performance logs ----

// Called by the Spring Boot core service on marks / attendance updates.
router.post("/performancelog", async (req, res) => {
    const { studentid, eventtype, details } = req.body || {};
    const response = await performanceLogService.addLog(studentid, eventtype, details);
    res.json(response);
});

router.get("/performancelogs/:STUDENTID", async (req, res) => {
    const response = await performanceLogService.getLogs(req.params.STUDENTID);
    res.json(response);
});

// ---- Analytics ----

router.post("/generateanalytics/:STUDENTID", async (req, res) => {
    const response = await analyticsService.generateAnalytics(
        req.params.STUDENTID,
        req.headers["token"]
    );
    res.json(response);
});

router.get("/analytics/:STUDENTID", async (req, res) => {
    const response = await analyticsService.getAnalytics(req.params.STUDENTID);
    res.json(response);
});

// ---- Embeddings ----

router.post("/rebuildembeddings", async (req, res) => {
    const response = await embeddingService.rebuildAllEmbeddings(req.headers["token"]);
    res.json(response);
});

router.post("/generateembedding/:STUDENTID", async (req, res) => {
    const response = await embeddingService.generateEmbedding(
        req.params.STUDENTID,
        req.headers["token"]
    );
    res.json(response);
});

// ---- Semantic search ----

router.get("/search/:KEY", async (req, res) => {
    const response = await searchService.semanticSearch(req.params.KEY);
    res.json(response);
});

export default router;
