const expect = require('chai').expect,
    Scope = require('../../');

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
            expect(this.oneTestGlobal).to.be.undefined;
        `, function (err) {
            delete global.oneTestGlobal;
            done(err);
        });
    });

    it('should add all allowed globals even if it\'s missing in the global scope', function (done) {
        var WeakSet = global.WeakSet;

        delete global.WeakSet;

        scope.exec(`
            expect(this).to.have.property('WeakSet').that.is.undefined;
        `, function (err) {
            global.WeakSet = WeakSet;
            done(err);
        });
    });
});
