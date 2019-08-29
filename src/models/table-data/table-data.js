const { TableRowKey } = require('../keys/row-key')

class TableData {
  /**
   *
   * @param {string[]} propNames
   * @param {string[][]} rows
   * @param {string[]} mainFields
   */
  constructor(propNames, rows, mainFields) {
    this.propNames = propNames
    this.rows = rows
    this.mainFields = mainFields
  }

  /**
   *
   * @param {number} index
   * @returns {TableRowKey}
   */
  getRowKey(index) {
    const row = this.rows[index]
    return new TableRowKey(this.mainFields, row.filter((value, key) => this.mainFields.includes(this.propNames[key])), 'email')
  }

  /**
   *
   * @param {string[]} data
   * @param {string[]} keys
   */
  addElement(data, keys) {
    const newRow = Array.from({ length: this.propNames.length }, () => '')
    keys.forEach((key, index) => {
      const newValueIndex = this.propNames.indexOf(key)
      if (newValueIndex !== -1) {
        newRow[newValueIndex] = data[index]
      }
    })
    this.rows.push(newRow)
  }

  /**
   *
   * @param {number} index
   * @param {string[]} data
   * @param {string[]} keys
   */
  updateElement(index, data, keys) {
    const updatingRow = this.rows[index]
    keys.forEach((key, index) => {
      const newValueIndex = this.propNames.indexOf(key)
      if (newValueIndex !== -1 && data[index] !== '' && data[index] !== null && data[index] !== undefined) {
        updatingRow[newValueIndex] = data[index]
      }
    })
  }

  /**
   *
   * @param {TableData} updateTable
   */
  addUniqueData(updateTable) {
    for (let i = 0; i < updateTable.rows.length; i++) {
      const row = updateTable.rows[i]
      const rowKey = updateTable.getRowKey(i)
      let elementFoundIndex = -1
      for (let j = 0; j < this.rows.length; j++) {
        const comparingRowKey = this.getRowKey(j)
        if (rowKey.equals(comparingRowKey)) {
          elementFoundIndex = j
          break
        }
      }
      if (elementFoundIndex !== -1) {
        this.updateElement(elementFoundIndex, row, updateTable.propNames)
      } else {
        this.addElement(row, updateTable.propNames)
      }
    }
  }

  /**
   *
   * @param {TableData} mainTableData
   * @param {TableData} updateTableData
   * @param {string[]} choosenFields
   */
  static concatData(mainTableData, updateTableData, choosenFields) {
    const concatenatedProps = choosenFields
      ? choosenFields
      : [...mainTableData.propNames, ...updateTableData.propNames.filter(prop => !mainTableData.propNames.includes(prop))]
    const concatenatedData = new TableData(concatenatedProps, [], mainTableData.mainFields)
    concatenatedData.addUniqueData(mainTableData)
    concatenatedData.addUniqueData(updateTableData)
    return concatenatedData
  }
}

module.exports = {
  TableData,
}
