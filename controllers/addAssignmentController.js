const pool = require('../config/DBconnection')

const addAssignment = async (req, res) => {
    const student_id = req.user.student_id
    const {unit_id, date_issued, due_date, description } = req.body;
    
    try {
        if (!unit_id || !date_issued || !due_date || !description) {
            console.log('Input fields cannot be empty. Please fill in the highlighted sections to continue')
            return res.status(400).json({
                message: 'Input fields cannot be empty. Please fill in the highlighted sections to continue'
            })
        }

        const [existingAssignment] = await pool.query(
            `SELECT BIN_TO_UUID(assignment_id) AS assignment_id, BIN_TO_UUID(unit_id) AS unit_id, date_issued, due_date FROM Assignments
            WHERE date_issued = ?`, [date_issued]
        )

        if(existingAssignment.length > 1) {
            console.log('This assignment has already been updated. Please check it in your assignments page')
            return res.status(400).json({
                message: 'This assignment has already been updated. Please check it in your assignments page'
            })
        }

        await pool.query(
            `INSERT INTO Assignments(assignment_id, unit_id, date_issued, due_date, description)
            VALUES(UUID_TO_BIN(UUID()), UUID_TO_BIN(?), ?, ?, ?)`, [unit_id, date_issued, due_date, description]
        )

        const [insertedAssignment] = await pool.query(
            `SELECT BIN_TO_UUID(assignment_id) AS assignment_id FROM Assignments
            WHERE date_issued = ?`, [date_issued]
        )

        const assignmentID = insertedAssignment[0].assignment_id

        await pool.query(
            `INSERT INTO Student_assignments(student_assignment_id, student_id, assignment_id)
            VALUES(UUID_TO_BIN(UUID()), UUID_TO_BIN(?), UUID_TO_BIN(?))`, [student_id, assignmentID]
        )

        console.log('Assignment updated successfully')
        res.status(201).json({
            message: 'Assignment updated successfully'
        })

    } catch (error) {
        console.log(error?.message)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

module.exports = addAssignment

//STEPS
/*
1. Input validation
2. check if the exact assignment a student is trying to insert exists in the database before inserting it in the assignments table
3. Populate the Students_assignment table with required data
*/

