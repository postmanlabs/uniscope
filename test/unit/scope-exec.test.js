describe('scope module exec', function () {
    var Scope = require('../../'),
        scope;

    beforeEach(function () {
        scope = Scope.create();
        scope.set('expect', expect);
    });
    afterEach(function () {
        scope = null;
    });

    it('must be able to execute a simple script', function (done) {
        scope.exec(`var a = 1 + 2;`, done); // eslint-disable-line quotes
    });

    it('must throw error when callback is missing', function () {
        expect(scope.exec.bind(scope)).withArgs('var a = 1 + 2;').to.throwError();
    });

    it('must throw error when code is missing', function (done) {
        scope.exec(null, function (err) {
            expect(err).be.ok();
            done();
        });
    });
});
