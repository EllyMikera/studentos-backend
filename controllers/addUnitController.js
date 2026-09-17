const pool = require('../config/DBconnection')

const addUnits = async (req, res) => {
    //const {student_id, unit_code, unit_name, semester_id /*facilitator_name, facilitator_phone_number*/} = req.body;
    const student_id = req.user.student_id
    console.log(student_id)
    const {unit_code, unit_name, semester_id} = req.body;
    const upperUnitCode = unit_code.toUpperCase()
    const upperUnitName = unit_name.toUpperCase()
    // const upperFacilitatorName = facilitator_name.toUpperCase()
    try {
        if(!unit_code || !unit_name /* || !semester_id || !facilitator_name || !facilitator_phone_number*/) {
            console.log('Input fields cannot be empty. Enter the highlighted fields to continue')
            return res.status(400).json({
                message: 'Input fields cannot be empty. Enter the highlighted fields to continue'
            })
        }
        // const [existingFacilitator] = await pool.query(
        //     `SELECT BIN_TO_UUID(facilitator_id) AS facilitator_id, facilitator_name, facilitator_phone_number FROM Facilitators 
        //     WHERE facilitator_phone_number = ?`, [facilitator_phone_number]
        // )

        // let facilitatorID;
        // if (existingFacilitator.length === 0) {
        //     await pool.query(
        //         `INSERT INTO Facilitators(facilitator_id, facilitator_name, facilitator_phone_number)
        //         VALUES(UUID_TO_BIN(UUID()), ?, ?)`, [upperFacilitatorName, facilitator_phone_number]
        //     )
        //     const [insertedFacilitator] = await pool.query(
        //         `SELECT BIN_TO_UUID(facilitator_id) AS facilitator_id FROM Facilitators
        //         WHERE facilitator_phone_number = ?`, [facilitator_phone_number]
        //     )
        //     facilitatorID = insertedFacilitator[0].facilitator_id
        // } else {
        //     facilitatorID = existingFacilitator[0].facilitator_id
        // }

        const [units] = await pool.query(
            `SELECT unit_code, unit_name FROM Units
            WHERE unit_code = ?`, [unit_code]
        )

        if(units.length > 0) {
            console.log('This units already exists. Insert a new unit to proceed')
            return res.status(400).json({
                message: 'This units already exists. Insert a new unit to proceed'
            })
        } else {
            await pool.query(
                `INSERT INTO Units(unit_id, unit_code, unit_name)
                VALUES(UUID_TO_BIN(UUID()), ?, ?)`, [upperUnitCode, upperUnitName]
            )
        }

        const [insertedUnit] = await pool.query(
            `SELECT BIN_TO_UUID(unit_id) AS unit_id FROM Units
            WHERE unit_code = ?`, [unit_code]
        )

        const unitID = insertedUnit[0].unit_id
        console.log(unitID)

        await pool.query(
            `INSERT INTO Enrollments(enrollment_id, student_id, unit_id, semester_id)
            VALUES(UUID_TO_BIN(UUID()), UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?))`, [student_id, unitID, semester_id]
        )

        // await pool.query(
        //     `INSERT INTO Enrollments(unit_id)
        //     VALUES(UUID_TO_BIN(?))`, [unitID]
        // )
        
        console.log('Units updated successfully')
        res.status(201).json({
            message: 'Units updated successfully'
        })

    } catch (error) {
        console.log(error?.message)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

module.exports = addUnits