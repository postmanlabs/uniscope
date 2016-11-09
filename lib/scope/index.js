var util = require('../util'),

    UNDEF = 'undefined',
    CONSOLE = 'console',
    EVAL = 'eval',
    CODE_PREFIX = ';\n',
    CODE_SUFFIX = '\n;',
    CODE_STRICT = '"use strict";\n',
    CODE_ASYNC_FN = '__exitscope',
    ERROR_CODE_MUST_BE_STRING = 'expecting the scope\'s code to be a string',
    ERROR_VARNAME_STRING = 'expected variable name to be a string',

    /**
     * Add variables here that will be available as globals inside the scope during execition
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

Uniscope = function (options) {
    this._imports = {};
    this._options = util.isObject(options) ? options : {};
};

Uniscope.create = function (options) {
    return new Uniscope(options);
};

util.assign(Uniscope.prototype, /** @lends Uniscope.prototype */ {
    /**
     * Replace a particular global variable in the Uniscope with one of your own.
     * @memberOf Uniscope.prototype
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
     * @memberOf Uniscope.prototype
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
     * @memberOf Uniscope.prototype
     *
     * @param {[type]} code [description]
     * @param {Function} callback [description]
     *
     * @returns {[type]} [description]
     */
    exec: function (code, async, callback) {
        // allow polymorphic parameter to enable async functions
        // and validate the promary code parameter
        if (async && !callback) { callback = async; async = false; }
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
        this._options.strict && (code = CODE_STRICT + code);
        code = (CODE_PREFIX + code + CODE_SUFFIX);

        // @note IMPORTANT FOR CONTRIBUTORS
        // If you plan to edit this block of code, make sure you know what you are doing. Essentially, here we create a
        // function using the Function constructor and ensure that it is anonymous and bound to global a specific
        // context and then immediately execute the same.
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
