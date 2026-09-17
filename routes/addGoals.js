const express = require('express')
const route = express.Router()
const addGoal = require('../controllers/addGoalsController')
const verifyJWT = require('../middleware/verifyJWT')

route.post('/', verifyJWT, addGoal)

module.exports = route