var config = require('../../server/config.json')
var path = require('path')

var methodDisabler = require('../../public/methodDisabler.js')
var relationMethodPrefixes = [
  'createChangeStream',
  'upsertWithWhere',
  'patchOrCreate',
]

module.exports = function (client) {

  methodDisabler.disableOnlyTheseMethods(client, relationMethodPrefixes)

  client.validatesLengthOf('password', {
    min: 6
  })
  client.validatesInclusionOf('registrationCountry', { in: ['US', 'IR']
  })

  //send verification email after registration
  client.afterRemote('create', function (context, userInstance, next) {
    var options = {
      type: 'email',
      to: userInstance.email,
      from: 'noreply@Flieral.com',
      subject: 'Thanks for Registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: client
    }

    userInstance.verify(options, function (err, response, next) {
      if (err) return next(err)

      console.log('> verification email sent:', response)

      context.res.render('response', {
        title: 'Signed up successfully',
        content: 'Please check your email and click on the verification link ' -
          'before logging in.',
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
