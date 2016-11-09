var async = require('async');

describe('scope module options', function () {
    var Scope = require('../../');

    it('must allow script execution in strict mode', function (done) {
        var scope = Scope.create({strict: true});

        scope.exec(`a = 1 + 2;`, function (err) { // eslint-disable-line quotes
            expect(err).be.ok();
            done();
        });
    });

    it('must not forward console if the option is not set or set to false', function (done) {
        async.parallel([
            function (next) {
                var scope = Scope.create({}, {expect: expect}); // no options specified
                scope.exec(`expect(typeof console).be('undefined');`, next); // eslint-disable-line quotes
            },

            function (next) {
                var scope = Scope.create({console: false}, {expect: expect}); // specified as false
                scope.exec(`expect(typeof console).be('undefined');`, next); // eslint-disable-line quotes
            }
        ], done);
    });

    it('must forward native console when configured', function (done) {
        var scope = Scope.create({console: true}, {expect: expect});
        scope.exec(`expect(console).be.an('object');`, done); // eslint-disable-line quotes
    });

    it('must ensure that the console forwarded is native one', function (done) {
        var scope = Scope.create({
            console: true
        }, {
            expect: expect,
            refConsole: console
        });

        scope.exec(`
            expect(console).be.an('object');
            expect(console === refConsole).be.ok();
        `, done);
    });
});
