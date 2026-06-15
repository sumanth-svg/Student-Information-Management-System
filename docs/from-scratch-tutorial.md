# Micro Task Hub From Scratch Tutorial

This guide shows how to rebuild and understand the project as a beginner.

## 1. Learn The Basic Idea First

A modern web app often has these parts:

- a browser UI
- an API server
- a business logic server
- a database

In this project:

- React is the browser UI
- FastAPI is the gateway API server
- Spring Boot is the business logic server
- PostgreSQL stores the data

## 2. What You Need Installed

Before running the project, install:

- Node.js
- npm
- Python 3
- Java JDK
- Maven
- PostgreSQL
- a code editor such as VS Code

## 3. Build The Database First

Create the PostgreSQL database manually.

The database name is:

- `mth`

The app expects this database to exist before Spring Boot starts.

Then create or let Hibernate create the tables.

For this project, Hibernate is configured with:

- `spring.jpa.hibernate.ddl-auto=update`

That means the table structure can be updated automatically from the entity classes.

## 4. Start The Backend Services

### A. Start Spring Boot

Go to:

- `e:\BACKEND\MICROTASK\coreservices\coreservices`

Run:

```powershell
mvn spring-boot:run
```

This starts the core service on port `8001`.

### B. Start FastAPI

Go to:

- `e:\BACKEND\MICROTASK\gateway\gateway`

Run:

```powershell
python run.py
```

This starts the gateway on port `8000`.

### C. Start React

Go to:

- `e:\BACKEND\MICROTASK\frontend\frontend`

Run:

```powershell
npm run dev
```

This starts the frontend on port `5173`.

## 5. Understand The Data Flow

### Signup

1. The user types data into the signup form.
2. React validates the fields.
3. React sends JSON to FastAPI.
4. FastAPI validates the request shape using Pydantic.
5. FastAPI forwards the request to Spring Boot.
6. Spring Boot checks if the email already exists.
7. If the email is free, Spring Boot saves the user to PostgreSQL.
8. The success or error response returns all the way back to the browser.

### Signin

1. The user enters email and password.
2. React sends the signin request.
3. FastAPI forwards it to Spring Boot.
4. Spring Boot checks the credentials in PostgreSQL.
5. If the credentials are valid, Spring Boot creates a JWT token.
6. React stores the token in `localStorage`.
7. React redirects the user to `/home`.

### Home Screen

1. The home page reads the saved token.
2. React calls the gateway for user info.
3. FastAPI forwards the token to Spring Boot.
4. Spring Boot validates the token and loads the user data.
5. React shows the user name and menu list.

## 6. Rebuild The Frontend In Your Head

If you were to make this from zero, you would build in this order:

### Step 1: Create the React app

- make a Vite React project
- create login and signup screens
- manage form state with `useState`
- send requests with `fetch`

### Step 2: Create the FastAPI gateway

- create a FastAPI app
- enable CORS for the React origin
- define request schemas
- forward requests to the Spring service using `httpx`

### Step 3: Create the Spring Boot service

- create a Spring Boot project
- define entity classes
- create a JPA repository
- add service methods for signup, signin, and profile data
- connect to PostgreSQL

### Step 4: Connect the services

- React talks to FastAPI
- FastAPI talks to Spring Boot
- Spring Boot talks to PostgreSQL

## 7. How To Debug As A Beginner

When something breaks, check in this order:

1. Is PostgreSQL running?
2. Is Spring Boot running on `8001`?
3. Is FastAPI running on `8000`?
4. Is React running on `5173`?
5. Does the browser Network tab show the right URL?
6. Does the browser console show 404, 500, or CORS?
7. Does the backend console show a database or request error?

## 8. The Most Important Concept

The key idea in this project is separation of concerns.

- React handles the screen.
- FastAPI handles request forwarding.
- Spring Boot handles logic.
- PostgreSQL handles storage.

If you understand that split, the whole project becomes much easier to reason about.
