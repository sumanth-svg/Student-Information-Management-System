import StudentEmbeddings from "../models/studentEmbeddings.js";
import * as vectorService from "./vectorService.js";
import dotenv from "dotenv";
dotenv.config();

const VECTOR_INDEX = process.env.VECTOR_INDEX || "student_vector_index";

/**
 * Semantic academic search over the student_embeddings collection.
 *
 * Primary method is the same as the reference project: generate an embedding
 * for the query and rank students by cosine similarity (true vector similarity,
 * NOT keyword matching). If a MongoDB Atlas Vector Search index is available we
 * use $vectorSearch first and transparently fall back to cosine similarity.
 *
 * Example queries:
 *   - "students weak in mathematics"
 *   - "top performing students in semester"
 *   - "students with poor attendance"
 *   - "students performing well in science"
 *   - "students needing improvement"
 */
export async function semanticSearch(key) {
    if (!key || !key.trim()) {
        return { code: 400, message: "Search key is required", students: [] };
    }

    try {
        const searchVector = await vectorService.generateVector(key);

        // ---- Try true MongoDB Atlas Vector Search first ----
        try {
            const atlasResults = await StudentEmbeddings.aggregate([
                {
                    $vectorSearch: {
                        index: VECTOR_INDEX,
                        path: "vector",
                        queryVector: searchVector,
                        numCandidates: 100,
                        limit: 5
                    }
                },
                {
                    $project: {
                        _id: 0,
                        studentid: 1,
                        rollno: 1,
                        name: 1,
                        department: 1,
                        summary: 1,
                        similarity: { $meta: "vectorSearchScore" }
                    }
                }
            ]);

            if (atlasResults && atlasResults.length > 0) {
                return {
                    code: 200,
                    method: "atlas_vector_search",
                    students: atlasResults
                };
            }
        } catch (atlasError) {
            // Atlas index not configured yet (or local cluster) - fall back.
            console.log("Atlas vector search unavailable, using cosine fallback:", atlasError.message);
        }

        // ---- Cosine similarity fallback (reference project approach) ----
        const embeddings = await StudentEmbeddings.find({});

        const students = embeddings
            .map((doc) => {
                const similarity = vectorService.cosineSimilarity(searchVector, doc.vector);
                return {
                    studentid: doc.studentid,
                    rollno: doc.rollno,
                    name: doc.name,
                    department: doc.department,
                    summary: doc.summary,
                    similarity: similarity
                };
            })
            .filter((s) => s.similarity > 0.10)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5);

        return {
            code: 200,
            method: "cosine_similarity",
            students: students
        };
    } catch (e) {
        return { code: 500, message: e.message, students: [] };
    }
}
