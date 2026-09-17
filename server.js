const express = require('express')
const dotenv = require('dotenv')
const server = express()
const loginUser = require('./routes/login')
const registerUser = require('./routes/register')
const addUnits = require('./routes/addUnit')
const addFacilitator = require('./routes/addFacilitator')
const addGoal= require('./routes/addGoals')
const addAssignment = require('./routes/addAssignment')
const addSchedule = require('./routes/addSchedule')

dotenv.config()

const PORT = process.env.DEV_PORT

server.use(express.json())

server.use('/login', loginUser)
server.use('/register', registerUser)
server.use('/addunits', addUnits)
server.use('/addfacilitator', addFacilitator)
server.use('/addgoal', addGoal)
server.use('/addassignment', addAssignment)
server.use('/addschedule', addSchedule)

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})