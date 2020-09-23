# Uniscope [![Build Status](https://travis-ci.org/postmanlabs/uniscope.svg?branch=develop)](https://travis-ci.org/postmanlabs/uniscope) [![codecov](https://codecov.io/gh/postmanlabs/uniscope/branch/develop/graph/badge.svg)](https://codecov.io/gh/postmanlabs/uniscope)

The goal of this module is to provide a uniform execution environment to a JavaScript code between browser and NodeJS.<br/>
For example, global functions and objects in NodeJS such as `setImmediate` and `global` are not easily available to the script. And on the other hand, browser-specific global properties such as `requestAnimationFrame` and `window` is not available as well.

## Installation
Uniscope can be installed using NPM or directly from the git repository within your NodeJS projects. If installing from NPM, the following command installs the module and saves in your `package.json`

```console
$ npm install uniscope --save
```

## What this module does NOT do

Please read this carefully to avoid any ambiguity during adopting this module.

- This is not a module that converts NodeJS codes to browser or vice versa; that is the work of transformation tools such as browserify.
- This tool is not a security sandbox since it is easy to break out from this scope. This module simply provides uniformity to the scripts.

## Usage

```javascript
// sample inside NodeJS
let Scope = require('uniscope'), // use browserify or requireJS in browser!
    myscope;

// create a new scope
myscope = new Scope({
    eval: false, // specify whether eval is available inside sandbox
    console: false, // specify whether native console is available
    strict: false, // specify whether to run the script in strict mode
    ignore: ['require'], // specify a list of global variables to ignore and pass-through to the script
    block: ['process'] // specify a list of variables that should be blocked from being accessed
}, { // provide an object with globals to be made available to the scripts
    myGlobalVarName: "sample"
});

// set a specific variable as global
myscope.set('logger', function (msg) {
    console.log(msg);
});

// now run a script
myscope.exec('logger(myGlobalVarName)', function (err) {
    err ? console.error(err.stack || err) : console.log('execution complete');
});
```

### Running an asynchronous script

An asynchronous script will require an explicit call of a global function `__exitscope`. Note that `setTimeout` and `setInterval` are not injected by default. You can easily do it yourself.

```javascript
myscope.set('setTimeout', global.setTimeout); // inject setTimeout

// note the 2nd parameter is set to `true` for async
myscope.exec('setTimeout(function () { __exitscope(null); }, 1000)', true, function (err) {
    err ? console.error(err.stack || err) : console.log('execution complete');
});
```

## List of allowed Globals

These are the list of globals available to scripts in the scope

```json
[
    "Array",          "ArrayBuffer",        "Atomics",
    "BigInt",         "BigInt64Array",      "BigUint64Array",
    "Boolean",        "DataView",           "Date",
    "Error",          "EvalError",          "Float32Array",
    "Float64Array",   "Function",           "Infinity",
    "Int16Array",     "Int32Array",         "Int8Array",
    "JSON",           "Map",                "Math",
    "NaN",            "Number",             "Object",
    "Promise",        "Proxy",              "RangeError",
    "ReferenceError", "Reflect",            "RegExp",
    "Set",            "SharedArrayBuffer",  "String",
    "Symbol",         "SyntaxError",        "TypeError",
    "URIError",       "Uint16Array",        "Uint32Array",
    "Uint8Array",     "Uint8ClampedArray",  "WeakMap",
    "WeakSet",        "decodeURI",          "decodeURIComponent",
    "encodeURI",      "encodeURIComponent", "escape",
    "isFinite",       "isNaN",              "parseFloat",
    "parseInt",       "undefined",          "unescape"
]
```
