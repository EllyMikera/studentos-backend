const express = require('express')
const route = express.Router()
const addFacilitator = require('../controllers/addFacilitatorController')
const verifyJWT = require('../middleware/verifyJWT')

route.post('/', verifyJWT, addFacilitator)

module.exports = route