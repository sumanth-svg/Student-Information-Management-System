from fastapi import APIRouter, Header
from models.schemas import TasksSchema
import httpx

router = APIRouter(prefix="/taskservice")

NODE_URL = "http://127.0.0.1:8002/"


async def call_node(method: str, url: str, token: str, json_data=None):
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.request(
                method,
                url,
                json=json_data,
                headers={"Token": token}
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

    except httpx.ReadTimeout as e:
        return {
            "code": 500,
            "message": "FastAPI Gateway Error: Node.js service timeout",
            "details": repr(e)
        }

    except Exception as e:
        return {
            "code": 500,
            "message": "FastAPI Gateway Error",
            "details": repr(e)
        }


@router.post("/createtask")
async def createTask(T: TasksSchema, Token: str = Header(...)):
    return await call_node(
        "POST",
        NODE_URL + "task/createtask",
        Token,
        T.model_dump()
    )


@router.get("/getalltasks/{PAGE}/{SIZE}")
async def getAllTasks(PAGE: int, SIZE: int, Token: str = Header(...)):
    return await call_node(
        "GET",
        NODE_URL + f"task/getalltasks/{PAGE}/{SIZE}",
        Token
    )


@router.get("/vectorsearch/{KEY}")
async def vectorSearch(KEY: str, Token: str = Header(...)):
    return await call_node(
        "GET",
        NODE_URL + f"task/vectorsearch/{KEY}",
        Token
    )


@router.get("/gettask/{ID}")
async def getTask(ID: str, Token: str = Header(...)):
    return await call_node(
        "GET",
        NODE_URL + f"task/gettask/{ID}",
        Token
    )


@router.put("/updatetask/{ID}")
async def updateTask(ID: str, T: TasksSchema, Token: str = Header(...)):
    return await call_node(
        "PUT",
        NODE_URL + f"task/updatetask/{ID}",
        Token,
        T.model_dump()
    )


@router.delete("/deletetask/{ID}")
async def deleteTask(ID: str, Token: str = Header(...)):
    return await call_node(
        "DELETE",
        NODE_URL + f"task/deletetask/{ID}",
        Token
    )
