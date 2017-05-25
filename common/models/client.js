var config = require('../../server/config.json')
var path = require('path')
var utility = require('../../public/utility.js')
var app = require('../../server/server')
var roleManager = require('../../public/roleManager')

var PRODUCTION = false

var methodDisabler = require('../../public/methodDisabler.js')
var relationMethodPrefixes = [
  'createChangeStream',
  'upsertWithWhere',
  'patchOrCreate',
  'exists',
  'prototype.patchAttributes'
]

var countryList = require('../../config/country.json')
var statusJson = require('../../config/status.json')
var accountType = require('../../config/accountType.json')

module.exports = function (client) {

  methodDisabler.disableOnlyTheseMethods(client, relationMethodPrefixes)

  client.validatesLengthOf('password', {min: 6})
  client.validatesInclusionOf('registrationCountry', {in: countryList})

  // Decrypt Password for Front/Back Communications
  client.beforeRemote('login', function (ctx, modelInstance, next) {
    if (PRODUCTION) {
      var pass1 = utility.base64Decoding(ctx.args.credentials.password).toString()
      var pass2 = utility.base64Decoding(ctx.req.body.password).toString()
      ctx.args.credentials.password = pass1
      ctx.req.body.password = pass2
    }
    if (ctx.args.credentials.email || ctx.req.body.email) {
      ctx.args.credentials.email = ctx.args.credentials.email.toLowerCase()
      ctx.req.body.email = ctx.req.body.email.toLowerCase()
    }
    return next()
  })

  client.afterRemote('login', function (ctx, modelInstance, next) {
    roleManager.getRolesById(app, modelInstance.userId, function (err, result) {
      if (err)
        return next(err)
      if (result.roles.length == 0) {
        client.findById(modelInstance.userId, function (err, result) {
          if (err)
            throw err
          if (result.clientType.indexOf('Publisher') <= -1) {
            var oldSet = []
            oldSet = result.clientType
            oldSet.push('Publisher')
            result.updateAttribute('clientType', oldSet, function (err, response) {
              if (err)
                throw err
              return next()
            })        
          }
          else        
            return next()
        })
      }
      else 
        return next()
    })
  })

  client.beforeRemote('create', function (ctx, modelInstance, next) {
    if (PRODUCTION) {
      var pass1 = utility.base64Decoding(ctx.args.data.password).toString()
      var pass2 = utility.base64Decoding(ctx.req.body.password).toString()
      ctx.args.data.password = pass1
      ctx.req.body.password = pass2
    }
    var whiteList = ['companyName', 'email', 'username', 'password', 'time', 'registrationCountry', 'registrationIPAddress']
    if (!utility.inputChecker(ctx.args.data, whiteList))
      return next(new Error('White List Error! Allowed Parameters: ' + whiteList.toString()))
    else {
      ctx.args.data.email = ctx.args.data.email.toLowerCase()
      ctx.args.data.announcerAccountModel = {}
      ctx.args.data.announcerAccountModel.budget = 0
      ctx.args.data.announcerAccountModel.type = accountType.free
      ctx.args.data.publisherAccountModel = {}
      ctx.args.data.publisherAccountModel.credit = 0
      ctx.args.data.publisherAccountModel.type = accountType.free
      ctx.args.data.clientType = []
      return next()
    }
  })

  client.beforeRemote('changePassword', function (ctx, modelInstance, next) {
    if (PRODUCTION) {
      var pass1 = utility.base64Decoding(ctx.args.data.password).toString()
      var pass2 = utility.base64Decoding(ctx.req.body.password).toString()
      var conf1 = utility.base64Decoding(ctx.args.data.confirmation).toString()
      var conf2 = utility.base64Decoding(ctx.req.body.confirmation).toString()
      ctx.args.data.password = pass1
      ctx.req.body.password = pass2
      ctx.args.data.confirmation = conf1
      ctx.req.body.confirmation = conf2
    }
    next()
  })

  client.beforeRemote('prototype.__update__publisherAccount', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    client.findById(ctx.req.params.id, function (err, result) {
      if (err)
        throw err
      // Fix Chain
      return next()
    })
  })

  client.beforeRemote('prototype.__create__applications', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    var whiteList = ['name', 'operatingSystem']
    if (!utility.inputChecker(ctx.args.data, whiteList))
      return next(new Error('White List Error! Allowed Parameters: ' + whiteList.toString()))
    else {
      ctx.args.data.credit = 0
      ctx.args.data.clientId = ctx.args.options.accessToken.userId
      ctx.args.data.status = statusJson.enable
      ctx.args.data.message = 'Application is Enabled'
      return next()
    }
  })

  client.beforeRemote('prototype.__updateById__applications', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    var whiteList = ['name', 'status']
    if (!utility.inputChecker(ctx.args.data, whiteList))
      return next(new Error('White List Error! Allowed Parameters: ' + whiteList.toString()))
    else {
      if (ctx.args.data.status) {
        if (ctx.args.data.status === statusJson.enable) {
          ctx.args.data.status = statusJson.enable
          ctx.args.data.message = 'Application is Enabled'
          return next()
        }
        else if (ctx.args.data.status === statusJson.disable) {
          ctx.args.data.status = statusJson.disable
          ctx.args.data.message = 'Application is Disabed'
          return next()
        }
      }
    }
  })
  
  client.afterRemote('prototype.__updateById__applications', function (ctx, modelInstance, next) {
    if (ctx.args.data.status) {
      if (ctx.args.data.status === statusJson.disable) {
        var placement = app.models.placement
        placement.find({ where: { 'applicationId': ctx.req.params.fk } }, function (err, placementList) {
          if (err)
            throw err
          var fire = 1
          var callbackFired = false
          for (var i = 0; i < placementList.length; i++) {
            callbackFired = true
            var appPlacement = placementList[i]
            appPlacement.updateAttribute('status', statusJson.disable, function (err, response) {
              if (err)
                throw err
              fire++
              if (fire == placementList.length)
                return next()  
            })
          }
          if (callbackFired == false)
            next()  
        })
      }
      else
        next()  
    }
    else 
      next()  
  })

  client.beforeRemote('replaceById', function (ctx, modelInstance, next) {
    var whilteList = ['companyName']
    if (utility.inputChecker(ctx.args.data, whilteList))
      next()
    else
      next(new Error('White List Error! Allowed Parameters: ' + whilteList.toString()))
  })

  // Change Password Remote Method 
  client.changePassword = function (data, req, res, cb) {
    if (!req.accessToken)
      return res.sendStatus(401)

    //verify passwords match
    if (!req.body.password || !req.body.confirmation ||
      req.body.password !== req.body.confirmation) {
      return res.sendStatus(400, new Error('Passwords do not match'))
    }

    client.findById(req.accessToken.userId, function (err, user) {
      if (err) return res.sendStatus(404)
      user.updateAttribute('password', req.body.password, function (err, user) {
        if (err) return res.sendStatus(404)
        console.log('> password reset processed successfully');
        res.render('response', {
          title: 'Password reset success',
          content: 'Your password has been reset successfully',
          redirectTo: '/',
          redirectToLinkText: 'Log in'
        })
      })
    })
  }

  client.remoteMethod('changePassword', {
    accepts: [{
      arg: 'data',
      type: 'object',
      http: {
        source: 'body'
      }
    }, {
      arg: 'req',
      type: 'object',
      http: {
        source: 'req'
      }
    }, {
      arg: 'res',
      type: 'object',
      http: {
        source: 'res'
      }
    }],
    description: 'change password method with accessToken',
    http: {
      path: '/changePassword',
      verb: 'POST',
      status: 200,
      errorStatus: 400
    },
    returns: {
      arg: 'response',
      type: 'string'
    }
  })

  //send verification email after registration
  client.afterRemote('create', function (context, userInstance, next1) {
    var options = {
      type: 'email',
      to: userInstance.email,
      from: 'noreply@Flieral.com',
      subject: 'Thanks for Registering.',
      user: client
    }

    userInstance.verify(options, function (err, response, next) {
      if (err) return next1(err)

      console.log('> verification email sent:', response)

      context.res.render('response', {
        title: 'Signed up successfully',
        content: 'Please check your email and click on the verification link before logging in.',
        redirectTo: '/',
        redirectToLinkText: 'Log in'
      })
    })
  })

  //send password reset link when requested
  client.on('resetPasswordRequest', function (info) {
    var url = 'http://' + config.host + ':' + config.port + '/reset-password'
    var html = 'Click <a href="' + url + '?access_token=' +
      info.accessToken.id + '">here</a> to reset your password'

    client.app.models.Email.send({
      to: info.email,
      from: info.email,
      subject: 'Password Reset',
      html: html
    }, function (err) {
      if (err) return next(err)
    })
  })
}
