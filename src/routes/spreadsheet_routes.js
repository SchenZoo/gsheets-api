const express = require('express');
const router = express.Router();
const { SheetsApi } = require('../services/sheets-api');

router.post('/:id/sheet_concat', async (req, res, next) => {
  const sheetsApi = new SheetsApi(req);
  const spreadsheetId = req.params.id;
  try {
    const tabNames = await sheetsApi.getSheetsTabNames(spreadsheetId);
    return res.json(await sheetsApi.concatTabs(spreadsheetId, tabNames[0], tabNames[1], tabNames[2]));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
