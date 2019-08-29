const express = require('express')
const router = express.Router()
const { asyncRequest } = require('../middlewares/async-request')
const { SheetsApi } = require('../services/sheets-api')

router.get(
  '/:id/sheet',
  asyncRequest(async (req, res) => {
    const sheetsApi = new SheetsApi(req)
    return res.json(await sheetsApi.getSheetsMetadata(req.params.id))
  }),
)

router.post(
  '/:id/sheet_concat',
  asyncRequest(async (req, res) => {
    const sheetsApi = new SheetsApi(req)
    const spreadsheetId = req.params.id
    const tabNames = await sheetsApi.getSheetsTabNames(spreadsheetId)
    return res.json(await sheetsApi.concatTabs(spreadsheetId, tabNames, tabNames[2]))
  }),
)

module.exports = router
