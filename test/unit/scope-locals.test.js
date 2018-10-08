var Scope = require('../../');

describe('scope module locals', function () {
    var scope;

    beforeEach(function () {
        scope = Scope.create();
        scope.set('expect', expect);
    });
    afterEach(function () {
        scope = null;
    });

    it('should retain locally set globals in subsequent calls', function (done) {
        scope.exec(`
            expect(typeof userSetGlobal).to.equal('undefined');
            userSetGlobal = true;
        `, function (err) {
            if (err) { return done(err); }

            scope.exec('expect(userSetGlobal).to.be.true;', done);
        });
    });
});
