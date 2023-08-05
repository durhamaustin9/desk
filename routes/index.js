const express = require('express')
const path = require('path')
const app = express()

app.use('/desk', require(path.join(process.cwd(), '/routes/desk')))

module.exports = app
