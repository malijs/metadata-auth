# mali-metadata-auth

Mali metadata authorization middleware

[![npm version](https://img.shields.io/npm/v/mali-metadata-auth.svg?style=flat-square)](https://www.npmjs.com/package/malie-metadata-auth)
[![build status](https://img.shields.io/travis/malijs/metadata-auth/master.svg?style=flat-square)](https://travis-ci.org/malijs/metadata-auth)

## API Reference

<a name="module_mali-metadata-auth"></a>

### mali-metadata-auth
Mali authorization metadata middleware.
If the call has metadata with "authorization" string property the specified function is called


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Options</code> |  |
| options.error | <code>String</code> | optional string for error to throw in case authorization is not present                               Default: <code>"Not authorized"</code> |
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
