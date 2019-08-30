class RowData {
  /**
   *
   * @param {string[]} props row values
   * @param {string[]} propNames property names of row values
   * @param {string[]} keyFieldNames property names of columns that are key
   * @param {string} uniqueIdentifier unique identifier for row
   */
  constructor(props, propNames, keyFieldNames, uniqueIdentifier) {
    this.props = props
    this.propNames = propNames
    this.keyFieldNames = keyFieldNames
    this.keyFields = this.props.filter((value, index) => this.keyFieldNames.includes(this.propNames[index]))
    this.uniqueIdentifier = uniqueIdentifier
  }
}

module.exports = { RowData }
