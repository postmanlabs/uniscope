describe('scope module locals', function () {
    var Scope = require('../../'),
        scope;

    beforeEach(function () {
        scope = Scope.create();
        scope.set('expect', expect);
    });
    afterEach(function () {
        scope = null;
    });

    it('must retain locally set globals in subsequent calls', function (done) {
        scope.exec(`
            expect(typeof userSetGlobal).be('undefined');
            userSetGlobal = true;
        `, function (err) {
                if (err) { return done(err); }

                scope.exec('expect(userSetGlobal).be(true);', done);
            });
    });
});
