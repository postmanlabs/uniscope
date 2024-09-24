const expect = require('chai').expect,
    Scope = require('../../');

// upgrading mocha 6->8 leaked this global variable in browser context
// since these global property names are set as our anonymous function's arguments,
// and having an identifier with `-` crashes the .exec so, just delete it!
// possible fix: https://github.com/postmanlabs/uniscope/pull/408
delete global['__core-js_shared__'];

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
        scope.exec('var a = 1 + 2;', done); // eslint-disable-line quotes
    });

    it('should throw error when callback is missing', function () {
        expect(function () {
            scope.exec.bind(scope)('var a = 1 + 2;');
        }).to.throw('missing callback function');
    });

    it('should throw error when code is missing', function (done) {
        scope.exec(null, function (err) {
            expect(err).to.be.an('error');
            expect(err.message).to.equal('expecting the scope\'s code to be a string');
            done();
        });
    });

    it('should be able to execute asynchronous script', function (done) {
        scope.set('setTimeout', global.setTimeout);
        scope.exec(`
            setTimeout(__exitscope, 100);
        `, true, function (err) {
            scope.unset('setTimeout');
            done(err);
        });
    });

    it('should be able to execute multiple concurrent executions', function (done) {
        scope.set('execution_1', function () {
            scope.exec(`
                expect(a).to.equal(1);
                a = 2;
                b = 2;

                execution_1_1();
            `, function (err) {
                expect(err, 'error in execution_1').to.be.undefined;
            });
        });

        scope.set('execution_1_1', function () {
            scope.exec(`
                expect(a).to.equal(2);
                expect(b).to.equal(2);
                a = 3;
                b = 3;
                c = 3;
            `, function (err) {
                expect(err, 'error in execution_1_1').to.be.undefined;
            });
        });

        scope.set('execution_2', function () {
            scope.exec(`
                expect(a).to.equal(3);
                expect(b).to.equal(3);
                expect(c).to.equal(3);
                a = 4;
                b = 4;
                c = 4;
                d = 4;
            `, function (err) {
                expect(err, 'error in execution_2').to.be.undefined;
            });
        });

        scope.exec(`
            a = 1;

            execution_1();
            expect(a).to.equal(3);
            expect(b).to.equal(3);
            expect(c).to.equal(3);

            execution_2();
            expect(a).to.equal(4);
            expect(b).to.equal(4);
            expect(c).to.equal(4);
            expect(d).to.equal(4);
        `, done);
    });

    it('should allow blocking globals in specific executions', function (done) {
        scope.set('myGlobal', 'my_global');

        scope.set('blockedExecution', function () {
            scope.exec(`
                expect(myGlobal).to.equal(undefined);
                unblockedExecution(); // call execution from inside the blocked scope
                try {
                    Function('return myGlobal')();
                    throw new Error('myGlobal is not blocked');
                } catch (e) {
                    expect(e).to.be.an('error');
                    expect(e.message).to.equal('myGlobal is not defined');
                }
            `, { block: ['myGlobal'] }, function (err) {
                expect(err, 'error in blockedExecution').to.be.undefined;
            });
        });

        scope.set('unblockedExecution', function () {
            scope.exec(`
                expect(myGlobal).to.equal('my_global');
            `, function (err) {
                expect(err, 'error in unblockedExecution').to.be.undefined;
            });
        });

        scope.exec(`
            blockedExecution();
            unblockedExecution();
        `, done);
    });
});
