var Scope = require('../../');

describe('scope module security', function () {

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
                expect(global).to.be.undefined;
            `, done);
        });

        it('"process" must not be visible', function (done) {
            scope.exec(`
                expect(process).to.be.undefined;
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

        it('should not provide access to `arguments` variable', function (done) {
            scope.exec(`
                expect(arguments).to.be.undefined;
            `, done);
        });
    });
});
