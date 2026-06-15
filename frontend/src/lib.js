export const apibaseurl = "http://localhost:8000/authservice";
export const gatewayurl = "http://localhost:8000";

// Per-domain gateway base URLs.
export const studenturl    = gatewayurl + "/academicservice";
export const taskurl       = gatewayurl + "/taskservice";
export const assignmenturl = gatewayurl + "/assignmentservice";
export const insighturl    = gatewayurl + "/insightservice";

export const imgurl = import.meta.env.BASE_URL;

export function callApi(reqMethod, apiUrl, jsonData, formData, responseHandler, jwtToken = "")
{
    const headers = {};
    if (jsonData) headers["Content-Type"] = "application/json";
    if (jwtToken) headers["Token"] = jwtToken;

    const options = {
        method: reqMethod,
        headers: headers,
        body: jsonData ? JSON.stringify(jsonData) : formData ? formData : undefined
    };

    console.log("Making request to:", apiUrl);
    console.log("Request data:", jsonData);
    console.log("Request options:", options);

    fetch(apiUrl, options)
        .then((res) => {
            console.log("Response status:", res.status, res.statusText);
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return res.json();
        })
        .then((data) => {
            console.log("Response data:", data);
            responseHandler(data);
        })
        .catch((err) => {
            console.error("Fetch error:", err);
            console.error("Error message:", err.message);
            alert("Fetch failed: " + err.message);
        });
}

// ---- Promise-based helper used by the CRUD pages ----
// Resolves with the parsed JSON body (the backend always returns {code,...}).
export async function api(method, url, body = null) {
    const token = localStorage.getItem("token") || "";
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";
    if (token) headers["Token"] = token;

    try {
        const res = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
            ? await res.json()
            : { message: await res.text() };

        if (!res.ok) {
            return {
                code: res.status,
                message: data.message || `Request failed with HTTP ${res.status}`,
                details: data.details,
            };
        }

        return data;
    } catch (err) {
        return {
            code: 0,
            message: err?.message ? `Network error: ${err.message}` : "Network error",
        };
    }
}

// ---- JWT helpers (role-based UI) ----
// The Spring Boot JWT payload carries { username, role, crid }.
export function decodeToken(token = localStorage.getItem("token")) {
    try {
        if (!token) return null;
        const payload = token.split(".")[1];
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export const ADMIN_ROLE = 5;

export function getRole() {
    const p = decodeToken();
    return p ? Number(p.role) : null;
}

export function isAdmin() {
    return getRole() === ADMIN_ROLE;
}

export function currentUserId() {
    const p = decodeToken();
    return p ? p.crid : null;
}
