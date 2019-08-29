class AbstractRowKey {
  constructor() {
    if (new.target === AbstractRowKey) {
      throw new TypeError('Cannot construct AbstractRowKey instances directly')
    }
  }

  /**
   *
   * @param {AbstractRowKey} key
   * @returns {boolean}
   */
  equals(key) {
    return key.data === key.data
  }
}

module.exports = { AbstractRowKey }
