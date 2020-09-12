/* istanbul ignore file */
const UNDEF = 'undefined';

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

    if (typeof self !== UNDEF && self !== null && self.Array) {
        return self;
    }

    // Get context object using the Function constructor because its created in
    // the global scope and not closures to the creation context.
    return Function('return this')(); // eslint-disable-line no-new-func
};
