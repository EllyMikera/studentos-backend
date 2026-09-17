const express = require('express')
const route = express.Router()
const loginUser = require('../controllers/loginController')

route.post('/', loginUser)

module.exports = route