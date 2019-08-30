const { google } = require('googleapis')
const { TableData } = require('../models/table-data/table-data')
const { GOOGLE_MAIN_FIELDS } = require('../constants/google-main-fields')

class SheetsApi {
  /**
   * @param {any} request nodejs Request object
   */
  constructor(request) {
    if (!request.oauth2Client) {
      throw new Error('Route requires google authorization')
    }
    this.oauth2Client = request.oauth2Client
    this.sheets = google.sheets({ version: 'v4', auth: this.oauth2Client })
  }

  /**
   * Get name of the tabs from given Google spreadsheet
   * @param {string} spreadsheetId  id of Google spreadsheet
   * @returns {string[]}
   */
  async getSheetsTabNames(spreadsheetId) {
    return this.getSheetsMetadata(spreadsheetId).then(data => data.map(sheet => sheet.title))
  }

  /**
   * Get spreadsheet information
   * @param {string} spreadsheetId id of Google spreadsheet
   */
  async getSheetsMetadata(spreadsheetId) {
    return this.sheets.spreadsheets.get({ spreadsheetId }).then(res => res.data.sheets.map(sheet => sheet.properties))
  }

  /**
   * Get data of given range from Google spreadsheet
   * @param {string} spreadsheetId id of Google spreadsheet
   * @param {string} range range for the given spreadsheet
   */
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

  /**
   * Get all data from one tab of Google spreadsheet
   * @param {string} spreadsheetId id of Google spreadsheet
   * @param {string} tabName name of the tab to get data
   */
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

  /**
   *
   * @param {string} spreadsheetId id of Google spreadsheet
   * @param {string[][]} rows new tab rows
   * @param {string[]} propNames new tab property names
   * @param {string} tabName name of the tab to save into
   */
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
   * Concat tabA and tabB to tabC without duplicates
   * @param {string} spreadsheetId id of Google spreadsheet
   * @param {string} tabA tabs
   * @param {string} tabB tabs
   * @param {string[]} tabC tab to save results
   * @param {string} range A google annotation
   * @returns {TableData}
   */
  async concatTabs(spreadsheetId, tabA, tabB, tabC) {
    const [tabAData, tabBData] = await Promise.all([this.getFullSheetTab(spreadsheetId, tabA), this.getFullSheetTab(spreadsheetId, tabB)])
    const tableAData = new TableData(tabAData.propNames, tabAData.rows, GOOGLE_MAIN_FIELDS)
    const tableBData = new TableData(tabBData.propNames, tabBData.rows, GOOGLE_MAIN_FIELDS)
    const mergedData = TableData.concatData(tableAData, tableBData)
    await this.saveTabData(spreadsheetId, mergedData.rows, mergedData.propNames, tabC)
    return mergedData
  }
}

module.exports = {
  SheetsApi,
}
