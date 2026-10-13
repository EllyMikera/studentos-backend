# StudentOS Backend

A student management and productivity backend that helps students organize their academic activities throughout the semester. It provides an API for managing student accounts, semester units, facilitators, academic goals, assignments, and class schedules.

Built with **Node.js, Express.js, and MySQL**.

## Table of Contents

1. [Technologies Used](#technologies-used)
2. [Main Features](#main-features)
3. [Database Logic](#database-logic)
4. [API Routes](#api-routes)
5. [Authentication](#authentication)
6. [Project Setup](#project-setup)
7. [Error Handling](#error-handling)
8. [Security Considerations](#security-considerations)
9. [Development Status](#development-status)
10. [Future Improvements](#future-improvements)
11. [License](#license)

## Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime for executing the backend |
| Express.js | Framework for API routes and HTTP request handling |
| MySQL | Relational database for application data |
| mysql2 | MySQL driver for Node.js |
| bcrypt | Hashing student passwords before storage |
| JSON Web Token (JWT) | Authentication and identifying students |
| dotenv | Loading environment variables from `.env` |

## Main Features

1. Student registration and login
2. Adding units for a semester
3. Assigning facilitators to units
4. Setting academic goals
5. Posting assignments for units
6. Adding schedules for units
7. Preventing duplicate records through application-level checks

## Database Logic

StudentOS uses a relational database to organize academic information and maintain relationships between records.

| Table | Description |
|---|---|
| **Students** | Account information: registration number, contact details, course, year of study, password hash |
| **Semesters** | Semester name, academic year, start date, end date |
| **Enrollments** | Connects a student to a semester, independent of the units selected |
| **Units** | Unit code, unit name, assigned facilitator |
| **EnrolledUnits** | Connects enrollments to selected units, allowing multiple units per semester |
| **Facilitators** | Facilitator details; an existing facilitator can be reused across units |
| **Schedules** | Day, venue, start time, end time for a unit |
| **Assignments** | Issue date, due date, and description for a unit |
| **Student_assignments** | Connects students to assignments, separating the assignment from the students associated with it |
| **Goals** | Academic goals a student intends to achieve over their semesters (fields depend on the implemented schema) |

> **Note:** Application-level duplicate checks are currently used in relevant controllers. Database constraints and transaction-based protection against simultaneous duplicate requests can be introduced in a later development stage.

## API Routes

Routes are listed without a common prefix. If your Express app mounts them under a prefix such as `/api`, include it in the final request URL.

| Method | Route | Purpose |
|---|---|---|
| POST | `/register` | Creates a student account for a first-time user |
| POST | `/login` | Authenticates a student and returns the login response, including a JWT if implemented |
| POST | `/addunits` | Adds a unit to the student's semester enrollment |
| POST | `/addfacilitator` | Assigns a facilitator to a unit, reusing an existing facilitator when details match |
| POST | `/addgoal` | Adds an academic goal for a semester |
| POST | `/addassignment` | Adds an assignment for an enrolled unit and associates it with the student |
| POST | `/addschedule` | Adds a schedule for an enrolled unit, avoiding exact duplicates |

### Registration: `/register`

Collects the student's personal and academic information, hashes the password, stores the student record, and associates the student with the relevant semester. If the semester already exists, the backend should reuse the existing semester record rather than create another one.

### Login: `/login`

Authenticates an existing student. On success, the backend can issue a JWT that the client sends with subsequent protected requests.

### Add Units: `/addunits`

Verifies that the student is registered for the semester, identifies the unit, checks whether the student has already added it, and records the relationship in `EnrolledUnits`.

### Add Facilitator: `/addfacilitator`

Verifies the student's enrollment in the unit and checks whether the unit already has a facilitator. If a matching facilitator exists, its ID is reused; otherwise a new facilitator record is created.

### Add Goal: `/addgoal`

Validates the submitted goal details and associates the goal with the authenticated student.

### Add Assignment: `/addassignment`

Verifies enrollment in the unit, checks whether the same assignment already exists, and reuses its ID if found. It then links the assignment to the student through `Student_assignments`, avoiding duplicate associations.

### Add Schedule: `/addschedule`

Verifies enrollment, checks whether the exact schedule already exists for the unit, and inserts a new record only when no match is found.

## Authentication

Protected routes use JWT-based authentication. After a successful login, include the token in the `Authorization` header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The authentication middleware verifies the token and exposes the authenticated student's information to controllers through `req.user`.

Registration and login are public. Routes that modify student-specific academic data should require authentication.

## Project Setup

### Prerequisites

- Node.js and npm
- MySQL Server (or access to a compatible MySQL database)
- Git
- A code editor, such as Visual Studio Code

Verify installations:

```bash
node --version
npm --version
git --version
```

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

Replace `YOUR_USERNAME` and `YOUR_REPOSITORY` with your actual values. If the backend lives in a subdirectory, navigate into it before continuing.

### 2. Install dependencies

```bash
npm install
```

If `package.json` is missing, confirm you are in the correct backend directory. For a new project, run `npm init -y` and install the required packages:

```bash
npm install express mysql2 dotenv bcrypt jsonwebtoken
```

### 3. Configure environment variables

Create a `.env` file in the backend root, alongside `package.json`:

```env
# Application configuration
PORT=5000
NODE_ENV=development

# MySQL database configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=studentos

# Authentication
JWT_SECRET=replace_with_a_long_random_secret
```

The variable names must match those referenced in your `DBconnection` file and authentication code (for example, `process.env.DB_HOST`).

Never commit your real `.env` file. Add this to `.gitignore`:

```gitignore
node_modules/
.env
```

### 4. Create the MySQL database

```sql
CREATE DATABASE studentos;
USE studentos;
```

Then run the schema file to create the tables and relationships:

```bash
mysql -u your_mysql_username -p studentos < schema.sql
```

Run this from the directory containing `schema.sql`. Ensure table and column names match the SQL queries in the controllers.

### 5. Start the backend

Check the `scripts` section of `package.json`, then run:

```bash
npm run dev    # if a dev script is defined
npm start      # if a start script is defined
```

Example scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

If you use Nodemon and it isn't installed:

```bash
npm install --save-dev nodemon
```

Replace `server.js` with your actual entry file (for example, `app.js`). With `PORT=5000`, the base URL is `http://localhost:5000`.

### 6. Test the API

Use Postman, Insomnia, or your frontend to test the routes. For example:

```text
POST http://localhost:5000/register
```

Send the JSON body expected by the registration controller. For protected routes, include a valid JWT in the `Authorization` header.

## Error Handling

| Status code | Meaning |
|---|---|
| `200 OK` | Request succeeded, such as reusing an existing record |
| `201 Created` | A new record or association was created |
| `400 Bad Request` | Required fields are missing or invalid |
| `401 Unauthorized` | Authentication is missing or invalid |
| `403 Forbidden` | Request is not permitted under the authentication rules |
| `404 Not Found` | A required resource or enrollment could not be found |
| `409 Conflict` | Request conflicts with an existing record, such as a duplicate |
| `500 Internal Server Error` | Unexpected server-side error |

The exact response depends on each controller and the authentication middleware.