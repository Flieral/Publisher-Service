var accountType = require('../../config/accountType.json')

module.exports = function (publisherAccount) {
  publisherAccount.validatesInclusionOf('type', {in: accountType})
}
