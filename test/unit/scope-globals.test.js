var Scope = require('../../');

describe('scope module globals', function () {
    var scope;

    beforeEach(function () {
        scope = Scope.create();
        scope.set('expect', expect);
    });
    afterEach(function () {
        scope = null;
    });

    it('should be limited to a known subset in context', function (done) {
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

    it('should allow setting of globals', function (done) {
        scope.set('myGlobal', { test: 123 });
        scope.exec(`
            expect(myGlobal).to.eql({ test: 123 });
        `, done);
    });

    it('should allow unsetting of globals', function (done) {
        scope.set('myGlobal', { test: 123 });
        scope.unset('myGlobal');
        scope.exec(`
            expect(this.myGlobal).to.be.undefined;
        `, done);
    });

    it('should throw error if invalid global name is set', function () {
        expect(function () {
            scope.set(null, {});
        }).to.throw();
    });

    it('should throw error if invalid global name is provided during unset', function () {
        expect(function () {
            scope.unset(null);
        }).to.throw();
    });

    it('should not set NaN to undefined if encountered within scope', function (done) {
        scope.exec(`
            var foo = NaN,
                obj = {
                    someKey: NaN
                }

            expect(foo).to.be.NaN;
            expect(obj).to.have.property('someKey').which.is.NaN;
        `, done);
    });
});
