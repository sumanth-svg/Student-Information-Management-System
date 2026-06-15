# Micro Task Hub - Beginner Guide

## Documentation

- [Architecture Guide](docs/architecture-guide.md)
- [File-by-File Walkthrough](docs/file-walkthrough.md)
- [From-Scratch Tutorial](docs/from-scratch-tutorial.md)

## What This Project Is

This document explains the project from the ground up. It is written for someone who is new to full-stack development and wants to understand how the frontend, FastAPI gateway, Spring Boot backend, and PostgreSQL database work together.

## 1. What This Project Is

Micro Task Hub is a web application with three parts:

- A **React frontend** where the user signs up, signs in, and uses the app.
- A **FastAPI gateway** that acts like a middle layer and forwards requests.
- A **Spring Boot core service** that talks to PostgreSQL and contains the main business logic.

The database stores users, roles, menus, and related data.

## 2. Big Picture Architecture

The request flow is:

1. The user opens the React app in the browser.
2. The React app sends a request to the FastAPI gateway.
3. The FastAPI gateway forwards the request to Spring Boot.
4. Spring Boot reads or writes data in PostgreSQL.
5. Spring Boot returns JSON back to FastAPI.
6. FastAPI returns the same JSON back to React.
7. React updates the UI.

In short:

**Browser -> React -> FastAPI -> Spring Boot -> PostgreSQL**

## 3. Folder Structure

The project folder contains three separate apps:

- `frontend/` - React + Vite app
- `gateway/` - FastAPI app
- `coreservices/` - Spring Boot app

Each one has its own dependencies, scripts, and startup process.

## 4. Port Map

These are the ports currently used by the project:

- PostgreSQL: `5432`
- FastAPI gateway: `8000`
- Spring Boot backend: `8001`
- React frontend dev server: `5173`

## 5. Which Service Does What

### Frontend

The frontend is the user interface. It shows the login screen, signup form, home page, and profile page.

Main file:

- `frontend/src/App.jsx` - login/signup screen
- `frontend/src/components/Home.jsx` - home page after login
- `frontend/src/components/Profile.jsx` - profile view
- `frontend/src/lib.js` - shared API helper
- `frontend/src/main.jsx` - React entry point

### FastAPI Gateway

The gateway receives requests from the frontend and forwards them to Spring Boot.

Main files:

- `gateway/main.py` - FastAPI app setup and CORS
- `gateway/controllers/authenticationController.py` - signup, signin, profile, and user-info forwarding
- `gateway/models/schemas.py` - request body validation
- `gateway/run.py` - starts the FastAPI server

### Spring Boot Core Service

The Spring service contains the actual business logic and database access.

Main files:

- `coreservices/src/main/java/mth/controller/UsersController.java`
- `coreservices/src/main/java/mth/services/UsersService.java`
- `coreservices/src/main/java/mth/repository/UsersRepository.java`
- `coreservices/src/main/java/mth/models/Users.java`
- `coreservices/src/main/resources/application.properties`

## 6. Frontend Explained

### `src/main.jsx`

This is the first React file that runs.

It:

- creates the React root
- enables React Router
- defines the routes

Current routes:

- `/` -> `App`
- `/home` -> `Home`

That means:

- when the user opens the site, they see the login/signup screen
- after login, the app redirects to `/home`

### `src/App.jsx`

This is the login/signup screen.

It does four important things:

1. Keeps form values in React state.
2. Validates the user input.
3. Sends API calls using `callApi()`.
4. Switches between login and signup modes.

#### Login flow in `App.jsx`

When the user clicks login:

- it checks that username and password are not empty
- it sends a `POST` request to the gateway
- if login succeeds, the JWT token is saved in `localStorage`
- then the app redirects to `/home`

#### Signup flow in `App.jsx`

When the user clicks register:

- it checks that all fields are filled
- it also checks that password and retype password match
- it sends only these fields:
  - `fullname`
  - `phone`
  - `email`
  - `password`
- it does **not** send `retypepassword` to the backend

This is important because the backend schema does not expect `retypepassword`.

### `src/lib.js`

This file contains shared utility values and the API helper.

Important values:

- `apibaseurl = "http://localhost:8000/authservice"`
- `imgurl = import.meta.env.BASE_URL`

That means the frontend talks to the FastAPI gateway, not directly to Spring Boot.

#### `callApi()`

This helper:

- creates request headers
- adds `Content-Type: application/json` when needed
- adds the JWT token when needed
- sends the request with `fetch()`
- converts the response to JSON
- passes the JSON to a callback function

If the response status is not OK, it throws an error so the app can show a message.

