const express = require('express')
const route = express.Router()
const registerUser = require('../controllers/registerController')

route.post('/', registerUser)

module.exports = route