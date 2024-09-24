module.exports = {
    has (source, target) {
        return Object.hasOwn(source, target);
    },

    isObject (subject) {
        return (typeof subject === 'object' && subject !== null);
    },

    isString (subject) {
        return (typeof subject === 'string');
    },

    isFunction (subject) {
        return (typeof subject === 'function');
    },

    forEach (arr, iter) {
        arr.forEach(iter);
    },

    forOwn (obj, iter) {
        for (let prop in obj) {
            /* istanbul ignore else */
            if (this.has(obj, prop)) {
                iter(obj[prop], prop);
            }
        }
    },

    sealback (callback) {
        let sealed = false;

        return function () {
            /* istanbul ignore next */
            return sealed ? undefined : ((sealed = true), callback.apply(this, arguments));
        };
    },

    threeWayDiff (target, source, changes) {
        for (let i = 0, ii = source.length; i < ii; i++) {
            if (target.indexOf(source[i]) + changes.indexOf(source[i]) === -2) {
                changes.push(source[i]);
            }
        }
    }
};
