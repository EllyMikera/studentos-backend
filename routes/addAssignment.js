const express = require('express')
const route = express.Router()
const addAssignment = require('../controllers/addAssignmentController')
const verifyJWT = require('../middleware/verifyJWT')

route.post('/', verifyJWT, addAssignment)

module.exports = route