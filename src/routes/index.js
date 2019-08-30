const express = require('express');
const router = express.Router();
const spreadSheetRoutes = require('./spreadsheet_routes');
const googleAccess = require('../middlewares/google-access');

router.use('/spreadsheet', googleAccess, spreadSheetRoutes);

module.exports = router;
