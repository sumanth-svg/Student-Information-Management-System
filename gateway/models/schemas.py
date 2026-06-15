from pydantic import BaseModel
from typing import Optional


# Signup request schema
class SignupSchema(BaseModel):
    fullname: str
    phone: str
    email: str
    password: str


# Signin request schema
class SigninSchema(BaseModel):
    username: str
    password: str


# User creation/update schema
class UsersSchema(BaseModel):
    fullname: str
    phone: str
    email: str
    password: str
    role: int
    status: int


# Task request schema
class TasksSchema(BaseModel):
    title: str
    description: str

    # createdby is optional because ReactJS will not send this field.
    # Node.js will identify the logged-in user from JWT token
    # and automatically add createdby before saving into MongoDB.
    createdby: Optional[int] = None

    assignedto: int
    priority: int
    deadline: str
    status: int


# ------------------------- Academic domain -------------------------

# Student record schema (PostgreSQL students table)
class StudentSchema(BaseModel):
    rollno: str
    name: str
    email: str
    department: str
    semester: int
    status: Optional[int] = 1


# Marks schema (PostgreSQL marks table)
class MarksSchema(BaseModel):
    studentid: int
    subject: str
    semester: int
    score: float
    maxscore: Optional[float] = 100


# Attendance schema (PostgreSQL attendance table)
class AttendanceSchema(BaseModel):
    studentid: int
    subject: str
    semester: int
    totalclasses: int
    attendedclasses: int


# ------------------------- Task service: assignments & insights -------------------------

# Assignment schema (MongoDB assignments collection). studentId is optional:
# students own what they create automatically; only an admin may target a user.
class AssignmentSchema(BaseModel):
    title: str
    description: Optional[str] = None
    dueDate: Optional[str] = None
    status: Optional[str] = "PENDING"
    studentId: Optional[int] = None


# Insight schema (MongoDB insights collection). Created/updated by admin only.
class InsightSchema(BaseModel):
    studentId: int
    type: str
    content: str
