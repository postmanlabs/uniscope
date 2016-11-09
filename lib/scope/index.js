var util = require('../util'),

    UNDEF = 'undefined',
    CONSOLE = 'console',
    EVAL = 'eval',
    CODE_PREFIX = ';var arguments = undefined;\n', // security
    CODE_SUFFIX = '\n;',
    CODE_STRICT = '"use strict";\n',
    CODE_ASYNC_FN = '__exitscope',
    ERROR_CODE_MUST_BE_STRING = 'expecting the scope\'s code to be a string',
    ERROR_VARNAME_STRING = 'expected variable name to be a string',
    ERROR_CALLBACK_MISSING = 'missing callback function',

    /**
     * Add variables here that will be available as globals inside the scope during execution
     * @private
     * @type {Array}
     */
    allowedGlobals = [
        'Array', 'ArrayBuffer', 'Buffer', 'Boolean', 'DataView', 'Date', 'decodeURI', 'decodeURIComponent', 'encodeURI',
        'encodeURIComponent', 'Error', 'escape', 'EvalError', 'Float32Array', 'Float64Array', 'Function', 'Infinity',
        'Int8Array', 'Int16Array', 'Int32Array', 'isFinite', 'isNaN', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object',
        'parseFloat', 'parseInt', 'Proxy', 'Promise', 'RangeError', 'ReferenceError', 'Reflect', 'RegExp', 'Set',
        'String', 'Symbol', 'SyntaxError', 'TypeError', 'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array',
        'undefined', 'unescape', 'URIError', 'WeakMap', 'WeakSet'
    ],

    Uniscope;

/**
 * Configuration options for  Uniscope
 *
 * @typedef Uniscope~options
 *
 * @property {Object=} [options] Options to configure the script executions inside the scope.
 * @property {Boolean=false} [eval] Specify whether eval is available inside sandbox
 * @property {Boolean=false} [strict] Specify whether to run the script in strict mode
 * @property {Boolean=false} [console] When set to true, the native `console` object is available inside the scope
 */

/**
 * Create a scope object which accepts a JS code as string and then ensures that the accessible globals are limited to
 * a specified subset.
 * @constructor
 *
 * @param {Uniscope~options=} [options] Options to configure the script executions inside the scope.
 * @param {Object=} imports
 *
 * @example
 * var Scope = require('scope'), // use browserify or requireJS in browser!
 *     myscope;
 *
 * // create a new scope
 * myscope = new Scope(globals, { // `globals` will be `window` in browser
 *     strict: true, // specify whether to run the script in strict mode
 *
 *     // provide an object with globals to be made available to the scripts
 *     import: {
 *         myGlobalVarName: "sample"
 *     }
 * });
 *
 * // set a specific variable as global
 * myscope.set('logger', function (msg) {
 *     console.log(msg);
 * });
 *
 * // now run a script
 * myscope.exec('logger(myGlobalVarName)', function (err) {
 *     err ? console.error(err.stack || err) : console.log('execution complete');
 * });
 */
Uniscope = function (options, imports) {
    this._imports = {};
    this._options = util.isObject(options) ? options : {};

    // process construction imports
    util.isObject(imports) && this.import(imports);
};

util.assign(Uniscope, /** @lends Uniscope */ {
    /**
     * Create a new scope. This is a handy helper function for those who do not prefer the `new` operator!
     * @see Uniscope
     *
     * @param {Uniscope~options}
     * @param {Object=} [imports]
     * @return {Uniscope}
     */
    create: function (options, imports) {
        return new Uniscope(options, imports);
    }
});

util.assign(Uniscope.prototype, /** @lends Uniscope.prototype */ {
    /**
     * Replace a particular global variable in the Uniscope with one of your own.
     *
     * @param {String} varname
     * @param {*} value
     */
    set: function (varname, value) {
        // ensure at this point that the variable name is a string
        if (!util.isString(varname)) { throw new TypeError(ERROR_VARNAME_STRING); }
        this._imports[varname] = value;
    },

    /**
     * Removes a global variable that has been custom set previously
     *
     * @param {String} varname
     */
    unset: function (varname) {
        // ensure at this point that the variable name is a string
        if (!util.isString(varname)) { throw new TypeError(ERROR_VARNAME_STRING); }
        this._imports.hasOwnProperty(varname) && (delete this._imports[varname]);
    },

    /**
     * Replace a set of variables in the Uniscope's context with values provided as parameter
     *
     * @param {Object} variables
     */
    import: function (variables) {
        for (var prop in variables) {
            if (variables.hasOwnProperty(prop)) {
                this.set(prop, variables[prop]);
            }
        }
    },

    /**
     * Executes a string within a protected Uniscope of controlled set of globals
     *
     * @param {String} code
     * @param {Boolean=} [async=false]
     * @param {Function} callback
     */
    exec: function (code, async, callback) {
        // allow polymorphic parameter to enable async functions
        // and validate the promary code parameter
        if (async && !callback) { callback = async; async = false; }
        if (!util.isFunction(callback)) { throw new Error(ERROR_CALLBACK_MISSING); }
        if (!util.isString(code)) { return callback(new TypeError(ERROR_CODE_MUST_BE_STRING)); }

        callback = util.sealback(callback); // ensure callback is allowed once only

        var universe = typeof window === UNDEF ? (global || {}) : window,
            globals = Object.getOwnPropertyNames(universe),
            context = {},
            transferables = [],
            ignored = [];

        this._options.console && ignored.push(CONSOLE);
        this._options.eval && ignored.push(EVAL);

        // based on Uniscope configuration, the globals that we should pass through is left untouched
        util.forEach(ignored, function (key) {
            var position = globals.indexOf(key);
            (position > -1) && globals.splice(position, 1);
        });

        // ensure any missing entry from allowed globals are tracked too
        util.forEach(allowedGlobals, function (key) {
            (globals.indexOf(key) === -1) && globals.push(key);
        });

        // now add the transferable values from allowedGlobals
        util.forEach(globals, function (key, index) {
            if (allowedGlobals.indexOf(key) > -1) {
                transferables[index] = universe[key];
                context[key] = transferables[index];
            }
        });

        // now set the custom overrides
        util.forOwn(this._imports, function (value, key) {
            // in case the var is already in globals, then we need to replace, else add a new one
            var index = globals.indexOf(key);
            (index === -1) && (index = globals.length);

            globals[index] = key;
            transferables[index] = value;
            context[key] = value;
        });

        // prepare the code by wrapping it within accurate prefix and suffix
        // @todo fix 'use strict'; code generation
        code = (CODE_PREFIX + code + CODE_SUFFIX);
        this._options.strict && (code = CODE_STRICT + code);

        // @note IMPORTANT FOR CONTRIBUTORS
        // If you plan to edit this block of code, make sure you know what you are doing. Essentially, here we create a
        // function using the Function constructor and ensure that it is anonymous and bound to global a specific
        // context and then immediately execute the same.
        // One additional note is that the function to trigger `__exitscope` should not be put in `context`
        try {
            // create a dynamic function bound to the context and execute with the transferables and in async
            // flow, forward the callback as global function (not needed to be injected in context.)
            (0, Function.apply(context, globals.concat(CODE_ASYNC_FN, code)))
                // if code is not supposed to be async, just append a dummy `__exitUniscope` function
                .apply(context, transferables.concat(async ? callback : util.noop));
        }
        catch (e) {
            return callback(e);
        }

        // execute final callback only when code is not async
        !async && callback();
    }
});

module.exports = Uniscope;
