var OBJECT = 'object',
    STRING = 'string',
    FUNCTION = 'function';

module.exports = {
    has (source, target) {
        return Object.prototype.hasOwnProperty.call(source, target);
    },

    /* istanbul ignore next */
    cloneObject (obj, defaults, defaultUndefined) {
        var clone = {},
            prop;

        if (typeof obj !== OBJECT) {
            if (typeof defaults === OBJECT) {
                obj = defaults;
                defaults = null;
            }
            // both obj and defaults are invalid, return blank object
            else { return clone; }
        }

        for (prop in obj) { // eslint-disable-line guard-for-in
            this.has(obj, prop) && (clone[prop] = obj[prop]);
        }

        // nothing to set as defaults, so we simply exit
        if (typeof defaults !== OBJECT) {
            return clone;
        }

        // set defaults
        // fork code path on top to ease loop performance
        if (defaultUndefined) {
            for (prop in defaults) { // eslint-disable-line guard-for-in
                this.has(defaults, prop) && (clone[prop] === undefined) && (clone[prop] = defaults[prop]);
            }
        }
        else if (!defaultUndefined) {
            for (prop in defaults) { // eslint-disable-line guard-for-in
                this.has(defaults, prop) && !this.has(clone, prop) && (clone[prop] = defaults[prop]);
            }
        }

        return clone;
    },

    isObject (subject) {
        return (typeof subject === OBJECT);
    },

    isString (subject) {
        return (typeof subject === STRING);
    },

    isFunction (subject) {
        return (typeof subject === FUNCTION);
    },

    forEach (arr, iter) {
        arr.forEach(iter);
    },

    forOwn (obj, iter) {
        for (var prop in obj) {
            /* istanbul ignore else */
            if (this.has(obj, prop)) {
                iter(obj[prop], prop);
            }
        }
    },

    assign (target, items) {
        for (var prop in items) {
            /* istanbul ignore else */
            if (this.has(items, prop)) {
                target[prop] = items[prop];
            }
        }
    },

    sealback (callback) {
        var sealed = false;

        return function () {
            /* istanbul ignore next */
            return sealed ? undefined : ((sealed = true), callback.apply(this, arguments));
        };
    },

    threeWayDiff (target, source, changes) {
        var i,
            ii;

        for (i = 0, ii = source.length; i < ii; i++) {
            if (target.indexOf(source[i]) + changes.indexOf(source[i]) === -2) {
                changes.push(source[i]);
            }
        }
    }
};
