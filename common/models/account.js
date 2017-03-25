var methodDisabler = require('../../public/methodDisabler.js')
var relationMethodPrefixes = [
  'createChangeStream',
  'upsertWithWhere',
  'patchOrCreate',
  'prototype.patchAttributes'
]

module.exports = function (account) {
  methodDisabler.disableOnlyTheseMethods(account, relationMethodPrefixes)
}
