const expect = require('chai').expect,
    Scope = require('../../');

describe('scope module import globals', function () {
    var scope;

    beforeEach(function () {
        scope = Scope.create();
        scope.set('expect', expect);
    });
    afterEach(function () {
        scope = null;
    });

    it('should import an object to scope', function (done) {
        scope.import({
            glob1: 'glob1value',
            glob2: { pi: 3.142 }
        });

        scope.exec(`
            expect(glob1).to.equal('glob1value');
            expect(glob2).to.eql({pi: 3.142});
        `, done);
    });
});
