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

    it('must allow setting of globals', function (done) {
        scope.set('myGlobal', { test: 123 });
        scope.exec(`
            expect(myGlobal).eql({ test: 123 });
        `, done);
    });

    it('must allow unsetting of globals', function (done) {
        scope.set('myGlobal', { test: 123 });
        scope.unset('myGlobal');
        scope.exec(`
            expect(typeof myGlobal).be('undefined');
        `, done);
    });

    it('must throw error if invalid global name is set', function () {
        expect(function () {
            scope.set(null, {});
        }).to.throwError();
    });

    it('must throw error if invalid global name is provided during unset', function () {
        expect(function () {
            scope.unset(null);
        }).to.throwError();
    });

    it('must not set NaN to undefined if encountered within scope', function (done) {
        scope.exec(`
            var foo = NaN,
                obj = {
                    someKey: NaN
                }

            expect(Number.isNaN(foo)).to.be(true);
            expect(Number.isNaN(obj.someKey)).to.be(true);
        `, done);
    });
});
