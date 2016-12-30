# mali-metadata-auth

Mali metadata authorization middleware

[![npm version](https://img.shields.io/npm/v/mali-metadata-auth.svg?style=flat-square)](https://www.npmjs.com/package/mali-metadata-auth)
[![build status](https://img.shields.io/travis/malijs/metadata-auth/master.svg?style=flat-square)](https://travis-ci.org/malijs/metadata-auth)

## API Reference

<a name="module_mali-metadata-auth"></a>

### mali-metadata-auth
Mali authorization metadata middleware.
If the call has metadata with "authorization" string property the specified function is called


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Options</code> |  |
| options.error | <code>String</code> &#124; <code>Object</code> &#124; <code>function</code> | optional Error creation options.                                                If <code>String</code> the message for Error to throw in case                                                authorization is not present.                                                If <code>Object</code> the error options with <code>message</code>,                                                <code>code</code>, and <code>metadata</code> properties. See <code>create-grpc-error</code>                                                module.                                                If <code>Function</code> a function with signature <code>(ctx)</code>                                                called to create an error. Must return an <code>Error</code> instanse.                                                Default: <code>"Not Authorized"</code> |
| fn | <code>function</code> | The middleware function to execute |

**Example**  

```js
const auth = require('mali-metadata-auth')

app.use(auth(async (authValue, ctx, next) => {
  console.log(authValue)
  await next()
})
```

## License

  Apache-2.0
