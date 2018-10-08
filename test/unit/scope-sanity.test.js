var Scope = require('../../');

describe('scope module', function () {
    var scope;

    beforeEach(function () {
        scope = Scope.create();
        scope.set('expect', expect); // inject expect in scope for testing
    });
    afterEach(function () {
        scope = null;
    });

    it('should create a new scope', function () {
        expect(scope instanceof Scope).to.be.ok;
    });

    it('should allow setting of globals', function (done) {
        scope.set('myGlobal', { test: 123 });
        scope.exec(`
            // expect(this).to.have.property('myGlobal');
            expect(typeof myGlobal).to.equal('object');
            expect(myGlobal).to.eql({test: 123});
        `, done);
    });

    it('should allow unsetting of globals', function (done) {
        scope.set('myGlobal', { test: 123 });

        scope.exec(`
            // expect(this).to.have.property('myGlobal');
            expect(typeof myGlobal).to.equal('object');
            expect(myGlobal).to.eql({test: 123});
        `, function (err) {
            if (err) { return done(err); }

            scope.unset('myGlobal', { test: 123 });

            scope.exec('expect(typeof myGlobal).to.equal("undefined");', done);
        });
    });

    it('should now allow unnecessary globals from showing up', function (done) {
        global.oneTestGlobal = true;
        scope.exec(`
            expect(typeof oneTestGlobal).to.equal('undefined');
        `, function (err) {
            delete global.oneTestGlobal;
            done(err);
        });
    });
});
