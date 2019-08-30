const cors = require('cors')
const path = require('path')
const express = require('express')
const apiRoutes = require('./routes')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.use('/api', apiRoutes)
const appVersion = process.env.APP_VERSION

app.use(express.static(path.join('dist/v' + appVersion)))

app.use('*', (req, res) => {
  res.sendFile(path.resolve(`dist/v${appVersion}/index.html`))
})

app.use((req, res, next) => {
  return res.status(405).json({ message: 'Method not allowed!' })
})

app.use((error, req, res, next) => {
  return res.status(500).json({
    message: error.message,
  })
})

module.exports = app
