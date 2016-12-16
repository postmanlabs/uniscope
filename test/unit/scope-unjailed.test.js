describe.skip('scope module in unjailed mode', function () {
    var Scope = require('../../');

    describe('globals', function () {
        before(function () {
            global.uniscopeTestVariable = {
                onekey: true
            };
        });

        it('must pass through', function (done) {
            var scope = Scope.create({
                jailed: false
            }, {expect: expect});

            scope.exec(`
                expect(uniscopeTestVariable).be.an('object');
                expect(uniscopeTestVariable).have.property('onekey', true);
            `, done);
        });

        after(function () {
            delete global.uniscopeTestVariable;
        });
    });
});
