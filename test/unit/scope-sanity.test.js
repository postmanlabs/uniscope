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
            expect(myGlobal).to.be.an('object').that.eql({test: 123});
        `, done);
    });

    it('should allow unsetting of globals', function (done) {
        scope.set('myGlobal', { test: 123 });

        scope.exec(`
            // expect(this).to.have.property('myGlobal');
            expect(myGlobal).to.be.an('object').that.eql({test: 123});
        `, function (err) {
            if (err) { return done(err); }

            scope.unset('myGlobal', { test: 123 });

            scope.exec('expect(this.myGlobal).to.be.undefined;', done);
        });
    });

    it('should now allow unnecessary globals from showing up', function (done) {
        global.oneTestGlobal = true;
        scope.exec(`
            expect(oneTestGlobal).to.be.undefined;
            expect(this.oneTestGlobal).to.be.undefined;
        `, function (err) {
            delete global.oneTestGlobal;
            done(err);
        });
    });

    it('should handle globals with invalid identifer name', function (done) {
        global['123'] = true;
        global['a-b'] = true;
        scope.exec(`
            expect(this['123']).to.be.undefined;
            expect(this['a-b']).to.be.undefined;
        `, function (err) {
            delete global['123'];
            delete global['a-b'];
            done(err);
        });
    });

    // @todo update VALID_IDENTIFIER regular expression to support unicode identifers
    it.skip('should handle globals with unicode identifer name', function (done) {
        global.ಠ_ಠ = true;
        scope.exec(`
            expect(this.ಠ_ಠ).to.be.undefined;
            expect(ಠ_ಠ).to.be.undefined; // @fixme
        `, function (err) {
            delete global.ಠ_ಠ;
            done(err);
        });
    });
});
