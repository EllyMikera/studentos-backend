const pool = require('../config/DBconnection')

const addAssignment = async (req, res) => {
    const student_id = req.user.student_id
    const { unit_id, date_issued, due_date} = req.body

    try {
        // 1. Validate the input fields
        if (!unit_id || !date_issued || !due_date) {
            return res.status(400).json({
                message: 'Input fields cannot be empty. Please fill in the highlighted sections to continue.'
            })
        }

        // 2. Check whether the student is enrolled in the unit
        const [enrolledUnits] = await pool.query(
            `SELECT eu.unit_id
             FROM Enrollments AS e
             JOIN EnrolledUnits AS eu
                 ON e.enrollment_id = eu.enrollment_id
             WHERE e.student_id = UUID_TO_BIN(?)
             AND eu.unit_id = UUID_TO_BIN(?)`,
            [student_id, unit_id]
        )

        if (enrolledUnits.length === 0) {
            return res.status(404).json({
                message: 'You have not enrolled in this unit. Ensure you add the unit before posting an assignment.'
            })
        }

        // 3. Check whether the exact assignment already exists for this unit
        const [existingAssignments] = await pool.query(
            `SELECT BIN_TO_UUID(assignment_id) AS assignment_id
             FROM Assignments
             WHERE unit_id = UUID_TO_BIN(?)
             AND date_issued = ?
             AND due_date = ?`,
            [unit_id, date_issued, due_date]
        )

        let assignmentID

        if (existingAssignments.length > 0) {
            // 4. Reuse the existing assignment ID
            assignmentID = existingAssignments[0].assignment_id
        } else {
            // 5. Insert a new assignment if no exact match exists
            await pool.query(
                `INSERT INTO Assignments (
                    assignment_id,
                    unit_id,
                    date_issued,
                    due_date
                )
                VALUES (
                    UUID_TO_BIN(UUID()),
                    UUID_TO_BIN(?),
                    ?, ?
                )`,
                [unit_id, date_issued, due_date]
            )

            // Retrieve the newly inserted assignment ID
            const [insertedAssignments] = await pool.query(
                `SELECT BIN_TO_UUID(assignment_id) AS assignment_id
                 FROM Assignments
                 WHERE unit_id = UUID_TO_BIN(?)
                 AND date_issued = ?
                 AND due_date = ?`,
                [unit_id, date_issued, due_date]
            )

            if (insertedAssignments.length === 0) {
                throw new Error('Could not retrieve the assignment ID.')
            }

            assignmentID = insertedAssignments[0].assignment_id
        }

        // 6. Check whether the assignment is already associated with this student
        const [studentAssignments] = await pool.query(
            `SELECT student_assignment_id
             FROM Student_assignments
             WHERE student_id = UUID_TO_BIN(?)
             AND assignment_id = UUID_TO_BIN(?)`,
            [student_id, assignmentID]
        )

        if (studentAssignments.length > 0) {
            return res.status(409).json({
                message: 'This assignment is already associated with your account.'
            })
        }

        // 7. Associate the assignment with the student
        await pool.query(
            `INSERT INTO Student_assignments (
                student_assignment_id,
                student_id,
                assignment_id
            )
            VALUES (
                UUID_TO_BIN(UUID()),
                UUID_TO_BIN(?),
                UUID_TO_BIN(?)
            )`,
            [student_id, assignmentID]
        )

        return res.status(201).json({
            message: 'Assignment added successfully.'
        })

    } catch (error) {
        console.error(error?.message)

        return res.status(500).json({
            message: 'Internal server error.'
        })
    }
}

module.exports = addAssignment