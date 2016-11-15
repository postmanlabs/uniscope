var OBJECT = 'object',
    STRING = 'string',
    FUNCTION = 'function';

module.exports = {
    noop: function () {}, // eslint-disable-line no-empty-function

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
