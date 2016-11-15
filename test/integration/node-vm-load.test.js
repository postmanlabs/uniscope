describe('vm module', function () {
    var vm = require('vm'),
        browserify = require('browserify'),

        execute; // function

    beforeEach(function () {})

    it('must be able to load and execute scope', function (done) {
        browserify({
            browserField: false,
            bare: true,
            builtins: false,
            commondir: false
        }).require('./index.js', {
            expose: 'scope'
        }).bundle(function (err, code) {
            if (err) { return done(err); }

            var sandbox = vm.createContext({
                expect: expect,
                done: done
            });

            vm.runInContext(code.toString(), sandbox);

            vm.runInContext(`
                var scope = require('scope').create(),
                    checkrun = {};

                // set a reference variable to check if scope has run
                scope.set('_checkrun', checkrun);
                scope.set('_expect', expect);

                scope.exec([
                    '_expect(_checkrun).not.have.property("go")',
                    '_checkrun.go = true;'].join(';'),
                function (err) {
                    if (err) { return done(err); }
                    expect(checkrun.go).be.ok();
                    done();
                });
            `, sandbox);
        });
    });

    it.skip('must not leak user set globals', function (done) {
        browserify({
            browserField: false,
            bare: true,
            builtins: false,
            commondir: false
        }).require('./index.js', {
            expose: 'scope'
        }).bundle(function (err, code) {
            if (err) { return done(err); }

            var sandbox = vm.createContext({
                expect: expect,
                done: done
            });

            vm.runInContext(code.toString(), sandbox);

            vm.runInContext(`
                var scope = require('scope').create();

                // set a reference variable to check if scope has run
                scope.set('_expect', expect);
                scope.exec('_expect(typeof expect).be("undefined")', done);
            `, sandbox);
        });
    });
});
