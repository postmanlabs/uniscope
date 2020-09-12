var util = require('./util'),

    CONSOLE = 'console',
    EVAL = 'eval',
    CODE_PREFIX = ';var arguments = undefined;\n', // security
    CODE_SUFFIX = '\n;',
    CODE_STRICT = '"use strict";\n',
    CODE_ASYNC_FN = '__exitscope',
    ERROR_CODE_MUST_BE_STRING = 'expecting the scope\'s code to be a string',
    ERROR_VARNAME_STRING = 'expected variable name to be a string',
    ERROR_CALLBACK_MISSING = 'missing callback function',
    ERROR_SCOPE_INTEGRITY = 'failing scope integrity',
    VALID_IDENTIFIER_RE = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/,

    /**
     * Add variables here that will be available as globals inside the scope during execution
     * @private
     * @type {Array}
     */
    allowedGlobals = require('./allowed-globals'),

    /**
     * Get global object based on what is available
     * @private
     */
    getContextObject = require('./get-context-object'),

    // constructor
    Uniscope;

/**
 * Configuration options for  Uniscope
 *
 * @typedef Uniscope~options
 *
 * @property {Boolean=false} [eval] Specify whether eval is available inside sandbox
 * @property {Boolean=false} [strict] Specify whether to run the script in strict mode
 * @property {Boolean=false} [console] When set to true, the native `console` object is available inside the scope
 *
 * @property {Array=} [ignore] Specify a set of global variables that will not be allowed to trickle in
 * @property {Array=} [blocked] Specify a set of global variables that will not be allowed to trickle in
 */

/**
 * Create a scope object which accepts a JS code as string and then ensures that the accessible globals are limited to
 * a specified subset.
 *
 * @constructor
 *
 * @param {Uniscope~options=} [options] Options to configure the script executions inside the scope.
 * @param {Object=} imports
 * @param {Array=} ignores
 * @param {Array=} blocked
 *
 * @see {@link Scope.create}
 */
Uniscope = function (options, imports, ignores, blocked) {
    !util.isObject(options) && (options = {});

    util.assign(this, util.cloneObject(options, {
        _imports: {},
        _locals: [],
        _context: getContextObject(),
        ignore: ignores,
        block: blocked
    }, true));

    // do some validations
    this.ignore = Array.isArray(this.ignore) ? this.ignore.slice() : [];
    this.block = Array.isArray(this.block) ? this.block.slice() : [];

    // process construction imports
    util.isObject(imports) && this.import(imports);
};

util.assign(Uniscope, /** @lends Uniscope */ {
    /**
     * Create a new scope. This is a handy helper function for those who do not prefer the `new` operator!
     *
     * @see Uniscope
     *
     * @param {Uniscope~options} options
     * @param {Object=} [imports]
     * @return {Uniscope}
     *
     * @see {@link Uniscope}
     *
     * @example
     * var Scope = require('scope'), // use browserify or requireJS in browser!
     *     myscope;
     *
     * // create a new scope
     * myscope = Scope.create(globals, { // `globals` will be `window` in browser
     *     strict: true, // specify whether to run the script in strict mode
     * }, { // provide an object with globals to be made available to the scripts
     *     myGlobalVarName: "sample"
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
     * Resets the scope.
     *
     * @param {Boolean} [locals]
     * @param {Boolean} [context]
     */
    reset: function (locals, context) {
        for (var prop in this._imports) {
            if (this._imports.hasOwnProperty(prop)) {
                delete this._imports[prop];
            }
        }

        locals && (this._locals.length = 0);
        context && (this._context = getContextObject());
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

        var universe = this._context,
            globals = Object.getOwnPropertyNames(universe),
            context = {},
            transferables = [],
            ignored = this.ignore.slice(),
            blocked = this.block.slice();

        // add console and eval to their respective injection points
        !this._imports.hasOwnProperty(CONSOLE) && (this.console ? ignored : blocked).push(CONSOLE);
        !this._imports.hasOwnProperty(EVAL) && (this.eval ? ignored : blocked).push(EVAL);


        // ensure any missing entry from allowed globals are tracked too
        util.forEach(allowedGlobals, function (key) {
            (globals.indexOf(key) === -1) && globals.push(key);
        });

        // now add the transferable values from allowedGlobals
        for (var i = 0, key; i < globals.length; i++) { // eslint-disable-line one-var
            key = globals[i];

            // globals are passed as anonymous function's arguments so any invalid
            // identifier (like `global['a-b']`) passed in the argument list will
            // crash the execution. Because we are not adding them to our context
            // object, these ignored globals won't be accessible.
            // But, an identifier name may have unicode characters as well (like `ಠ_ಠ`)
            // which will be globally available.
            // @todo add support for Unicode identifier names
            if (!VALID_IDENTIFIER_RE.test(key)) {
                globals.splice(i, 1);
                // since key at this index was removed, retry from the same index
                i--; continue;
            }

            if (allowedGlobals.indexOf(key) > -1) {
                transferables[i] = universe[key];
                context[key] = transferables[i];
            }
            // the ones that are not in allowed globals, set them to undefined
            else {
                transferables[i] = undefined;
                context.hasOwnProperty(key) && (delete context[key]);
            }
        }

        // based on Uniscope configuration, the globals that we should pass through is left untouched
        util.forEach(ignored.concat(this._locals), function (key) {
            var position = globals.indexOf(key);
            if (position > -1) {
                globals.splice(position, 1);
                transferables.splice(position, 1);
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

        // based on Uniscope configuration, the globals that we block are specifically set to undefined
        util.forEach(blocked, function (key) {
            var position = globals.indexOf(key);
            (position === -1) && (position = globals.length);

            globals[position] = key;
            transferables[position] = undefined;
            context.hasOwnProperty(key) && (delete context[key]);
        });

        // we do a final integrity check
        if (globals.length !== transferables.length) {
            return callback(new Error(ERROR_SCOPE_INTEGRITY + [globals.length, transferables.length].join(', ')));
        }

        // prepare the code by wrapping it within accurate prefix and suffix
        // @todo fix 'use strict'; code generation
        code = (CODE_PREFIX + code + CODE_SUFFIX);
        this.strict && (code = CODE_STRICT + code);

        // @note IMPORTANT FOR CONTRIBUTORS
        // If you plan to edit this block of code, make sure you know what you are doing. Essentially, here we create a
        // function using the Function constructor and ensure that it is anonymous and bound to global a specific
        // context and then immediately execute the same.
        // One additional note is that the function to trigger `__exitscope` should not be put in `context`
        try {
            // create a dynamic function bound to the context and execute with the transferables and in async
            // flow, forward the callback as global function (not needed to be injected in context.)
            (0, Function.apply(context, globals.concat(CODE_ASYNC_FN, code))) // eslint-disable-line no-new-func
                // if code is not supposed to be async, just do nothing in `__exitscope` function
                .apply(context, transferables.concat(function () {
                    // we update the locals post execution (@note that this is duplicated for sync calls)
                    util.threeWayDiff(globals, Object.getOwnPropertyNames(getContextObject()), this._locals);
                    async && callback.apply(context, arguments);
                }.bind(this)));
        }
        catch (e) {
            return callback(e);
        }

        // execute final callback only when code is not async
        if (!async) {
            // we update the locals post execution (@note that this is duplicated for async calls)
            util.threeWayDiff(globals, Object.getOwnPropertyNames(getContextObject()), this._locals);
            return callback();
        }
    }
});

module.exports = Uniscope;
