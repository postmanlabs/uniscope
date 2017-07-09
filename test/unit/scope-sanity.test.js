describe('scope module', function () {
    var Scope = require('../../'),
        scope;

    beforeEach(function () {
        scope = Scope.create();
        scope.set('expect', expect); // inject expect in scope for testing
    });
    afterEach(function () {
        scope = null;
    });

    it('must create a new scope', function () {
        expect(scope instanceof Scope).be.ok();
    });

    it('must allow setting of globals', function (done) {
        scope.set('myGlobal', { test: 123 });
        scope.exec(`
            // expect(this).have.property('myGlobal');
            expect(typeof myGlobal).be('object');
            expect(myGlobal).eql({test: 123});
        `, done);
    });

    it('must allow unsetting of globals', function (done) {
        scope.set('myGlobal', { test: 123 });

        scope.exec(`
            // expect(this).have.property('myGlobal');
            expect(typeof myGlobal).be('object');
            expect(myGlobal).eql({test: 123});
        `, function (err) {
                if (err) { return done(err); }

                scope.unset('myGlobal', { test: 123 });

                scope.exec('expect(typeof myGlobal).be("undefined");', done);
            });
    });

    it('must now allow unnecessary globals from showing up', function (done) {
        global.oneTestGlobal = true;
        scope.exec(`
            expect(typeof oneTestGlobal).be('undefined');
        `, function (err) {
                delete global.oneTestGlobal;
                done(err);
            });
    });
});
