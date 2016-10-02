describe('scope module security', function () {
    describe('sensitive globals', function () {
        var Scope = require('../../'),
            scope;

        beforeEach(function () {
            scope = Scope.create();
            scope.set('expect', expect);
        });

        afterEach(function () {
            scope = null;
        });

        it('"global" must not be visible', function (done) {
            scope.exec(`
                expect(typeof global).be('undefined');
                expect(this.global).be(undefined);
            `, done);
        });

        it('"process" must not be visible', function (done) {
            scope.exec(`
                expect(typeof process).be('undefined');
                expect(this.process).be(undefined);
            `, done);
        });
    });
});
