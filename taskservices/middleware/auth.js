import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SECRETE_KEY = process.env.SECRETE_KEY;

// Role ids issued by the Spring Boot core service. Admin == 5, Student == 1.
export const ADMIN_ROLE = 5;

// Decode + verify a JWT (from the "token" header). Throws on invalid/expired.
export function decodeToken(token) {
    if (!token) throw new Error("Missing authentication token");
    return jwt.verify(token, SECRETE_KEY);
}

export function isAdmin(payload) {
    return Number(payload?.role) === ADMIN_ROLE;
}

// Builds a Mongoose filter scoped to ownership. Admins get an unrestricted
// filter ({}); students are restricted to documents they own via `ownerField`.
export function ownerFilter(payload, ownerField) {
    return isAdmin(payload) ? {} : { [ownerField]: payload.crid };
}

// Express middleware that validates the JWT presented in the "token" header,
// exactly like the rest of the task service (see services/taskService.js).
export function verifyToken(req, res, next) {
    try {
        const token = req.headers["token"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
        req.user = decodeToken(token);
        next();
    } catch (e) {
        return res.status(401).json({ code: 401, message: "Invalid or expired token" });
    }
}

export default verifyToken;
