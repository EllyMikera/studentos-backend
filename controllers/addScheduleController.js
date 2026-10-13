const pool = require('../config/DBconnection')

const addSchedule = async (req, res) => {
    const student_id = req.user.student_id
    const { unit_id, day, venue, start_time, end_time } = req.body

    try {
        // 1. Validate the input fields
        if (!unit_id || !day || !venue || !start_time || !end_time) {
            return res.status(400).json({
                message: 'Input fields cannot be empty. Please insert the highlighted fields to continue.'
            })
        }

        // 2. Check whether the student has enrolled in the unit
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
                message: 'You have not enrolled in this unit. Ensure you add the unit before adding a schedule.'
            })
        }

        // 3. Check whether this exact schedule already exists for the unit
        const [existingSchedule] = await pool.query(
            `SELECT schedule_id
             FROM Schedules
             WHERE unit_id = UUID_TO_BIN(?)
             AND day = ?
             AND venue = ?
             AND start_time = ?
             AND end_time = ?`,
            [unit_id, day, venue, start_time, end_time]
        )

        if (existingSchedule.length === 0) {
            // return res.status(200).json({
            //     message: 'This schedule already exists for this unit. The existing schedule has been reused.'
            // })

            // 4. Insert the schedule only if the exact record does not exist
            await pool.query(
                `INSERT INTO Schedules (
                    schedule_id,
                    unit_id,
                    day,
                    venue,
                    start_time,
                    end_time
                )
                VALUES (
                    UUID_TO_BIN(UUID()),
                    UUID_TO_BIN(?),
                    ?, ?, ?, ?
                )`,
                [unit_id, day, venue, start_time, end_time]
            )
        }

        // 5. Return a success response
        return res.status(201).json({
            message: 'Schedule added successfully.'
        })

    } catch (error) {
        console.error(error?.message)

        return res.status(500).json({
            message: 'Internal server error.'
        })
    }
}

module.exports = addSchedule