import httpx
import asyncio
import random

first_names = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Shaurya",
    "Sanya", "Diya", "Priya", "Ananya", "Kavya", "Riya", "Aarohi", "Avni", "Khushi", "Isha",
    "Rahul", "Rohan", "Neha", "Pooja", "Vikram", "Sneha", "Karan", "Simran", "Amit", "Nisha"
]

last_names = [
    "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Reddy", "Rao", "Das", "Bose",
    "Mukherjee", "Jain", "Shah", "Mehta", "Bhatia", "Chauhan", "Yadav", "Nair", "Iyer", "Pillai",
    "Kapoor", "Malhotra", "Agarwal", "Bansal", "Kaur", "Tiwari", "Mishra", "Pandey", "Dixit", "Joshi"
]

departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Information Technology"]

async def insert_data():
    async with httpx.AsyncClient(timeout=30.0) as client:
        # We will insert 30 users via the authservice/signup endpoint
        # And we could also insert them as students if needed. Let's do users first.
        
        for i in range(30):
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            fullname = f"{fname} {lname}"
            email = f"{fname.lower()}.{lname.lower()}{i}@example.com"
            phone = f"98765{random.randint(10000, 99999)}"
            password = "password123"

            user_data = {
                "fullname": fullname,
                "phone": phone,
                "email": email,
                "password": password
            }

            try:
                # Signup (inserts into users table via Spring Boot)
                res = await client.post("http://localhost:8000/authservice/signup", json=user_data)
                print(f"Signup {fullname} ({email}): {res.status_code} - {res.text}")

                # Also insert as student for academic service
                student_data = {
                    "rollno": f"STU2026{str(i).zfill(3)}",
                    "name": fullname,
                    "email": email,
                    "department": random.choice(departments),
                    "semester": random.randint(1, 8),
                    "status": 1
                }

                # We need a token for academic service if it requires one, but the controller in Spring 
                # might just accept any token if security is disabled, or we can sign in first.
                # Let's try signing in to get a token.
                signin_data = {
                    "username": email,
                    "password": password
                }
                res_signin = await client.post("http://localhost:8000/authservice/signin", json=signin_data)
                if res_signin.status_code == 200:
                    token = res_signin.json().get("jwt", "dummy_token")
                    
                    res_stu = await client.post("http://localhost:8000/academicservice/savestudent", 
                                                json=student_data, 
                                                headers={"Token": token})
                    print(f"  Student Insert: {res_stu.status_code} - {res_stu.text}")

            except Exception as e:
                print(f"Error inserting {fullname}: {e}")

if __name__ == "__main__":
    asyncio.run(insert_data())