### `src/components/Home.jsx`

This is the page shown after successful login.

It does three main things:

1. Reads the token from `localStorage`.
2. Calls the gateway `/uinfo` endpoint to get the logged-in user details and menu list.
3. Lets the user open modules like Profile.

The `Home` page also has a logout function that clears `localStorage` and sends the user back to `/`.

### `src/components/Profile.jsx`

This component loads the user profile from the gateway `/profile` endpoint.

It uses the token stored in `localStorage` and shows:

- name
- phone number
- email
- role

### `src/components/ProgressBar.jsx`

This component is used as a loading indicator while requests are running.

## 7. FastAPI Gateway Explained

### `gateway/main.py`

This is the FastAPI app entry point.

It does the following:

- creates the FastAPI application
- enables CORS for `http://localhost:5173`
- registers the authentication router

CORS is needed because the browser frontend runs on a different port.

### `gateway/controllers/authenticationController.py`

This file contains the API routes exposed by the gateway.

It defines the prefix:

- `/authservice`

So the full gateway routes become:

- `POST /authservice/signup`
- `POST /authservice/signin`
- `GET /authservice/uinfo`
- `GET /authservice/profile`

#### What each route does

- `signup()` receives the signup form data and forwards it to Spring Boot `/user/signup`
- `signin()` forwards login data to Spring Boot `/user/signin`
- `uinfo()` forwards the JWT token to Spring Boot `/user/uinfo`
- `profile()` forwards the JWT token to Spring Boot `/user/profile`

So the gateway does not own the business logic. It just forwards requests.

### `gateway/models/schemas.py`

This file defines the shape of incoming request bodies.

#### `SignupSchema`

Expected fields:

- `fullname`
- `phone`
- `email`
- `password`

#### `SigninSchema`

Expected fields:

- `username`
- `password`

If the frontend sends a wrong field name, FastAPI will not match it properly.

### `gateway/run.py`

This file starts the FastAPI server using Uvicorn.

It runs on:

- host: `localhost`
- port: `8000`

## 8. Spring Boot Backend Explained

### `application.properties`

This file stores Spring configuration.

Important settings:

- `server.port=8001`
- PostgreSQL connection details
- Hibernate auto-update mode

The database connection is:

- host: `localhost`
- port: `5432`
- database: `mth`
- username: `postgres`
- password: `mistake`

### `UsersController.java`

This controller exposes Spring endpoints.

Routes:

- `POST /user/signup`
- `POST /user/signin`
- `GET /user/uinfo`

The controller simply passes the request to `UsersService`.

### `UsersService.java`

This file contains the business logic.

#### `signup(Users U)`

This method:

1. checks whether the email already exists
2. sets default values for `role` and `status`
3. saves the new user to the database
4. returns a JSON-like response map

#### `signin(Map<String, Object> data)`

This method:

1. checks the username and password in the database
2. if valid, generates a JWT token
3. returns the JWT token

#### `uinfo(String token)`

This method:

1. validates the JWT token
2. reads the user email from the token
3. finds the user in the database
4. gets the menus allowed for that role
5. returns the user name and menu list

### `UsersRepository.java`

This interface talks to the database using JPA queries.

Important methods:

- `validateCredentials(username, password)`
- `checkByEmail(email)`
- `findByEmail(email)`
- `getMenus(role)`

These are custom queries written with JPQL.

### `Users.java`

This is the JPA entity for the users table.

Fields:

- `id`
- `fullname`
- `phone`
- `email`
- `password`
- `role`
- `status`

This class maps directly to the `users` table in PostgreSQL.

## 9. Database Explained

The PostgreSQL database must already exist.

In this project, the database name is:

- `mth`

The table structure is managed by Hibernate with:

- `spring.jpa.hibernate.ddl-auto=update`

That means Spring Boot can create or update tables automatically based on the entity classes.

### Important table behavior

The `users` table is used for signup and login.

When a user signs up:

- React sends the form
- FastAPI forwards it
- Spring Boot saves it to PostgreSQL

## 10. Startup Order

Start the project in this order:

### Step 1: PostgreSQL

Make sure PostgreSQL is running and the `mth` database exists.

### Step 2: Spring Boot core service

Run from:

- `e:\BACKEND\MICROTASK\coreservices\coreservices`

Command:

```powershell
mvn spring-boot:run
```

This should start on port `8001`.

### Step 3: FastAPI gateway

Run from:

- `e:\BACKEND\MICROTASK\gateway\gateway`

Command:

```powershell
python run.py
```

This should start on port `8000`.

### Step 4: React frontend

Run from:

- `e:\BACKEND\MICROTASK\frontend\frontend`

