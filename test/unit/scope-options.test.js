/* eslint-disable quotes */
const expect = require('chai').expect,
    Scope = require('../../');

describe('scope module options', function () {
    it('should allow script execution in strict mode', function (done) {
        var scope = Scope.create({ strict: true });

        scope.exec('a = 1 + 2;', function (err) {
            expect(err).to.be.an('error');
            done();
        });
    });

    it('should not forward eval if the option is not set', function (done) {
        var scope = Scope.create({}, { expect }); // no options specified

        scope.exec('expect(eval).to.be.undefined;', done);
    });

    it('should not forward eval if the option is set to false', function (done) {
        var scope = Scope.create({ eval: false }, { expect }); // specified as false

        scope.exec('expect(eval).to.be.undefined;', done);
    });

    it('should forward eval when configured', function (done) {
        var scope = Scope.create({ eval: true }, { expect });

        scope.exec('expect(eval).to.be.an("function");', done);
    });

    it('should not forward console if the option is not set', function (done) {
        var scope = Scope.create({}, { expect }); // no options specified

        scope.exec('expect(console).to.be.undefined;', done);
    });

    it('should not forward console if the option is set to false', function (done) {
        var scope = Scope.create({ console: false }, { expect }); // specified as false

        scope.exec('expect(console).to.be.undefined;', done);
    });

    it('should ensure that the console forwarded is native one', function (done) {
        var scope = Scope.create({
            console: true
        }, {
            expect: expect,
            refConsole: console
        });

        scope.exec('expect(console).to.equal(refConsole);', done);
    });

    it('should ensure that blocked variables are not allowed', function (done) {
        var scope = Scope.create({
            console: true,
            block: ['Buffer', 'myImportedGlobal', 'undefinedGlobal']
        }, {
            expect: expect,
            myImportedGlobal: {}
        });

        scope.exec(`
            expect(Buffer).to.be.undefined;
            expect(myImportedGlobal).to.be.undefined;
            expect(undefinedGlobal).to.be.undefined;
        `, done);
    });
});
