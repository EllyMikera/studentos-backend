const pool = require('../config/DBconnection')

const addGoal = async (req, res) => {
    const student_id = req.user.student_id
    const {description} = req.body
    try {
        if (!description) {
            console.log('Input fields cannot be empty. Fill in the highlighted fields to continue')
            return res.status(400).json({
                message: 'Input fields cannot be empty. Fill in the highlighted fields to continue'
            })
        }

        await pool.query(
            `INSERT INTO Goals(goal_id, description)
            VALUES(UUID_TO_BIN(UUID()), ?)`, [description]
        )

        const [goalID] = await pool.query(
            `SELECT BIN_TO_UUID(goal_id) AS goal_id FROM Goals
            WHERE description = ?`, [description]
        )

        const getGoalID = goalID[0].goal_id

        const [semester] = await pool.query(
            `SELECT BIN_TO_UUID(semester_id) AS semester_id FROM Enrollments
            WHERE student_id = UUID_TO_BIN(?)`, [student_id]
        )

        const semester_id = semester[0].semester_id

        await pool.query(
            `INSERT INTO Student_goals(student_goals_id, student_id, goal_id, semester_id)
            VALUES(UUID_TO_BIN(UUID()), UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?))`, [student_id, getGoalID, semester_id]
        )

        console.log('Your goal has been updated successfully')
        res.status(201).json({
            message: 'Your goal has been updated successfully'
        })

        
    } catch (error) {
        console.log(error?.message)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

module.exports = addGoal