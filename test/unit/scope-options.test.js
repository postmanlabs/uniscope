const expect = require('chai').expect,
    Scope = require('../../');

describe('scope module options', function () {
    it('should allow script execution in strict mode', function (done) {
        var scope = Scope.create({ strict: true });

        scope.exec(`a = 1 + 2;`, function (err) { // eslint-disable-line quotes
            expect(err).to.be.an('error');
            done();
        });
    });

    it('should not forward console if the option is not set', function (done) {
        var scope = Scope.create({}, { expect }); // no options specified

        scope.exec(`expect(console).to.be.undefined;`, done); // eslint-disable-line quotes
    });

    it('should not forward console if the option is set to false', function (done) {
        var scope = Scope.create({ console: false }, { expect }); // specified as false

        scope.exec(`expect(console).to.be.undefined;`, done); // eslint-disable-line quotes
    });

    it('should forward native console when configured', function (done) {
        var scope = Scope.create({ console: true }, { expect });

        scope.exec(`expect(console).to.be.an('object');`, done); // eslint-disable-line quotes
    });

    it('should ensure that the console forwarded is native one', function (done) {
        var scope = Scope.create({
            console: true
        }, {
            expect: expect,
            refConsole: console
        });

        scope.exec(`
            expect(console).to.be.an('object');
            expect(console).to.equal(refConsole);
        `, done);
    });

    it('should ensure that blocked variables are not allowed', function (done) {
        var scope = Scope.create({
            console: true,
            block: ['Buffer', 'myImportedGlobal']
        }, {
            expect: expect,
            myImportedGlobal: {}
        });

        scope.exec(`
            expect(Buffer).to.be.undefined;
            expect(myImportedGlobal).to.be.undefined;
        `, done);
    });
});
