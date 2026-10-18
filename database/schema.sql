CREATE TABLE IF NOT EXISTS Students(
    student_id BINARY(16) PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    reg_number VARCHAR(20) NOT NULL,
    phone_number VARCHAR(13) NOT NULL UNIQUE,
    email VARCHAR(30) NOT NULL,
    password VARCHAR(255) NOT NULL,
    course VARCHAR(150) NOT NULL,
    year_of_study VARCHAR(20) NOT NULL,
    school VARCHAR(200) NOT NULL,
    department VARCHAR(50) NOT NULL,
    institution VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Facilitators(
    facilitator_id BINARY(16) PRIMARY KEY,
    facilitator_name VARCHAR(30),
    facilitator_phone_number VARCHAR(12)UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Units(
    unit_id BINARY(16) PRIMARY KEY,
    facilitator_id BINARY(16),
    unit_code VARCHAR(10),
    unit_name VARCHAR(40),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(facilitator_id) REFERENCES Facilitators(facilitator_id)
);

CREATE TABLE IF NOT EXISTS Semesters(
    semester_id BINARY(16) PRIMARY KEY,
    semester_name VARCHAR(25) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Assignments(
    assignment_id BINARY(16) PRIMARY KEY,
    unit_id BINARY(16),
    date_issued DATE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(unit_id) REFERENCES Units(unit_id)
);

CREATE TABLE IF NOT EXISTS Schedules(
    schedule_id BINARY(16) PRIMARY KEY,
    unit_id BINARY(16),
    day VARCHAR(10),
    venue VARCHAR(10),
    start_time TIME,
    end_time TIME,
    FOREIGN KEY(unit_id) REFERENCES Units(unit_id)
);

CREATE TABLE IF NOT EXISTS Goals(
    goal_id BINARY(16) PRIMARY KEY,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Enrollments(
    enrollment_id BINARY(16) PRIMARY KEY,
    student_id BINARY(16),
    semester_id BINARY(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES Students(student_id),
    FOREIGN KEY(semester_id) REFERENCES Semesters(semester_id)
);

CREATE TABLE IF NOT EXISTS EnrolledUnits(
    enrolledunit_id BINARY(16) PRIMARY KEY,
    unit_id BINARY(16),
    enrollment_id BINARY(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(unit_id) REFERENCES Units(unit_id),
    FOREIGN KEY(enrollment_id) REFERENCES Enrollments(enrollment_id)
);

CREATE TABLE IF NOT EXISTS Student_assignments (
    student_assignment_id BINARY(16) PRIMARY KEY,
    assignment_id BINARY(16),
    student_id BINARY(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(assignment_id) REFERENCES Assignments(assignment_id),
    FOREIGN KEY(student_id) REFERENCES Students(student_id)
);

CREATE TABLE IF NOT EXISTS Student_goals (
    student_goals_id BINARY(16) PRIMARY KEY,
    student_id BINARY(16),
    goal_id BINARY(16),
    semester_id BINARY(16),
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (goal_id) REFERENCES Goals(goal_id),
    FOREIGN KEY (semester_id) REFERENCES Semesters(semester_id)
)

-- Referencial integrity