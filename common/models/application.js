var osList = require('../../config/operatingSystem.json')
var statusConfig = require('../../config/status.json')
var app = require('../../server/server')
var utility = require('../../public/utility.js')
var categoryList = require('../../config/category.json')
var countryList = require('../../config/country.json')
var userLabelList = require('../../config/userLabel.json')

module.exports = function (application) {

  application.validatesInclusionOf('operatingSystem', { in: osList
  })
  var statusList = []
  for (var key in statusConfig)
    statusList.push(statusConfig[key])
  application.validatesInclusionOf('status', { in: statusList
  })

  application.beforeRemote('prototype.__create__placements', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    var whiteList = ['beginningTime', 'endingTime', 'name', 'style', 'status', 'onlineCapacity', 'offlineCapacity', 'priority']
    if (utility.inputChecker(ctx.args.data, whiteList)) {
      application.findById(ctx.req.params.id, function (err, result) {
        if (err)
          return next(err)
        ctx.args.data.clientId = ctx.args.options.accessToken.userId
        ctx.args.data.applicationId = ctx.req.params.id
        ctx.args.data.minCredit = 0
        ctx.args.data.status = result.status
        var settingToCreate = {
          category: categoryList,
          country: countryList,
          userLabel: userLabelList
        }
        ctx.args.data.settingModel = settingToCreate
        if (ctx.args.data.beginningTime < utility.getUnixTimeStamp())
          return next(new Error('Beginning Time Can not be Less than Now'))
        if (ctx.args.data.endingTime - ctx.args.data.beginningTime < 86400000)
          return next(new Error('Duration Problem'))
        return next()
      })
    } else
      return next(new Error('White List Error! Allowed Parameters: ' + whiteList.toString()))
  })

  application.beforeRemote('prototype.__updateById__placements', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    var whiteList = ['beginningTime', 'endingTime', 'name', 'style', 'status', 'onlineCapacity', 'offlineCapacity', 'priority']
    if (utility.inputChecker(ctx.args.data, whiteList)) {
      var placement = app.models.placement
      placement.findById(ctx.req.params.fk, function (err, response) {
        if (err)
          return next(err)
        if (ctx.args.data.endingTime && ctx.args.data.beginningTime) {
          if (ctx.args.data.beginningTime < utility.getUnixTimeStamp())
            return next(new Error('Beginning Time Can not be Less than Now'))
          if ((ctx.args.data.endingTime - ctx.args.data.beginningTime < 86400000) || (ctx.args.data.endingTime < utility.getUnixTimeStamp()))
            return next(new Error('Ending Time Can not be Less than Now Or Duration Problem'))
        }

        if (!ctx.args.data.endingTime && ctx.args.data.beginningTime) {
          if (ctx.args.data.beginningTime < utility.getUnixTimeStamp())
            return next(new Error('Beginning Time Can not be Less than Now'))
          if (response.endingTime - ctx.args.data.beginningTime < 86400000)
            return next(new Error('Duration Problem'))
        }

        if (ctx.args.data.endingTime && !ctx.args.data.beginningTime) {
          if (ctx.args.data.endingTime < utility.getUnixTimeStamp())
            return next(new Error('Ending Time Can not be Less than Now'))
          if (ctx.args.data.endingTime - response.beginningTime < 86400000)
            return next(new Error('Duration Problem'))
        }
        next()
      })
    } else
      return next(new Error('White List Error! Allowed Parameters: ' + whiteList.toString()))
  })
}
