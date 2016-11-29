var OBJECT = 'object',
    STRING = 'string',
    FUNCTION = 'function';

module.exports = {
    noop: function () {}, // eslint-disable-line no-empty-function

    cloneObject: function (obj, defaults, defaultUndefined) {
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
            obj.hasOwnProperty(prop) && (clone[prop] = obj[prop]);
        }

        // nothing to set as defaults, so we simply exit
        if (typeof defaults !== OBJECT) {
            return clone;
        }

        // set defaults
        // fork code path on top to ease loop performance
        if (defaultUndefined) {
            for (prop in defaults) { // eslint-disable-line guard-for-in
                defaults.hasOwnProperty(prop) && (clone[prop] === undefined) && (clone[prop] = defaults[prop]);
            }
        }
        else if (!defaultUndefined) {
            for (prop in defaults) { // eslint-disable-line guard-for-in
                defaults.hasOwnProperty(prop) && !clone.hasOwnProperty(prop) && (clone[prop] = defaults[prop]);
            }
        }

        return clone;
    },

    isObject: function (subject) {
        return (typeof subject === OBJECT);
    },

    isString: function (subject) {
        return (typeof subject === STRING);
    },

    isFunction: function (subject) {
        return (typeof subject === FUNCTION);
    },

    forEach: function (arr, iter) {
        arr.forEach(iter);
    },

    forOwn: function (obj, iter) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                iter(obj[prop], prop);
            }
        }
    },

    assign: function (target, items) {
        for (var prop in items) {
            if (items.hasOwnProperty(prop)) {
                target[prop] = items[prop];
            }
        }
    },

    sealback: function (callback) {
        var sealed = false;
        return function () {
            return sealed ? undefined : ((sealed = true), callback.apply(this, arguments));
        };
    }
};
