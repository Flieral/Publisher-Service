var osList = require('../../config/operatingSystem.json')

module.exports = function (publisher) {
  
  publisher.validatesInclusionOf('operatingSystem', { in: osList })

  publisher.beforeRemote('prototype.__create__placements', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    ctx.args.data.minCredit = 0
    ctx.args.data.clientId = ctx.args.options.accessToken.userId
    next()
  })

  publisher.beforeRemote('prototype.__updateById__placements', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    ctx.args.data.clientId = ctx.args.options.accessToken.userId
    next()
  })
}
