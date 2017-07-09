describe('scope module import globals', function () {
    var Scope = require('../../'),
        scope;

    beforeEach(function () {
        scope = Scope.create();
        scope.set('expect', expect);
    });
    afterEach(function () {
        scope = null;
    });

    it('must import an object to scope', function (done) {
        scope.import({
            glob1: 'glob1value',
            glob2: { pi: 3.142 }
        });

        scope.exec(`
            expect(glob1).eql('glob1value');
            expect(glob2).eql({pi: 3.142});
        `, done);
    });
});
