var methodDisabler = require('../../public/methodDisabler.js')
var relationMethodPrefixes = [
  'login',
  'logout'
]

module.exports = function (app) {
  var User = app.models.User
  var Role = app.models.Role
  var RoleMapping = app.models.RoleMapping

  var users = [{
      username: 'MrWooJ',
      email: 'hurricanc@gmail.com',
      password: 'Fl13r4lAlirezaPass'
    },
    {
      username: 'Mohammad4x',
      email: 'm.ferdosi94@gmail.com',
      password: 'Fl13r4lMohammadPass'
    },
    {
      username: 'Support',
      email: 'support@flieral.com',
      password: 'Fl13r4lSupportPass'
    }
  ]

  User.create(users, function (err, users) {
    if (err)
      throw err

    var role1 = {
      name: 'Founder'
    }
    Role.create(role1, function (err, role) {
      if (err)
        throw err
      role.principals.create({
        principalType: RoleMapping.USER,
        principalId: users[0].id
      }, function (err, principal) {
        if (err)
          throw err
      })
      role.principals.create({
        principalType: RoleMapping.USER,
        principalId: users[1].id
      }, function (err, principal) {
        if (err)
          throw err
      })
    })

    var role2 = {
      name: 'Admin'
    }
    Role.create(role2, function (err, role) {
      if (err)
        throw err
      role.principals.create({
        principalType: RoleMapping.USER,
        principalId: users[2].id
      }, function (err, principal) {
        if (err)
          throw err
      })
    })
  })

  methodDisabler.disableAllExcept(User, relationMethodPrefixes)
}
