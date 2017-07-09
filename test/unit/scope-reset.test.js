describe('scope module reset', function () {
    var Scope = require('../../'),
        scope;

    beforeEach(function () {
        scope = Scope.create({
            ignore: ['expect']
        });
    });
    afterEach(function () {
        scope = null;
    });

    it('should reset imports', function (done) {
        scope.import({
            var1: 'var1',
            var2: 'var2'
        });

        scope.exec(`
            expect(var1).be('var1');
            expect(var2).be('var2');
        `, function (err) {
                if (err) { return done(err); }

                scope.reset();

                scope.exec(`
                    expect(typeof var1).be('undefined');
                    expect(typeof var2).be('undefined');
                `, done);
            });
    });

    it('should reset locals along with imports', function (done) {
        scope.import({
            var1: 'var1',
            var2: 'var2'
        });

        // we create some globals here
        scope.exec(`
            expect(var1).be('var1');
            expect(var2).be('var2');

            expect(typeof userGlobal).be('undefined');
            userGlobal = true;
        `, function (err) {
                if (err) { return done(err); }

                scope.reset(true);

                // we do not test globals to exist as this is tested elsewhere
                scope.exec(`
                    expect(typeof var1).be('undefined');
                    expect(typeof var2).be('undefined');
    
                    expect(typeof userGlobal).be('undefined');
                `, done);
            });
    });
});
