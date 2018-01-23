const create = require('grpc-create-error')

/**
 * Mali authorization metadata middleware.
 * If the call has metadata with "authorization" string property the specified function is called
 * @module mali-metadata-auth
 *
 * @param  {Options} options
 * @param  {String|Object|Function} options.error optional Error creation options.
 *                                                If <code>String</code> the message for Error to throw in case
 *                                                authorization is not present.
 *                                                If <code>Object</code> the error options with <code>message</code>,
 *                                                <code>code</code>, and <code>metadata</code> properties. See <code>create-grpc-error</code>
 *                                                module.
 *                                                If <code>Function</code> a function with signature <code>(ctx)</code>
 *                                                called to create an error. Must return an <code>Error</code> instanse.
 *                                                Default: <code>"Not Authorized"</code>
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

  let errFn = errorGenerator
  if (typeof options.error === 'string') {
    errFn = () => errorGenerator(options.error)
  } else if (typeof options.error === 'object') {
    errFn = () => create(options.error.message || 'Not Authorized', options.error.code, options.error.metadata)
  } else if (typeof options.error === 'function') {
    errFn = options.error
  }

  return function auth (ctx, next) {
    if (!ctx.metadata) throw errFn()

    const keys = Object.keys(ctx.metadata)
    if (!keys.length) throw errFn()

    const key = keys.find(k => k.toLowerCase() === 'authorization')
    if (!key) throw errFn()
    return fn(ctx.metadata[key], ctx, next)
  }
}

function errorGenerator (message) {
  return new Error(message || 'Not Authorized')
}
