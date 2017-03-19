'use strict'

var methodDisabler = require('../../public/methodDisabler.js')
var relationMethodPrefixes = [
  'createChangeStream',
  'upsertWithWhere',
  'patchOrCreate',
  'prototype.patchAttributes'
]

module.exports = function (publisher) {
  methodDisabler.disableOnlyTheseMethods(publisher, relationMethodPrefixes)
}
