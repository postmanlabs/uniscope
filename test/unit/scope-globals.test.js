describe('scope module globals', function () {
    var Scope = require('../../'),
        scope;

    beforeEach(function () {
        scope = Scope.create();
        scope.set('expect', expect);
    });
    afterEach(function () {
        scope = null;
    });

    it('must be limited to a known subset in context', function (done) {
        scope.exec(`
            var availableGlobals = Object.getOwnPropertyNames(this).sort();
            expect(availableGlobals).eql(['Array', 'ArrayBuffer', 'Buffer', 'Boolean', 'DataView', 'Date', 'decodeURI',
                'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'Error', 'escape', 'EvalError', 'Float32Array',
                'Float64Array', 'Function', 'Infinity', 'Int8Array', 'Int16Array', 'Int32Array', 'isFinite', 'isNaN',
                'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object', 'parseFloat', 'parseInt', 'Proxy', 'Promise',
                'RangeError', 'ReferenceError', 'Reflect', 'RegExp', 'Set', 'String', 'Symbol', 'SyntaxError',
                'TypeError', 'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'undefined', 'unescape',
                'URIError', 'WeakMap', 'WeakSet',

                'expect' // special for test
            ].sort())
        `, done);
    });
});
