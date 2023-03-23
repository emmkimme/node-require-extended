# node-require-extended
In our projects, we have some parts that can be distributed and integrated through npm packages or included and bundled by webpack. 
Supporting webpack would need to use some specific methods which are not implemented or supported by Node.js:
- require.context
- require.resolveWeak
- require.include
- aliases
- read an 'xml' from require (ugly implem but it works ;-)

The idea is add in Node.js these features in order to have the same source code, behaving the same with or without webpack bundl'ification. 

Node.js Implementation in typescript of the 'require.context' webpack function
https://webpack.js.org/guides/dependency-management/#requirecontext

Node.js support of alias
https://webpack.js.org/configuration/resolve/#resolve


# Installation
```Batchfile
npm install node-require-extended
```

# require.context
## Usage
The syntax is as follows:
```js
require.context(directory, useSubdirectories = false, regExp = /^\.\/.*$/, mode = 'sync')
```

Examples
```js
require.context("./test", false, /\.test\.js$/);
// a context with files from the test directory that can be required with a request endings with `.test.js`.
```
```js
require.context("../", true, /\.stories\.js$/);
// a context with all files in the parent folder and descending folders ending with `.stories.js`.
```

| Name | Type | Default | Description |
| - | - | - | - |
| `path` | [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | *none (required)* | Specifies the path to look for modules in. |
| `recursive` | [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) | `true` | If true, will recurse through subdirectorys in path. |
| `regExp` | [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) | `/^\.\/.*$/` | Specifies a filter that files must match. |
| `mode` | [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | `sync` |  'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once'. |

## Setup
In order to add the 'context' function, we need to enhance the current 'require' of the module, you have to call this function before any usage of require.resolve

```js
import { InjectRequireContext } from 'node-require-extended';

InjectRequireContext(require);

```

# require alias
Inspired from https://www.npmjs.com/package/better-module-alias

```js
const constants = require("@@common/constants.js");
```

package.json
```json
"_moduleAliases": {
    "@common": "lib/statics/common"
}
```

We tried different kind of prefixes and ended with '@@'

| Prefix | pifall |
| - | - |
| $ | if use in 'scripts' section of the package.json, considered on Mac/Linux as a var env ! |
| ~ | already an alias for Max/Linux to Home directory |
| @ | may conflict with NPM private package prefixed with a @ |
| ! | does not work with webpack as used for loader syntax |


## Setup

```js
import { InjectRequireAlias } from 'node-require-extended';

InjectRequireAlias(dirname, {
    '@common': "lib/statics/common"
});

```

## Performance
We redirect the module loading in order to check if the path contains an alias. It may have a performance impact.  
Would suggest to activate the feature as late as possible. The alias search is optimized in order to search first the common pattern to all your aliases (in our case '@@') rather than testing each alias one by one.


# Webpack
We suggest to surround some method calls by '{ /* webpack_ignore_start */' / '/* webpack_ignore_end */ }' comments. In order to skip them when webpack generate the bundle.  
/!\ notice the '{' and '}' usage in comment in order to workaround TypeScript limitation: https://github.com/microsoft/TypeScript/issues/32813

``` js
{ /* webpack_ignore_start */
InjectRequireContext(require);
InjectRequireAlias(__dirname, {
    '@@config-manager-ui': 'ui'
});
/* webpack_ignore_end */ }
```


You have to keep your comment in the transpiled TypeScript code 
``` json
{
    "compilerOptions": {
        "removeComments": false,

```

``` 
npm install --save-dev webpack-strip-block
```

``` js
const packageJson = require('./package.json')
 
const webpackConfig = {
  // ...
    resolve: {
        alias: {
        ...packageJson._moduleAliases,
        },
    },
  // ...
    rules: [
        {
            test: /\.js$/,
            enforce: 'pre',
            use: [
                {
                    loader: 'webpack-strip-block',
                    options: {
                        start: 'webpack_ignore_start',
                        end: 'webpack_ignore_end'
                    }
                }
            ]
        },
    }
  // ...
```

# MIT License

Copyright (c) 2023 Emmanuel Kimmerlin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.