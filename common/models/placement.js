var placementStyle = require('../../config/placementStyle.json')
var categoryList = require('../../config/category.json')
var countryList = require('../../config/country.json')
var userLabelList = require('../../config/userLabel.json')
var priorityList = require('../../config/priority.json')
var utility = require('../../public/utility.js')

var app = require('../../server/server')

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

  placement.additiveChain = function (placementHashID, applicationHashID, accountHashID, additiveValue, cb) {
    var application = app.models.application
    var publisherAccount = app.models.publisherAccount
    var addition = 0
    placement.findById(placementHashID, function (err, placementInst) {
      if (err)
        return cb(err)
      addition = placementInst.minCredit + additiveValue
      placementInst.updateAttribute('minCredit', addition, function (err, response) {
        if (err)
          return cb(err)
        application.findById(applicationHashID, function (err, applicationInst) {
          if (err)
            return cb(err)
          addition = applicationInst.credit + additiveValue
          applicationInst.updateAttribute('credit', addition, function (err, response) {
            if (err)
              return cb(err)
            publisherAccount.findById(accountHashID, function (err, accountInst) {
              if (err)
                return cb(err)
              addition = accountInst.credit + additiveValue
              accountInst.updateAttribute('credit', addition, function (err, response) {
                if (err)
                  return cb(err)
                return cb(null, 'successful addition chain')
              })
            })
          })
        })
      })
    })
  }

  placement.remoteMethod('additiveChain', {
    accepts: [{
      arg: 'placementHashID',
      type: 'string',
      required: true,
      http: {
        source: 'query'
      }
    }, {
      arg: 'applicationHashID',
      type: 'string',
      required: true,
      http: {
        source: 'query'
      }
    }, {
      arg: 'accountHashID',
      type: 'string',
      required: true,
      http: {
        source: 'query'
      }
    }, {
      arg: 'additiveValue',
      type: 'number',
      required: true,
      http: {
        source: 'query'
      }
    }],
    description: 'add additiveValue to particular chain of placement and its publisher and its own account',
    http: {
      path: '/additiveChain',
      verb: 'POST',
      status: 200,
      errorStatus: 400
    },
    returns: {
      arg: 'response',
      type: 'object'
    }
  })

}
