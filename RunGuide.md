# RunGuide – Student Deck (Student Information Management System)

## Prerequisites
| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20.x+ | `choco install nodejs` |
| npm | bundled | — |
| Python | 3.11+ | `choco install python` |
| Java JDK | 25.0.3+ | `choco install temurin` |
| Maven | 3.9+ | `choco install maven` |
| PostgreSQL | 18.x | Windows installer, create DB `mth` |
| MongoDB Atlas | any | free cluster, DB `mth` |
| Docker (optional) | 27.x | `choco install docker-desktop` |

## 1️⃣ Clone / Open Repository
```powershell
git clone https://github.com/your-username/microtask-hub.git
cd e:\BACKEND\MICROTASK
```

## 2️⃣ Install Node.js dependencies
```powershell
# Frontend
cd frontend\frontend
npm ci
npm run dev   # http://localhost:5173

# Task Service (Node + MongoDB)
cd ..\..\taskservices
npm ci
npm start      # default: node src/index.js on 8002
```

## 3️⃣ Set environment variables
### PostgreSQL (Spring Boot)
Edit `coreservices/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mth
spring.datasource.username=postgres
spring.datasource.password=YOUR_PG_PASSWORD
spring.jpa.hibernate.ddl-auto=update
jwt.secret=SuperSecretKeyForJWT
jwt.expirationMs=86400000
```
### MongoDB (Task Service)
Create `taskservices/.env`:
```dotenv
MONGODB_URI=mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net/mth?retryWrites=true&w=majority
PORT=8002
```

## 4️⃣ Build & run Spring Boot backend
```powershell
cd ..\coreservices
mvn clean install -DskipTests
mvn spring-boot:run   # http://localhost:8001
```

## 5️⃣ Run FastAPI gateway
```powershell
cd ..\gateway
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Gateway proxies `/auth/**` → 8001 and `/task/**` → 8002.

## 6️⃣ Create Admin account (one‑time)
```powershell
node scripts/create_admin.js
```
Output:
```
Email: admin@microtask.com
Password: admin123
Role Assigned: 5
```

## 7️⃣ Load mock data (30 Indian students)
```powershell
python scripts/insert_mock_data.py
```
Creates users and student records; each returns `200 OK`.

## 8️⃣ Verify the stack
| Component | URL | Expected |
|-----------|-----|----------|
| Frontend | http://localhost:5173 | UI loads |
| Gateway Swagger | http://localhost:8000/docs | All proxied routes displayed |
| Spring Boot health | http://localhost:8001/actuator/health | `{"status":"UP"}` |
| Task Service | http://localhost:8002/api/tasks | JSON list (empty initially) |
| PostgreSQL | `psql -U postgres -d mth` | Tables populated |
| MongoDB Atlas | `mth` DB | Collections `performance_logs`, `analytics_data`, `student_embeddings` |

## 9️⃣ Vector search demo
```powershell
curl -X POST http://localhost:8000/search \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"query":"Students weak in mathematics"}'
```
Returns a ranked list of student IDs.

## 🔧 Common troubleshooting
- **Port conflict** – stop the process or change the port in the config.
- **JWT verification fails** – ensure `jwt.secret` matches between Spring Boot and gateway.
- **MongoDB connection error** – verify `MONGODB_URI`, whitelist your IP in Atlas.
- **PostgreSQL role error** – create DB `mth` and set the correct password.
- **CORS errors** – gateway already allows `*`; adjust if you host frontend elsewhere.

## 📦 Production build (optional)
```powershell
# Frontend
cd frontend\frontend
npm run build   # outputs to /dist
# Docker (compose file provided)
docker compose up --build
```
All services run behind Docker.

---
You can now follow these steps to get **Student Deck** up and running quickly. Feel free to ask if any step needs clarification!
