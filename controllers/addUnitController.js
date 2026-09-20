const pool = require('../config/DBconnection')

const addUnits = async (req, res) => {
    const student_id = req.user.student_id
    const {
        unit_code,
        unit_name,
        semester_id
    } = req.body

    try {
        if (!unit_code || !unit_name || !semester_id) {
            return res.status(400).json({
                message: 'Input fields cannot be empty.'
            })
        }

        const upperUnitCode = unit_code.toUpperCase()
        const upperUnitName = unit_name.toUpperCase()

        // 1. Check whether the unit already exists
        const [units] = await pool.query(
            `SELECT BIN_TO_UUID(unit_id) AS unit_id
             FROM Units
             WHERE unit_code = ?`,
            [upperUnitCode]
        )

        let unitID

        // 2. If unit doesn't exist, create it
        if (units.length === 0) {
            await pool.query(
                `INSERT INTO Units(
                    unit_id,
                    unit_code,
                    unit_name
                )
                VALUES(
                    UUID_TO_BIN(UUID()),
                    ?,
                    ?
                )`,
                [upperUnitCode, upperUnitName]
            )

            // Get the newly created unit ID
            const [newUnit] = await pool.query(
                `SELECT BIN_TO_UUID(unit_id) AS unit_id
                 FROM Units
                 WHERE unit_code = ?`,
                [upperUnitCode]
            )

            unitID = newUnit[0].unit_id

        } else {
            // 3. Unit already exists, reuse its ID
            unitID = units[0].unit_id
        }


        // 4. Check whether THIS STUDENT already has THIS UNIT
        const [existingEnrollment] = await pool.query(
            `SELECT enrollment_id
             FROM Enrollments
             WHERE student_id = UUID_TO_BIN(?)
             AND unit_id = UUID_TO_BIN(?)
             AND semester_id = UUID_TO_BIN(?)`,
            [student_id, unitID, semester_id]
        )


        // 5. Student already has this unit
        if (existingEnrollment.length > 0) {
            return res.status(400).json({
                message: 'You have already added this unit.'
            })
        }


        // 6. Student doesn't have the unit → create enrollment
        await pool.query(
            `INSERT INTO Enrollments(
                enrollment_id,
                student_id,
                unit_id,
                semester_id
            )
            VALUES(
                UUID_TO_BIN(UUID()),
                UUID_TO_BIN(?),
                UUID_TO_BIN(?),
                UUID_TO_BIN(?)
            )`,
            [student_id, unitID, semester_id]
        )

        console.log('Unit added successfully.')
        return res.status(201).json({
            message: 'Unit added successfully.'
        })

    } catch (error) {
        console.log(error?.message)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

module.exports = addUnits