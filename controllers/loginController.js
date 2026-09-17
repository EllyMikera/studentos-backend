const pool = require('../config/DBconnection');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')

dotenv.config();

const loginUser = async (req, res) => {
    const {reg_number, password} = req.body
    try {
        if(!reg_number || !password) {
            console.log('Ensure you fill all fields before you continue')
            return res.status(400).json({
                message: 'Ensure you fill all fields before you continue'
            })
        }

        const [existingUser] = await pool.query(
            'SELECT BIN_TO_UUID(student_id) AS student_id, name, reg_number, phone_number, email, password FROM Students WHERE reg_number = ?',[reg_number]
        )

        if(existingUser.length === 0) {
            console.log("User with this account doesn't exist. Check your username or password or create an account to proceed")
            return res.status(404).json({
                message: "User with this account doesn't exist. Check your username or password or create an account to proceed"
            })
        }

        const isValid = await bcrypt.compare(password, existingUser[0].password)
        if(!isValid) {
            console.log('Invalid email or password. Try again')
            return res.status(400).json({
                message: 'Invalid email or password. Please try again'
            })
        }

        const token = JWT.sign(
            {
                student_id: existingUser[0].student_id,
                reg_number: existingUser[0].reg_number,
                email: existingUser[0].email
            }, process.env.SECRET_KEY,
            {
                expiresIn: '15m'
            }
        )

        console.log('Login successful. Welcome')
        res.status(200).json({
            token,
            message: 'Login successful. Welcome'
        })

    } catch (error) {
        console.log(error?.message)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

module.exports = loginUser