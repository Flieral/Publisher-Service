var methodDisabler = require('../../public/methodDisabler.js')
var relationMethodPrefixes = [
  'createChangeStream',
  'upsertWithWhere',
  'patchOrCreate',
  'exists',
  'prototype.patchAttributes'
]

module.exports = function (placement) {
  methodDisabler.disableOnlyTheseMethods(placement, relationMethodPrefixes)
}
