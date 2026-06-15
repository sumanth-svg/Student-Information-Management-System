from fastapi import APIRouter, Header
from models.schemas import AssignmentSchema
import httpx

# Gateway relay for the assignment domain -> Node task service (MongoDB) on 8002.
router = APIRouter(prefix="/assignmentservice")

NODE_URL = "http://127.0.0.1:8002/"


async def call_node(method: str, url: str, token: str, json_data=None):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
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
                "message": "Node.js returned non-JSON response",
                "status_code": response.status_code,
                "details": response.text
            }
    except httpx.ConnectError as e:
        return {
            "code": 500,
            "message": "FastAPI Gateway Error: Cannot connect to Node.js service on port 8002",
            "details": repr(e)
        }
    except Exception as e:
        return {
            "code": 500,
            "message": "FastAPI Gateway Error",
            "details": repr(e)
        }


@router.get("/getall")
async def get_all_assignments(Token: str = Header(...)):
    return await call_node("GET", NODE_URL + "assignment/getall", Token)


@router.get("/get/{ID}")
async def get_assignment(ID: str, Token: str = Header(...)):
    return await call_node("GET", NODE_URL + f"assignment/get/{ID}", Token)


@router.post("/create")
async def create_assignment(A: AssignmentSchema, Token: str = Header(...)):
    return await call_node("POST", NODE_URL + "assignment/create", Token, A.model_dump())


@router.put("/update/{ID}")
async def update_assignment(ID: str, A: AssignmentSchema, Token: str = Header(...)):
    return await call_node("PUT", NODE_URL + f"assignment/update/{ID}", Token, A.model_dump())


@router.delete("/delete/{ID}")
async def delete_assignment(ID: str, Token: str = Header(...)):
    return await call_node("DELETE", NODE_URL + f"assignment/delete/{ID}", Token)
