const { AbstractRowKey } = require('./abstract-key')

class TableRowKey extends AbstractRowKey {
  /**
   *
   * @param {string[]} propNames
   * @param {string[]} data
   * @param {string} mainField
   */
  constructor(propNames, data, mainField) {
    super()
    this.propNames = propNames
    this.data = data
    this.mainField = mainField
  }

  /**
   * @param {TableRowKey} key
   */
  equals(key) {
    for (let index = 0; index < this.propNames.length; index++) {
      const prop = this.propNames[index]
      const firstKeyValue = this.data[index]
      const secondKeyValue = key.data[index]
      // if some of key values is not equal keys are not equal
      if (firstKeyValue !== secondKeyValue) {
        return false
      }
      // fields cannot be equal if main key is missing (email address for google)
      if (prop === this.mainField && (firstKeyValue === '' || secondKeyValue === '')) {
        return false
      }
    }
    return true
  }
}

module.exports = { TableRowKey }
