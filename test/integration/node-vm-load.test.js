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

    it('should be able to load and execute scope', function (done) {
        execute(`
            var scope = require('scope').create(),
                checkrun = {};

            // set a reference variable to check if scope has run
            scope.set('_checkrun', checkrun);
            scope.set('_expect', expect);

            scope.exec([
                '_expect(_checkrun).to.not.have.property("go")',
                '_checkrun.go = true;'].join(';'),
            function (err) {
                if (err) { return done(err); }
                expect(checkrun.go).to.be.true;
                done();
            });
        `, done);
    });

    it('should extract native constructors', function (done) {
        execute(`
            var scope = require('scope').create();
            scope.set('expect', expect);

            scope.exec([
                'expect(Array).to.be.ok',
                'expect(ArrayOutsideVM).to.be.ok',
                'expect(Array).to.not.equal(ArrayOutsideVM)'
            ].join(';'), done);
        `, done);
    });

    it('should allow user set globals to be available on subsequent calls', function (done) {
        execute(`
            var scope = require('scope').create();
            scope.set('expect', expect);

            // add a global variable
            scope.exec('extra = true', function (err) {
                if (err) { return done(err); }

                scope.exec('expect(extra).to.be.true', done);
            });
        `, done);
    });

    // // this test is a bit tricky and irrelevant in VM
    // it.skip('should not leak user set globals', function (done) {
    //     execute(`
    //         var scope = require('scope').create();

    //         // set a reference variable to check if scope has run
    //         scope.set('_expect', expect);
    //         scope.exec('_expect(this.expect).to.be.undefined)', done);
    //     `, done);
    // });
});
