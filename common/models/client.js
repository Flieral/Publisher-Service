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

  client.validatesLengthOf('password', { min: 6})
  client.validatesFormatOf('password', { with: "^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z[0-9]!$%@#£€*?&]{6,}$" })
  client.validatesFormatOf('time', { with: "^[0-9]{10}$" })
  client.validatesInclusionOf('registrationCountry', { in: ['US', 'IR'] })

  //send verification email after registration
  client.afterRemote('create', function (context, userInstance, next) {
    console.log('> user.afterRemote triggered')

    var options = {
      type: 'email',
      to: userInstance.email,
      from: 'noreply@loopback.com',
      subject: 'Thanks for registering.',
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
      subject: 'Password reset',
      html: html
    }, function (err) {
      if (err) return console.log('> error sending password reset email')
      console.log('> sending password reset email to:', info.email)
    })
  })
}
