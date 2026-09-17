const pool = require('../config/DBconnection')

const addSchedule = async (req, res) => {
    const {unit_id, day, venue, start_time, end_time} = req.body
    try {
        if (!unit_id || !day || !venue || !start_time || !end_time) {
            console.log('Input fields cannot be empty. Please insert the highlighted fields to continue')
            return res.status(400).json({
                message: 'Input fields cannot be empty. Please insert the highlighted fields to continue'
            })
        }

        const [existingSchedule] = await pool.query(
            `SELECT BIN_TO_UUID(unit_id) AS unit_id, day, venue, start_time, end_time FROM Schedules
            WHERE unit_id = ?`, [unit_id]
        )

        if(existingSchedule.length > 0) {
            console.log('This unit already has the inserted schedule. Insert another time schedule')
            return res.status(400).json({
                message: 'This unit already has the inserted schedule. Insert another time schedule'
            })
        }

        await pool.query(
            `INSERT INTO Schedules(schedule_id, unit_id, day, venue, start_time, end_time)
            VALUES(UUID_TO_BIN(UUID()), UUID_TO_BIN(?), ?, ?, ?, ?)`, [unit_id, day, venue, start_time, end_time]
        )

        console.log('Schedule updated successfully')
        return res.status(201).json({
            message: 'Schedule updated successfully'
        })

    } catch (error) {
        console.log(error?.message)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

module.exports = addSchedule