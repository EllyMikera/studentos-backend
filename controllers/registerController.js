const pool = require('../config/DBconnection')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')

dotenv.config()

const registerUser = async (req, res) => {
    const {
        name, 
        reg_number, 
        phone_number, 
        email, 
        password, 
        course, 
        year_of_study,
        semester_name,
        academic_year,
        start_date,
        end_date, 
        school, 
        department,
        institution,
    } = req.body;
    
    try {
        if(
            !name || 
            !reg_number || 
            !phone_number || 
            !email || 
            !password || 
            !course || 
            !year_of_study ||
            !semester_name ||
            !academic_year ||
            !start_date ||
            !end_date || 
            !school || 
            !department || 
            !institution
        ) {
            console.log('Fields cannot be empty. Enter the required fiels to proceed')
            return res.status(400).json({
                message: "Fields cannot be empty. Enter the required fiels to proceed"
            })
        }

        const [existingUser] = await pool.query(
            'SELECT BIN_TO_UUID(student_id) AS student_id, reg_number, email FROM Students WHERE reg_number = ?', [reg_number]
        )

        if(existingUser.length > 0) {
            console.log('This account already exists. Login to proceed to your dashboard')
            return res.status(400).json({
                message: "This account already exists. Login to proceed to your dashboard"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await pool.query(
            `INSERT INTO Students(student_id, name, reg_number, phone_number, email, password, course, year_of_study, school, department, institution)
            VALUES(
                UUID_TO_BIN(UUID()),?,?,?,?,?,?,?,?,?,?    
            )`,[name, reg_number, phone_number, email, hashedPassword, course, year_of_study, school, department, institution]
        )

        const [existingSemester] = await pool.query(
            `SELECT BIN_TO_UUID(semester_id) AS semester_id
            FROM Semesters
            WHERE semester_name = ?
            AND academic_year = ?
            AND start_date = ?
            AND end_date = ?`,
            [semester_name, academic_year, start_date, end_date]
        )

        let semesterID;
        if(existingSemester.length === 0) {
            await pool.query(
                `INSERT INTO Semesters(semester_id, semester_name, academic_year, start_date, end_date)
                VALUES(UUID_TO_BIN(UUID()), ?, ?, ?, ?)`, [semester_name, academic_year, start_date, end_date]
            )

            const [newSemester] = await pool.query(
                `SELECT BIN_TO_UUID(semester_id) AS semester_id
                FROM Semesters
                WHERE semester_name = ?
                AND academic_year = ?
                AND start_date = ?
                AND end_date = ?`,
                [semester_name, academic_year, start_date, end_date]
            )

            semesterID = newSemester[0].semester_id
        } else {
            semesterID = existingSemester[0].semester_id
        }

        const [registeredStudent] = await pool.query(
            `SELECT BIN_TO_UUID(student_id) AS student_id FROM Students
            WHERE reg_number = ?`, [reg_number]
        )

        const studentID = registeredStudent[0].student_id

        await pool.query(
           `INSERT INTO Enrollments(enrollment_id, student_id, semester_id)
            VALUES(UUID_TO_BIN(UUID()), UUID_TO_BIN(?), UUID_TO_BIN(?))`, [studentID, semesterID]
        )

        console.log('Account created successfully')
        res.status(201).json({
            message: 'Account created successfully'
        })

    } catch (error) {
        console.log(error?.message)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

module.exports = registerUser;