var app = require('../../server/server')

module.exports = {
  sendEmail: function (from, to, subject, html) {
    app.models.Email.send({
      to: to,
      from: from,
      subject: subject,
      html: html
    }, function (err) {
      if (err)
        console.error(err)
    })
  }
}
