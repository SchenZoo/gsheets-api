const { RowData } = require('../row-data/row-data')

class TableData {
  /**
   *
   * @param {string[]} propNames
   * @param {string[][]} rows
   * @param {string[]} keyFields
   * @param {string} uniqueIdentifier
   */
  constructor(propNames, rows, keyFields, uniqueIdentifier) {
    this.propNames = propNames
    this.rows = rows
    this.keyFields = keyFields
    this.uniqueIdentifier = uniqueIdentifier
  }

  /**
   *
   * @param {number} index
   * @returns {RowData}
   */
  getRowData(index) {
    const row = this.rows[index]
    return new RowData(row, this.propNames, this.keyFields, this.uniqueIdentifier)
  }

  /**
   *
   * @param {RowData} firstRowData
   * @param {RowData} secondRowData
   * @returns {boolean}
   */
  static compareRows(firstRowData, secondRowData) {
    return !firstRowData.keyFieldNames.some((firstKeyFieldName, index) => {
      const firstKeyValue = firstRowData.keyFields[index]
      const secondKeyValue = secondRowData.keyFields[index]
      // if some of key values is not equal rows are not duplicates
      if (firstKeyValue !== secondKeyValue) {
        return true
      }
      // fields cannot be equal if unique identifier is missing (email address for google)
      if (
        firstKeyFieldName === firstRowData.uniqueIdentifier &&
        ((!firstKeyValue && firstKeyValue !== 0) || (!secondKeyValue && secondKeyValue !== 0))
      ) {
        return true
      }
      return false
    })
  }

  /**
   * @param {RowData} rowData
   */
  addElement(rowData) {
    const newRow = Array.from({ length: this.propNames.length }, () => '')
    rowData.propNames.forEach((key, index) => {
      let newValueIndex = this.propNames.indexOf(key)
      // if property didnt exist add property to table (this can be discussed as it may not be wanted behavior)
      if (newValueIndex === -1) {
        this.propNames.push(key)
        newValueIndex = this.propName.length - 1
      }
      newRow[newValueIndex] = rowData.props[index]
    })
    this.rows.push(newRow)
  }

  /**
   *
   * @param {number} index
   * @param {RowData} rowData
   */
  updateElement(index, rowData) {
    const updatingRow = this.rows[index]
    const data = rowData.props
    rowData.propNames.forEach((key, index) => {
      let newValueIndex = this.propNames.indexOf(key)
      // adding new property to table (this can be discussed as it may not be wanted behavior)
      if (newValueIndex === -1) {
        this.propNames.push(key)
        newValueIndex = this.propName.length - 1
      }
      if (data[index] || data[index] === 0) {
        updatingRow[newValueIndex] = data[index]
      }
    })
  }

  /**
   * Adding new table to current one without duplicates
   * @param {TableData} updateTable
   */
  addUniqueData(updateTable) {
    // For every row in incoming table
    for (let i = 0; i < updateTable.rows.length; i++) {
      const rowData = updateTable.getRowData(i)
      let elementFoundIndex = -1
      // check every row in current table
      for (let j = 0; j < this.rows.length; j++) {
        const comparingRowData = this.getRowData(j)
        // finding if there is already that row in current table
        if (TableData.compareRows(rowData, comparingRowData)) {
          elementFoundIndex = j
          break
        }
      }
      // adding new element in case its not duplicate or updating row with newer data
      if (elementFoundIndex !== -1) {
        this.updateElement(elementFoundIndex, rowData)
      } else {
        this.addElement(rowData)
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
    const concatenatedData = new TableData(concatenatedProps, [], mainTableData.keyFields)
    concatenatedData.addUniqueData(mainTableData)
    concatenatedData.addUniqueData(updateTableData)
    return concatenatedData
  }
}

module.exports = {
  TableData,
}
