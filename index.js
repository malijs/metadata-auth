/**
 * Mali authorization metadata middleware.
 * If the call has metadata with "authorization" string property the specified function is called
 * @module mali-metadata-auth
 *
 * @param  {Options} options
 * @param  {String} options.error optional string for error to throw in case authorization is not present
 *                               Default: <code>"Not authorized"</code>
 * @param  {Function} fn The middleware function to execute
 *
 * @example
 * const auth = require('mali-metadata-auth')
 *
 * app.use(auth(async (authValue, ctx, next) => {
 *   console.log(authValue)
 *   await next()
 * })
 */
module.exports = function (options, fn) {
  if (typeof options === 'function') {
    fn = options
    options = {}
  }

  if (typeof options.error !== 'string' || !options.error) {
    options.error = 'Not Authorized'
  }

  return function auth (ctx, next) {
    if (!ctx.metadata) throw new Error(options.error)

    const keys = Object.keys(ctx.metadata)
    if (!keys.length) throw new Error(options.error)

    const key = keys.find(k => k.toLowerCase() === 'authorization')
    if (!key) throw new Error(options.error)
    return fn(ctx.metadata[key], ctx, next)
  }
}