Command:

```powershell
npm run dev
```

This should start on port `5173`.

### Step 5: Use the app in the browser

Open:

- `http://localhost:5173`

## 11. Signup Flow Step by Step

This is what happens when a user signs up:

1. The user fills the form in React.
2. React validates the fields.
3. React sends JSON to `POST /authservice/signup`.
4. FastAPI receives the request.
5. FastAPI forwards the same JSON to Spring Boot `/user/signup`.
6. Spring Boot checks if the email already exists.
7. If not, Spring Boot inserts the new user into PostgreSQL.
8. Spring Boot returns `{ code: 200, message: "User account has been created." }`.
9. FastAPI returns the same response to React.
10. React shows the success message and returns to the sign-in form.

## 12. Signin Flow Step by Step

1. The user enters email and password.
2. React sends JSON to `POST /authservice/signin`.
3. FastAPI forwards the request to Spring Boot `/user/signin`.
4. Spring Boot checks the database.
5. If credentials are valid, Spring Boot creates a JWT token.
6. The token comes back through FastAPI to React.
7. React saves the token in `localStorage`.
8. React redirects the user to `/home`.
9. The home page uses the token to fetch user info.

## 13. Why We Had Errors Earlier

These were the main issues we fixed:

- The frontend was pointing at the wrong backend port at first.
- Some frontend calls had a duplicated `/authservice` prefix.
- The backend was correctly working, but the browser kept calling the wrong route.

Now the intended flow is consistent:

- Frontend -> `http://localhost:8000/authservice/...`
- FastAPI -> `http://localhost:8001/user/...`
- Spring Boot -> PostgreSQL

## 14. Common Beginner Mistakes

### Mistake 1: Wrong port

If you point the frontend directly to Spring Boot or the wrong port, requests may fail.

### Mistake 2: Wrong endpoint path

If a route is `/authservice/signup`, do not call `/signup` or `/authservice/authservice/signup` accidentally.

### Mistake 3: Backend not running

All services must be running at the same time.

### Mistake 4: Database missing

Spring Boot cannot create the database itself. PostgreSQL must already have `mth`.

### Mistake 5: Wrong JSON field names

FastAPI and Spring rely on matching field names.

## 15. How To Debug This Project

### If signup says fetch failed

Check these in order:

1. Is React running on `5173`?
2. Is FastAPI running on `8000`?
3. Is Spring Boot running on `8001`?
4. Is PostgreSQL running on `5432`?
5. Is the browser calling the correct URL in DevTools Network?
6. Does the browser console show 404, 500, or CORS errors?

### If the browser shows 404

That means the route path is wrong.

### If the browser shows CORS error

That means the browser blocked the request because the server did not allow cross-origin access.

### If Spring Boot shows database errors

Then the data is arriving, but PostgreSQL rejected it or the schema does not match.

## 16. How To Make Changes Safely

When you want to change the app:

### Frontend changes

- edit files in `frontend/src`
- run `npm run dev`
- refresh the browser

### FastAPI changes

- edit files in `gateway`
- restart `python run.py`

### Spring Boot changes

- edit files in `coreservices/src/main/java`
- restart `mvn spring-boot:run`

### Database changes

- update entities in Spring Boot
- let Hibernate update tables if appropriate
- or edit PostgreSQL manually if you need a specific schema

## 17. Beginner Mental Model

A simple way to think about the project:

- **React** = what the user sees
- **FastAPI** = request relay / middleman
- **Spring Boot** = the brain of the app
- **PostgreSQL** = long-term storage

Each layer has one job.

## 18. What To Learn Next

If you want to become comfortable with this project, study these topics in this order:

1. HTML, CSS, and JavaScript basics
2. React state, props, and hooks
3. HTTP methods: GET and POST
4. JSON request and response format
5. FastAPI request handling
6. Spring Boot controllers and services
7. PostgreSQL tables and SQL
8. JWT authentication
9. JPA repositories and entity mapping

## 19. Quick Reference

### Frontend

- Start: `npm run dev`
- URL: `http://localhost:5173`

### FastAPI

- Start: `python run.py`
- URL: `http://localhost:8000`

### Spring Boot

- Start: `mvn spring-boot:run`
- URL: `http://localhost:8001`

### PostgreSQL

- Port: `5432`
- Database: `mth`

## 20. Short Summary

This project is a 3-layer web app:

- React handles the UI
- FastAPI forwards browser requests
- Spring Boot handles business logic and database access
- PostgreSQL stores the data

If you understand the request path from React to FastAPI to Spring Boot to PostgreSQL, you understand the whole project.
