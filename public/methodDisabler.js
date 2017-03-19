var columnify = require('columnify')
var columnsOptins = {
  showHeaders: false,
  minWidth: 35,
  columnSplitter: ' |    '
}

function reportDisabledMethod(model, methods) {
  const joinedMethods = methods.join(', ')
  const modelName = 'Disabled Remote Model ' + model.sharedClass.name
  var data = {}
  data[modelName] = joinedMethods
  if (methods.length)
    console.log(columnify(data, columnsOptins))
}

module.exports = {
  /**
   * Options for methodsToDisable:
   * @param model
   * @param methodsToDisable array
   */
  disableOnlyTheseMethods(model, methodsToDisable) {
    methodsToDisable.forEach(function (method) {
      model.disableRemoteMethodByName(method)
    })
    reportDisabledMethod(model, methodsToDisable)
  }
}
