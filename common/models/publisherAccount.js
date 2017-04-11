var accountType = require('../../config/accountType.json')

module.exports = function (publisherAccount) {
  var accountTypeList = []
  for (var key in accountType) 
    accountTypeList.push(accountType[key])
  
  announcerAccount.validatesInclusionOf('type', {in: accountTypeList})
}
