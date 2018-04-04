var allowedGlobals = require('./allowed-globals'),
    UNDEF = 'undefined',
    cache;

/**
 * Get global object based on what is available.
 *
 * @private
 */
module.exports = function () {
    if (typeof global !== UNDEF && global !== null && global.Array) {
        return global;
    }

    if (typeof window !== UNDEF && window !== null && window.Array) {
        return window;
    }

    // now that the global and window is not present, we load them by creating functions
    // since that is expensive, we cache it
    if (cache) { return cache; }
    cache = {};

    allowedGlobals.forEach(function (prop) {
        var value = Function('return (typeof ' + // eslint-disable-line no-new-func
            prop + ' !== "undefined") ? ' + prop + ' : undefined')();
        value && (cache[prop] = value);
    });

    return cache;
};
