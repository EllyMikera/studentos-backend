const express = require('express')
const route = express.Router()
const addUnits = require('../controllers/addUnitController')
const verifyJWT = require('../middleware/verifyJWT')

route.post('/', verifyJWT, addUnits)

module.exports = route