# uniscope

The goal of this module is to provide a uniform execution environment to a JavaScript code between browser and NodeJS.
For example, global functions and objects in NodeJS such as `setImmediate` and `global` is not easily available to the
script. And on the other hand, browser specific global properties such as `requestAnimationFrame` and `window` is not
available as well.

## What this module does NOT do

Please read this carefully to avoid any ambiguity during adopting this module.

- This is not a module that converts NodeJS codes to browser or vice versa; that is the work of transformation tools
  such as browserify.

- This tool is not a security sandbox since, it is easy to break out from this scope. This module simply provides
  uniformity to the scripts.

## Usage

```javascript
// sample inside NodeJS
var Scope = require('scope'), // use browserify or requireJS in browser!
	myscope;

// create a new scope
myscope = new Scope(globals, { // `globals` will be `window` in browser
	eval: false, // specify whether eval is available inside sandbox
	console: false, // specify whether native console is available
	strict: false, // specify whether to run the script in strict mode
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

### Running a script that is asynchronous

An asynchronous script will require an explicit call of a global function `__exitscope`. Note that `setTimeout` and
`setInterval` are not injected by default. You can easily do it yourself.

```javascript
myscope.set('setTimeout', global.setTimeout); // inject setTimeout

// note the 2nd parameter is set to `true` for async
myscope.exec('setTimeout(function () { __exitscope(null); }, 1000)', true, function (err) {
	err ? console.error(err.stack || err) : console.log('execution complete');
});
```

### API

- `Scope.prototype.set:function(name:string, value)`
- `Scope.prototype.unset:function(name:string)`
- `Scope.prototype.import:function(obj:object)`
- `Scope.prototype.exec:function(code:string, [async:boolean,] callnack:function)`

## List of allowed Globals

These are the list of globals available to scripts in the scope

'Array', 'ArrayBuffer', 'Buffer', 'Boolean', 'DataView', 'Date', 'decodeURI', 'decodeURIComponent', 'encodeURI',
'encodeURIComponent', 'Error', 'escape', 'EvalError', 'Float32Array', 'Float64Array', 'Function', 'Infinity',
'Int8Array', 'Int16Array', 'Int32Array', 'isFinite', 'isNaN', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object',
'parseFloat', 'parseInt', 'Proxy', 'Promise', 'RangeError', 'ReferenceError', 'Reflect', 'RegExp', 'Set',
'String', 'Symbol', 'SyntaxError', 'TypeError', 'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array',
'undefined', 'unescape', 'URIError', 'WeakMap', 'WeakSet'
