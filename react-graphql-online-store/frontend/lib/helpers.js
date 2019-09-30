const makeMap = arr =>
  arr.reduce((map, value) => {
    map[value] = value
    return map
  }, {})

module.exports = {
  makeMap,
}
