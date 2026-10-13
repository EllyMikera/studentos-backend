const pool = require('../config/DBconnection')

const addFacilitator = async (req, res) => {
    const student_id = req.user.student_id
    const { unit_id, facilitator_name, facilitator_phone_number } = req.body

    try {
        // 1. Validate the input fields
        if (!unit_id || !facilitator_name || !facilitator_phone_number) {
            return res.status(400).json({
                message: 'Input fields cannot be empty.'
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
                message: 'You have not enrolled in this unit. Ensure you add the unit before assigning a facilitator.'
            })
        }

        // 3. Check whether the unit already has a facilitator
        const [units] = await pool.query(
            `SELECT facilitator_id
             FROM Units
             WHERE unit_id = UUID_TO_BIN(?)`,
            [unit_id]
        )

        if (units.length === 0) {
            return res.status(404).json({
                message: 'Unit not found. Ensure you add the unit before assigning a facilitator.'
            })
        }

        // if (units[0].facilitator_id !== null) {
        //     return res.status(409).json({
        //         message: 'This unit already has a facilitator.'
        //     })
        // }

        // 4. Check whether the facilitator already exists
        const [existingFacilitators] = await pool.query(
            `SELECT BIN_TO_UUID(facilitator_id) AS facilitator_id
             FROM Facilitators
             WHERE facilitator_phone_number = ?`,
            [facilitator_phone_number]
        )

        let facilitatorID

        if (existingFacilitators.length === 0) {
            // 5. Create a new facilitator if no matching phone number exists
            await pool.query(
                `INSERT INTO Facilitators (
                    facilitator_id,
                    facilitator_name,
                    facilitator_phone_number
                )
                VALUES (
                    UUID_TO_BIN(UUID()),
                    ?,
                    ?
                )`,
                [facilitator_name, facilitator_phone_number]
            )

            // Retrieve the newly created facilitator ID
            const [newFacilitators] = await pool.query(
                `SELECT BIN_TO_UUID(facilitator_id) AS facilitator_id
                 FROM Facilitators
                 WHERE facilitator_phone_number = ?`,
                [facilitator_phone_number]
            )

            if (newFacilitators.length === 0) {
                throw new Error('Could not retrieve the new facilitator ID.')
            }

            facilitatorID = newFacilitators[0].facilitator_id
        } else {
            // Reuse the existing facilitator ID
            facilitatorID = existingFacilitators[0].facilitator_id
        }

        // 6. Assign the facilitator to the unit
        await pool.query(
            `UPDATE Units
             SET facilitator_id = UUID_TO_BIN(?)
             WHERE unit_id = UUID_TO_BIN(?)`,
            [facilitatorID, unit_id]
        )

        return res.status(201).json({
            message: 'Facilitator added successfully.'
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            message: 'Internal server error.'
        })
    }
}

module.exports = addFacilitator