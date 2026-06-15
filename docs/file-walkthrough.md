# Micro Task Hub File-by-File Walkthrough

This guide explains the main files in the project and what each one does. Line references point to the current source layout.

## Frontend

### `frontend/src/main.jsx`

- `frontend/src/main.jsx:1-10` sets up React Router and defines the routes.
- `/` renders `App`.
- `/home` renders `Home`.

### `frontend/src/lib.js`

- `frontend/src/lib.js:1-29` defines the shared API base URL and the `callApi()` helper.
- `apibaseurl` points to `http://localhost:8000/authservice`.
- `callApi()` builds headers, sends the fetch request, parses JSON, and forwards the response to the callback.

### `frontend/src/App.jsx`

- `frontend/src/App.jsx:1-24` imports React hooks, the API helper, CSS, and the progress bar.
- `frontend/src/App.jsx:25-38` handles initial focus and window switching between signin and signup.
- `frontend/src/App.jsx:40-50` updates form state for signin and signup inputs.
- `frontend/src/App.jsx:52-65` validates the signup and signin forms.
- `frontend/src/App.jsx:67-88` sends the login and signup requests.
- `frontend/src/App.jsx:90-110` handles API responses.
- `frontend/src/App.jsx:112-205` renders the login and signup UI.

Important detail: signup sends only `fullname`, `phone`, `email`, and `password`. It does not send `retypepassword`.

### `frontend/src/components/Home.jsx`

- `frontend/src/components/Home.jsx:1-6` imports dependencies.
- `frontend/src/components/Home.jsx:8-27` loads token-based user info when the page opens.
- `frontend/src/components/Home.jsx:29-38` handles logout.
- `frontend/src/components/Home.jsx:40-48` loads a module when a menu item is selected.
- `frontend/src/components/Home.jsx:50-74` renders the home page and menu list.

### `frontend/src/components/Profile.jsx`

- `frontend/src/components/Profile.jsx:1-8` imports dependencies and defines state.
- `frontend/src/components/Profile.jsx:10-19` loads profile data using the stored token.
- `frontend/src/components/Profile.jsx:21-55` renders the profile screen.

## FastAPI Gateway

### `gateway/main.py`

- `gateway/main.py:1-17` creates the FastAPI app and enables CORS.
- `gateway/main.py:19-19` registers the authentication router.
- `gateway/main.py:21-23` defines a simple root health route.

### `gateway/controllers/init.py`

- `gateway/controllers/init.py:1-1` exports the authentication router so `main.py` can import it.

### `gateway/controllers/authenticationController.py`

- `gateway/controllers/authenticationController.py:1-6` imports FastAPI, Pydantic schemas, and `httpx`.
- `gateway/controllers/authenticationController.py:8-27` defines `POST /authservice/signup`.
- `gateway/controllers/authenticationController.py:29-37` defines `POST /authservice/signin`.
- `gateway/controllers/authenticationController.py:40-47` defines `GET /authservice/uinfo`.
- `gateway/controllers/authenticationController.py:49-56` defines `GET /authservice/profile`.

The gateway forwards requests to Spring Boot at `http://localhost:8001/user/...`.

### `gateway/models/schemas.py`

- `gateway/models/schemas.py:1-12` defines the request bodies.
- `SignupSchema` expects `fullname`, `phone`, `email`, and `password`.
- `SigninSchema` expects `username` and `password`.

### `gateway/run.py`

- `gateway/run.py:1-4` starts Uvicorn on `localhost:8000` with reload enabled.

## Spring Boot Core Service

### `coreservices/src/main/resources/application.properties`

- `coreservices/src/main/resources/application.properties:1-14` sets the application name, server port, and PostgreSQL connection.
- `server.port=8001` means Spring Boot runs on port 8001.
- `spring.datasource.url=jdbc:postgresql://localhost:5432/mth` points to the `mth` database.
- `spring.jpa.hibernate.ddl-auto=update` lets Hibernate update the schema automatically.

### `coreservices/src/main/java/mth/controller/UsersController.java`

- `coreservices/src/main/java/mth/controller/UsersController.java:1-18` sets up the controller and enables CORS.
- `coreservices/src/main/java/mth/controller/UsersController.java:20-28` handles signup requests.
- `coreservices/src/main/java/mth/controller/UsersController.java:30-34` handles signin requests.
- `coreservices/src/main/java/mth/controller/UsersController.java:36-40` handles `uinfo` requests.

### `coreservices/src/main/java/mth/services/UsersService.java`

- `coreservices/src/main/java/mth/services/UsersService.java:1-13` injects repository and JWT service dependencies.
- `coreservices/src/main/java/mth/services/UsersService.java:15-39` handles signup logic.
- `coreservices/src/main/java/mth/services/UsersService.java:41-62` handles signin logic.
- `coreservices/src/main/java/mth/services/UsersService.java:64-80` handles token validation and user info loading.

### `coreservices/src/main/java/mth/repository/UsersRepository.java`

- `coreservices/src/main/java/mth/repository/UsersRepository.java:1-25` declares repository methods.
- `validateCredentials()` checks login credentials.
- `checkByEmail()` checks whether an email already exists.
- `findByEmail()` loads the full user record.
- `getMenus()` loads menu items for a given role.

### `coreservices/src/main/java/mth/models/Users.java`

- `coreservices/src/main/java/mth/models/Users.java:1-67` defines the JPA entity for the `users` table.
- Fields include `fullname`, `phone`, `email`, `password`, `role`, and `status`.

## What To Notice

The frontend never talks to PostgreSQL directly. It always talks to FastAPI first.

FastAPI also does not write to the database. It just forwards requests to Spring Boot.

Spring Boot is the only layer that writes and reads the database.
