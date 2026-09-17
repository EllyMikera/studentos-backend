const express = require('express')
const route = express.Router()
const addSchedule = require('../controllers/addScheduleController')
const verifyJWT = require('../middleware/verifyJWT')

route.post('/', verifyJWT, addSchedule)

module.exports = route