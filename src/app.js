const cors = require('cors')
const createError = require('http-errors')
const express = require('express')
const apiRoutes = require('./routes')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.use('/api', apiRoutes)

app.use((req, res, next) => {
  return res.status(405).json({ message: 'Method not allowed!' })
})

app.use((error, req, res, next) => {
  return res.json({
    message: error.message,
  })
})

module.exports = app
