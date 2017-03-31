var placementStyle = require('../../config/placementStyle.json')

module.exports = function (placement) {

  placement.validatesInclusionOf('style', { in: placementStyle })

  placement.beforeRemote('prototype.__create__setting', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    ctx.args.data.clientId = ctx.args.options.accessToken.userId
    next()
  })

  placement.beforeRemote('prototype.__updateById__update', function (ctx, modelInstance, next) {
    if (!ctx.args.options.accessToken)
      return next()
    ctx.args.data.clientId = ctx.args.options.accessToken.userId
    next()
  })
}
