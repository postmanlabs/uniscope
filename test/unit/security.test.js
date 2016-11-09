describe('scope module security', function () {
    var Scope = require('../../');

    describe('sensitive globals', function () {
        var scope;

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

    describe('execution function', function () {
        var scope;

        beforeEach(function () {
            scope = Scope.create();
            scope.set('expect', expect);
        });

        afterEach(function () {
            scope = null;
        });

        it('must not provide access to `arguments` variable', function (done) {
            scope.exec(`
                expect(typeof arguments).be('undefined');
            `, done);
        });
    });
});
