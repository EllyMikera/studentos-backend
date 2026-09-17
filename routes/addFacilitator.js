const express = require('express')
const route = express.Router()
const addFacilitator = require('../controllers/addFacilitatorController')

route.post('/', addFacilitator)

module.exports = route