from fastapi import APIRouter, Header
from models.schemas import SigninSchema, SignupSchema
import httpx

router = APIRouter(prefix="/authservice")

SPRING_URL = "http://localhost:8001/"

@router.post("/signup")
async def signup(U: SignupSchema):
    print(f"FastAPI received signup: {U}")
    print(f"Data: fullname={U.fullname}, email={U.email}, phone={U.phone}, password={U.password}")
    
    try:
        async with httpx.AsyncClient() as client:
            print(f"Forwarding to Spring: {SPRING_URL}user/signup")
            response = await client.post(
                SPRING_URL + "user/signup",
                json=U.model_dump()   # Send data to Spring
            )
            print(f"Spring response: {response.status_code}")
            return response.json() # Returs back the response received from spring
    except Exception as e:
        print(f"Error: {e}")
        return {"code": 500, "message": str(e)}

@router.post("/signin")
async def signin(U: SigninSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPRING_URL + "user/signin",
            json=U.model_dump()
        )
    return response.json()


@router.get("/uinfo")
async def uinfo(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + "user/uinfo",
            headers = {"Token": Token}
        )
    return response.json()

@router.get("/profile")
async def profile(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + "user/profile",
            headers = {"Token": Token}
        )
    return response.json()