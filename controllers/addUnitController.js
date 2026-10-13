const pool = require('../config/DBconnection')

const addUnits = async (req, res) => {
    const student_id = req.user.student_id
    const { unit_code, unit_name, semester_id } = req.body

    try {
        // 1. Validate the input fields
        if (!unit_code || !unit_name || !semester_id) {
            return res.status(400).json({
                message: 'Input fields cannot be empty.'
            })
        }

        // 2. Check whether the student is registered for the semester
        const [enrollments] = await pool.query(
            `SELECT BIN_TO_UUID(enrollment_id) AS enrollment_id
             FROM Enrollments
             WHERE student_id = UUID_TO_BIN(?)
             AND semester_id = UUID_TO_BIN(?)`,
            [student_id, semester_id]
        )

        if (enrollments.length === 0) {
            return res.status(404).json({
                message: 'You are not registered for this semester. Ensure you add the semester before adding units.'
            })
        }

        // 3. Find the unit using its unit code
        const [existingUnits] = await pool.query(
            `SELECT BIN_TO_UUID(unit_id) AS unit_id
             FROM Units
             WHERE unit_code = ?`,
            [unit_code]
        )

        let unitID

        if (existingUnits.length === 0) {
            // Create the unit if it does not exist
            await pool.query(
                `INSERT INTO Units (
                    unit_id,
                    unit_code,
                    unit_name
                )
                VALUES (
                    UUID_TO_BIN(UUID()),
                    ?,
                    ?
                )`,
                [unit_code, unit_name]
            )

            // Retrieve the newly created unit
            const [newUnits] = await pool.query(
                `SELECT BIN_TO_UUID(unit_id) AS unit_id
                 FROM Units
                 WHERE unit_code = ?`,
                [unit_code]
            )

            if (newUnits.length === 0) {
                throw new Error('Could not retrieve the new unit ID.')
            }

            unitID = newUnits[0].unit_id
        } else {
            unitID = existingUnits[0].unit_id
        }

        // 4. Check whether the student has already added this unit
        const [alreadyEnrolled] = await pool.query(
            `SELECT eu.enrolledunit_id
             FROM Enrollments AS e
             JOIN EnrolledUnits AS eu
                 ON e.enrollment_id = eu.enrollment_id
             WHERE e.student_id = UUID_TO_BIN(?)
             AND e.semester_id = UUID_TO_BIN(?)
             AND eu.unit_id = UUID_TO_BIN(?)`,
            [student_id, semester_id, unitID]
        )

        if (alreadyEnrolled.length > 0) {
            return res.status(409).json({
                message: 'You have already enrolled for this unit.'
            })
        }

        const enrollmentIDs = enrollments[0].enrollment_id

        // 5. Add the unit to every matching enrollment record
        await pool.query(
            `INSERT INTO EnrolledUnits (
                enrolledunit_id,
                enrollment_id,
                unit_id
            )
            VALUES (
                UUID_TO_BIN(UUID()),
                UUID_TO_BIN(?),
                UUID_TO_BIN(?)
            )`,
            [enrollmentIDs, unitID]
        )


        return res.status(201).json({
            message: 'Unit added successfully.'
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            message: 'Internal server error.'
        })
    }
}

module.exports = addUnits