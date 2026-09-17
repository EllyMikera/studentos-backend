const pool = require('../config/DBconnection')

const addFacilitator = async (req, res) => {
    const {unit_id, facilitator_name, facilitator_phone_number} = req.body
    try {
        if (!unit_id || !facilitator_name || !facilitator_phone_number) {
            console.log('Input fields cannot be empty. Enter the highlighted fields to continue')
            return res.status(400).json({
                message: 'Input fields cannot be empty. Enter the highlighted fields to continue'
            })
        }

        const upperFacilitatorName = facilitator_name.toUpperCase()

        const [existingFacilitator] = await pool.query(
            `SELECT BIN_TO_UUID(facilitator_id) AS facilitator_id, facilitator_name, facilitator_phone_number FROM Facilitators 
            WHERE facilitator_phone_number = ?`, [facilitator_phone_number]
        )

        let facilitatorID;
        if (existingFacilitator.length === 0) {
            await pool.query(
                `INSERT INTO Facilitators(facilitator_id, facilitator_name, facilitator_phone_number)
                VALUES(UUID_TO_BIN(UUID()), ?, ?)`, [upperFacilitatorName, facilitator_phone_number]
            )
            const [insertedFacilitator] = await pool.query(
                `SELECT BIN_TO_UUID(facilitator_id) AS facilitator_id FROM Facilitators
                WHERE facilitator_phone_number = ?`, [facilitator_phone_number]
            )
            facilitatorID = insertedFacilitator[0].facilitator_id
        } else {
            facilitatorID = existingFacilitator[0].facilitator_id
        }

        await pool.query(
            `UPDATE Units
            SET facilitator_id = UUID_TO_BIN(?)
            WHERE unit_id = UUID_TO_BIN(?)`, [facilitatorID, unit_id]
        )

        console.log('Facilitator added successfully')
        res.status(201).json({
            message: 'Facilitator added successfully'
        })

    } catch (error) {
        console.log(error?.message)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

module.exports = addFacilitator