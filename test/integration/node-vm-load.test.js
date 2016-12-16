describe('vm module', function () {
    var vm = require('vm'),
        browserify = require('browserify'),

        execute; // function

    beforeEach(function (done) {
        browserify({
            insertGlobalVars: false,
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
                console: console,
                global: null,
                ArrayOutsideVM: Array
            });

            vm.runInContext(code.toString(), sandbox);

            execute = function (code, done) {
                sandbox.done = done;
                vm.runInContext(code, sandbox);
            };
            done();
        });
    });

    afterEach(function () {
        execute = null;
    });

    it('must be able to load and execute scope', function (done) {
        execute(`
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
        `, done);
    });

    it('must extract native constructors', function (done) {
        execute(`
            var scope = require('scope').create();
            scope.set('expect', expect);

            scope.exec([
                'expect(Array).be.ok()',
                'expect(ArrayOutsideVM).be.ok()',
                'expect(Array).not.be(ArrayOutsideVM)'
            ].join(';'), done);
        `, done);
    });

    it('must allow user set globals to be available on subsequent calls', function (done) {
        execute(`
            var scope = require('scope').create();
            scope.set('expect', expect);

            // add a global variable
            scope.exec('extra = true', function (err) {
                if (err) { return done(err); }

                scope.exec('expect(extra).be.ok()', done);
            });
        `, done);
    });

    // // this test is a bit tricky and irrelevant in VM
    // it.skip('must not leak user set globals', function (done) {
    //     execute(`
    //         var scope = require('scope').create();

    //         // set a reference variable to check if scope has run
    //         scope.set('_expect', expect);
    //         scope.exec('_expect(typeof expect).be("undefined")', done);
    //     `, done);
    // });
});
