var placementStyle = require('../../config/placementStyle.json')
var categoryList = require('../../config/category.json')
var countryList = require('../../config/country.json')
var userLabelList = require('../../config/userLabel.json')

module.exports = function (placement) {

  placement.validatesInclusionOf('style', { in: placementStyle })

  var settingValidator = function (data, callback) {
    var whiteList = ['category', 'dayParting', 'preferences', 'userLabel', 'country']
    if (utility.inputChecker(data, whiteList)) {
      if (!utility.JSONIterator(data.category, categoryList))
        callback(new Error('category Validation Error'), null)
      if (!utility.JSONIterator(data.userLabel, userLabelList))
        callback(new Error('userLabel Validation Error'), null)
      if (!utility.JSONIterator(data.country, countryList))
        callback(new Error('country Validation Error'), null)
      callback(null, 'validated successfully')
    }
    else
      return next(new Error('White List Error! Allowed Parameters: ' + whiteList.toString()))    
  }

  placement.beforeRemote('prototype.__create__setting', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    ctx.args.data.clientId = ctx.args.options.accessToken.userId
    settingValidator(ctx.args.data, function (err, result) {
      if (err)
        return next(err)
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
