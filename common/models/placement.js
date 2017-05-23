var placementStyle = require('../../config/placementStyle.json')
var categoryList = require('../../config/category.json')
var countryList = require('../../config/country.json')
var userLabelList = require('../../config/userLabel.json')
var priorityList = require('../../config/priority.json')
var utility = require('../../public/utility.js')

module.exports = function (placement) {

  placement.validatesInclusionOf('style', { in: placementStyle })
  placement.validatesInclusionOf('priority', { in: priorityList })

  function settingValidator (data, callback) {
    var whiteList = ['category', 'dayParting', 'preferences', 'userLabel', 'country']
    if (utility.inputChecker(data, whiteList)) {
      if (!utility.JSONIterator(data.category, categoryList))
        return callback(new Error('category Validation Error'), null)
      if (!utility.JSONIterator(data.userLabel, userLabelList))
        return callback(new Error('userLabel Validation Error'), null)
      if (!utility.JSONIterator(data.country, countryList))
        return callback(new Error('country Validation Error'), null)
      return callback(null, 'validated successfully')
    }
    else  
      return callback(new Error('White List Error! Allowed Parameters: ' + whiteList.toString()), null)
  }

  placement.beforeRemote('prototype.__create__setting', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    settingValidator(ctx.args.data, function (err, result) {
      if (err)
        return next(err)
      ctx.args.data.clientId = ctx.args.options.accessToken.userId
      return next()
    })
  })

  placement.beforeRemote('prototype.__update__setting', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    settingValidator(ctx.args.data, function (err, result) {
      if (err)
        return next(err)
      return next()
    })
  })
}
