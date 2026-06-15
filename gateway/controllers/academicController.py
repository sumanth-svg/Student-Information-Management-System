from fastapi import APIRouter, Header
from models.schemas import StudentSchema, MarksSchema, AttendanceSchema
import httpx

# Gateway relay for the academic domain.
#  - Student / Marks / Attendance / Report  -> Spring Boot core service (PostgreSQL) on 8001
#  - Analytics / Embeddings / Semantic search -> Node task service (MongoDB) on 8002
router = APIRouter(prefix="/academicservice")

SPRING_URL = "http://localhost:8001/"
NODE_URL = "http://127.0.0.1:8002/"


async def call_service(method: str, url: str, token: str, json_data=None):
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.request(
                method,
                url,
                json=json_data,
                headers={"Token": token} if token else {}
            )
        try:
            return response.json()
        except Exception:
            return {
                "code": 500,
                "message": "Downstream service returned non-JSON response",
                "status_code": response.status_code,
                "details": response.text
            }
    except httpx.ConnectError as e:
        return {
            "code": 500,
            "message": "FastAPI Gateway Error: Cannot connect to downstream service",
            "details": repr(e)
        }
    except httpx.ReadTimeout as e:
        return {
            "code": 500,
            "message": "FastAPI Gateway Error: downstream service timeout",
            "details": repr(e)
        }
    except Exception as e:
        return {
            "code": 500,
            "message": "FastAPI Gateway Error",
            "details": repr(e)
        }


# ----------------------- Students (PostgreSQL) -----------------------

@router.post("/savestudent")
async def saveStudent(S: StudentSchema, Token: str = Header(...)):
    return await call_service("POST", SPRING_URL + "student/savestudent", Token, S.model_dump())


@router.get("/getallstudents/{PAGE}/{SIZE}")
async def getAllStudents(PAGE: int, SIZE: int, Token: str = Header(...)):
    return await call_service("GET", SPRING_URL + f"student/getallstudents/{PAGE}/{SIZE}", Token)


@router.get("/getstudent/{ID}")
async def getStudent(ID: int, Token: str = Header(...)):
    return await call_service("GET", SPRING_URL + f"student/getstudent/{ID}", Token)


@router.put("/updatestudent/{ID}")
async def updateStudent(ID: int, S: StudentSchema, Token: str = Header(...)):
    return await call_service("PUT", SPRING_URL + f"student/updatestudent/{ID}", Token, S.model_dump())


@router.delete("/deletestudent/{ID}")
async def deleteStudent(ID: int, Token: str = Header(...)):
    return await call_service("DELETE", SPRING_URL + f"student/deletestudent/{ID}", Token)


# ----------------------- Marks (PostgreSQL) -----------------------

@router.post("/savemarks")
async def saveMarks(M: MarksSchema, Token: str = Header(...)):
    return await call_service("POST", SPRING_URL + "marks/savemarks", Token, M.model_dump())


@router.get("/getmarks/{STUDENTID}")
async def getMarks(STUDENTID: int, Token: str = Header(...)):
    return await call_service("GET", SPRING_URL + f"marks/getmarks/{STUDENTID}", Token)


# ----------------------- Attendance (PostgreSQL) -----------------------

@router.post("/saveattendance")
async def saveAttendance(A: AttendanceSchema, Token: str = Header(...)):
    return await call_service("POST", SPRING_URL + "attendance/saveattendance", Token, A.model_dump())


@router.get("/getattendance/{STUDENTID}")
async def getAttendance(STUDENTID: int, Token: str = Header(...)):
    return await call_service("GET", SPRING_URL + f"attendance/getattendance/{STUDENTID}", Token)


# ----------------------- Report (PostgreSQL) -----------------------

@router.get("/report/{STUDENTID}")
async def report(STUDENTID: int, Token: str = Header(...)):
    return await call_service("GET", SPRING_URL + f"report/{STUDENTID}", Token)


# ----------------------- Analytics / Logs / Embeddings / Search (MongoDB) -----------------------

@router.post("/generateanalytics/{STUDENTID}")
async def generateAnalytics(STUDENTID: int, Token: str = Header(...)):
    return await call_service("POST", NODE_URL + f"academic/generateanalytics/{STUDENTID}", Token)


@router.get("/analytics/{STUDENTID}")
async def getAnalytics(STUDENTID: int, Token: str = Header(...)):
    return await call_service("GET", NODE_URL + f"academic/analytics/{STUDENTID}", Token)


@router.get("/performancelogs/{STUDENTID}")
async def getPerformanceLogs(STUDENTID: int, Token: str = Header(...)):
    return await call_service("GET", NODE_URL + f"academic/performancelogs/{STUDENTID}", Token)


@router.post("/rebuildembeddings")
async def rebuildEmbeddings(Token: str = Header(...)):
    return await call_service("POST", NODE_URL + "academic/rebuildembeddings", Token)


@router.get("/search/{KEY}")
async def semanticSearch(KEY: str, Token: str = Header(...)):
    return await call_service("GET", NODE_URL + f"academic/search/{KEY}", Token)
