const { google } = require('googleapis')
const createError = require('http-errors')
const { TableData } = require('../models/table-data/table-data')
const { GOOGLE_MAIN_FIELDS } = require('../constants/google-main-fields')

class SheetsApi {
  constructor(request) {
    if (!request.oauth2Client) {
      throw new Error('Route required google authorization')
    }
    this.oauth2Client = request.oauth2Client
    this.sheets = google.sheets({ version: 'v4', auth: this.oauth2Client })
  }

  async getSheetsTabNames(spreadsheetId) {
    return this.getSheetsMetadata(spreadsheetId).then(data => data.map(sheet => sheet.title))
  }

  async getSheetsMetadata(spreadsheetId) {
    return this.sheets.spreadsheets.get({ spreadsheetId }).then(res => res.data.sheets.map(sheet => sheet.properties))
  }

  async getSheetTable(spreadsheetId, range) {
    return this.sheets.spreadsheets.values
      .get({
        spreadsheetId,
        range,
      })
      .then(response => {
        const rows = response.data.values
        if (!rows) {
          throw new Error('Empty Tab')
        }
        const propNames = rows.splice(0, 1)[0]
        return {
          propNames,
          rows,
        }
      })
  }

  async getFullSheetTab(spreadsheetId, tabName) {
    const take = 100
    let skip = 1
    let rows = []
    let getMore = false
    do {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${tabName}!A${skip}:Z${take + skip - 1}`,
      })
      const newRows = response.data.values
      if (!newRows) {
        // if its not first iteration
        if (rows.length) {
          break
        }
        // Sheet is empty
        return {
          propNames: [],
          rows,
        }
      }
      rows.push(...newRows)
      getMore = newRows.length === take
      skip += take
    } while (getMore)
    const propNames = rows.splice(0, 1)[0]
    return {
      propNames,
      rows,
    }
  }

  async saveTabData(spreadsheetId, rows, propNames, tabName) {
    rows.unshift(propNames)
    const endLetter = String.fromCharCode(64 + propNames.length)
    const range = `${tabName}!A1:${endLetter}${rows.length + 1}`
    return this.sheets.spreadsheets.values.update({
      auth: this.oauth2Client,
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rows,
      },
    })
  }

  /**
   *
   * @param {string} spreadsheetId
   * @param {string[]} tabNamesFrom tabs
   * @param {string[]} tabNameTo tab to save results
   * @param {string} range A google annotation
   */
  async concatTabs(spreadsheetId, tabNamesFrom, tabNameTo) {
    const [tabAData, tabBData] = await Promise.all([
      this.getFullSheetTab(spreadsheetId, tabNamesFrom[0]),
      this.getFullSheetTab(spreadsheetId, tabNamesFrom[1]),
    ])
    const tableAData = new TableData(tabAData.propNames, tabAData.rows, GOOGLE_MAIN_FIELDS)
    const tableBData = new TableData(tabBData.propNames, tabBData.rows, GOOGLE_MAIN_FIELDS)
    const finalData = TableData.concatData(tableAData, tableBData)
    await this.saveTabData(spreadsheetId, finalData.rows, finalData.propNames, tabNameTo)
    return finalData
  }
}

module.exports = {
  SheetsApi,
}
