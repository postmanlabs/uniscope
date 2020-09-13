const util = require('./util'),

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

    /**
     * Add variables here that will be available as globals inside the scope during execution.
     *
     * @private
     * @type {Array}
     */
    allowedGlobals = require('./allowed-globals'),

    /**
     * Get global object based on what is available.
     *
     * @private
     * @type {Object}
     */
    getContextObject = require('./get-context-object');

/**
 * Configuration options for  Uniscope.
 *
 * @typedef Uniscope.options
 *
 * @property {Boolean} [eval=false] Specify whether eval is available inside sandbox
 * @property {Boolean} [strict=false] Specify whether to run the script in strict mode
 * @property {Boolean} [console=false] When set to true, the native `console` object is available inside the scope
 *
 * @property {String[]} [ignore] Specify a set of global variables that will not be allowed to trickle in
 * @property {String[]} [blocked] Specify a set of global variables that will not be allowed to trickle in
 */

/**
 * Uniscope allows one to evaluate a code within a controlled environment.
 */
class Uniscope {
    /**
     * Create a scope object which accepts a JS code as string and then ensures
     * that the accessible globals are limited to a specified subset.
     *
     * @param {Uniscope.options} [options] Options to configure the script executions inside the scope
     * @param {Object} [imports] Import variables in the context with the given value
     */
    constructor (options, imports) {
        !util.isObject(options) && (options = {});

        this._locals = [];
        this._imports = {};
        this._context = getContextObject();

        this.eval = Boolean(options.eval);
        this.strict = Boolean(options.strict);
        this.console = Boolean(options.console);

        this.ignore = Array.isArray(options.ignore) ? options.ignore.slice() : [];
        this.block = Array.isArray(options.block) ? options.block.slice() : [];

        // process construction imports
        util.isObject(imports) && this.import(imports);
    }

    /**
     * Create a new scope.
     * This is a handy helper function for those who do not prefer the `new` operator!
     *
     * @param {Uniscope.options} [options] Options to configure the script executions inside the scope
     * @param {Object} [imports] Import variables in the context with the given value
     * @returns {Uniscope}
     *
     * @example
     * let Scope = require('uniscope'), // use browserify or requireJS in browser!
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
    static create (options, imports) {
        return new Uniscope(options, imports);
    }

    /**
     * Replace a particular global variable in the Uniscope with one of your own.
     *
     * @param {String} varname Variable name or identifier
     * @param {*} value Value which will be assigned to the variable
     */
    set (varname, value) {
        // ensure at this point that the variable name is a string
        if (!util.isString(varname)) { throw new TypeError(ERROR_VARNAME_STRING); }
        this._imports[varname] = value;
    }

    /**
     * Removes a global variable that has been custom set previously
     *
     * @param {String} varname Variable name or identifier
     */
    unset (varname) {
        // ensure at this point that the variable name is a string
        if (!util.isString(varname)) { throw new TypeError(ERROR_VARNAME_STRING); }
        util.has(this._imports, varname) && (delete this._imports[varname]);
    }

    /**
     * Replace a set of variables in the Uniscope's context with values provided as parameter.
     *
     * @param {Object} variables Import variables in the context with the given value
     */
    import (variables) {
        for (let prop in variables) {
            /* istanbul ignore else */
            if (util.has(variables, prop)) {
                this.set(prop, variables[prop]);
            }
        }
    }

    /**
     * Resets the scope.
     *
     * @param {Boolean} [locals] Reset locals
     * @param {Boolean} [context] Reset context
     */
    reset (locals, context) {
        for (let prop in this._imports) {
            /* istanbul ignore else */
            if (util.has(this._imports, prop)) {
                delete this._imports[prop];
            }
        }

        locals && (this._locals.length = 0);
        context && (this._context = getContextObject());
    }

    /**
     * Executes a string within a protected Uniscope of controlled set of globals.
     *
     * @param {String} code A string representing a JavaScript expression, statement, or sequence of statements
     * @param {Boolean} [async=false] When set to true, callback will be called when `__exitscope` is triggered
     * @param {Function} callback Callback function to be called at the end of execution
     */
    exec (code, async, callback) {
        // allow polymorphic parameter to enable async functions
        // and validate the primary code parameter
        if (async && !callback) {
            callback = async;
            async = false;
        }

        if (!util.isFunction(callback)) { throw new Error(ERROR_CALLBACK_MISSING); }
        if (!util.isString(code)) { return callback(new TypeError(ERROR_CODE_MUST_BE_STRING)); }

        callback = util.sealback(callback); // ensure callback is allowed once only

        let universe = this._context,
            globals = Object.getOwnPropertyNames(universe),
            context = {},
            transferables = [],
            ignored = this.ignore.slice(),
            blocked = this.block.slice();

        // add console and eval to their respective injection points
        !util.has(this._imports, CONSOLE) && (this.console ? ignored : blocked).push(CONSOLE);
        !util.has(this._imports, EVAL) && (this.eval ? ignored : blocked).push(EVAL);


        // ensure any missing entry from allowed globals are tracked too
        util.forEach(allowedGlobals, (key) => {
            // eslint-disable-next-line lodash/prefer-includes
            (globals.indexOf(key) === -1) && globals.push(key);
        });

        // now add the transferable values from allowedGlobals
        util.forEach(globals, (key, index) => {
            // eslint-disable-next-line lodash/prefer-includes
            if (allowedGlobals.indexOf(key) > -1) {
                transferables[index] = universe[key];
                context[key] = transferables[index];
            }
            // the ones that are not in allowed globals, set them to undefined
            else {
                transferables[index] = undefined;
                /* istanbul ignore next */
                util.has(context, key) && (delete context[key]);
            }
        });

        // based on Uniscope configuration, the globals that we should pass through is left untouched
        util.forEach(ignored.concat(this._locals), (key) => {
            const position = globals.indexOf(key);

            if (position > -1) {
                globals.splice(position, 1);
                transferables.splice(position, 1);
            }
        });

        // now set the custom overrides
        util.forOwn(this._imports, (value, key) => {
            // in case the var is already in globals, then we need to replace, else add a new one
            let index = globals.indexOf(key);

            (index === -1) && (index = globals.length);

            globals[index] = key;
            transferables[index] = value;
            context[key] = value;
        });

        // based on Uniscope configuration, the globals that we block are specifically set to undefined
        util.forEach(blocked, (key) => {
            let position = globals.indexOf(key);

            (position === -1) && (position = globals.length);

            globals[position] = key;
            transferables[position] = undefined;
            util.has(context, key) && (delete context[key]);
        });

        // we do a final integrity check
        /* istanbul ignore if */
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
}

module.exports = Uniscope;
