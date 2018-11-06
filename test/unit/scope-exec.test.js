var Scope = require('../../');

describe('scope module exec', function () {
    var scope;

    beforeEach(function () {
        scope = Scope.create();
        scope.set('expect', expect);
    });
    afterEach(function () {
        scope = null;
    });

    it('should be able to execute a simple script', function (done) {
        scope.exec(`var a = 1 + 2;`, done); // eslint-disable-line quotes
    });

    it('should throw error when callback is missing', function () {
        expect(function () {
            scope.exec.bind(scope)('var a = 1 + 2;');
        }).to.throw();
    });

    it('should throw error when code is missing', function (done) {
        scope.exec(null, function (err) {
            expect(err).to.be.an('error');
            done();
        });
    });
});
