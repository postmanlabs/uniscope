const expect = require('chai').expect,
    Mocha = require('mocha'),
    Scope = require('../../'),
    IS_NODE = typeof window === 'undefined',

    TEST_ENV_GLOBALS = [
        ...Object.getOwnPropertyNames(Mocha),

        // Following are Mocha's properties that
        // for some reason are not enumerable
        'context',
        'xcontext',
        'specify',
        'xspecify',

        // nyc,
        '__coverage__'
    ],

    // Important: Nothing should be added to this list without a good reason.
    // @note: On bumping the min-node version for uniscope, either move the version
    // specific globals to the list of allowed globals or mark them as "Not required"
    IGNORED_GLOBALS = [
        // Not required
        'BroadcastChannel',
        'FinalizationRegistry',
        'FormData',
        'Headers',
        'MessageChannel',
        'MessageEvent',
        'MessagePort',
        'Performance',
        'PerformanceEntry',
        'PerformanceMark',
        'PerformanceMeasure',
        'PerformanceObserver',
        'PerformanceObserverEntryList',
        'PerformanceResourceTiming',
        'Request',
        'Response',
        'WeakRef',
        'WebAssembly',
        'clearImmediate',
        'clearInterval',
        'clearTimeout',
        'fetch',
        'global',
        'globalThis',
        'performance',
        'setImmediate',
        'setInterval',
        'setTimeout',

        // No browser support
        'Buffer',
        'process',

        // requires node>=v19
        'CustomEvent',

        // requires node>=v20
        'File',

        // requires node>=v21
        'navigator',

        // requires node>=22
        'Iterator',
        'Navigator',
        'WebSocket',

        // requires node>=23
        'CloseEvent'
    ];

(IS_NODE ? describe : describe.skip)('scope globals parity with node', function () {
    var scope;

    beforeEach(function () {
        scope = Scope.create();
        scope.set('expect', expect);
    });
    afterEach(function () {
        scope = null;
    });

    it('should have missing globals as subset of explicity ignored globals', function (done) {
        const nodeGlobals = Object.getOwnPropertyNames(global).filter((v) => {
            return !TEST_ENV_GLOBALS.includes(v);
        });

        scope.import({ console });

        scope.exec(`
            const uniscopeGlobals = Object.getOwnPropertyNames(this);
            uniscopeGlobals.push('eval'); // eval is attached conditionally

            const diffWithNode = ${JSON.stringify(nodeGlobals)}
                .filter((nodeGlobal) => !uniscopeGlobals.includes(nodeGlobal))
                .sort();

            const isDiffSubsetOfIgnoredGlobals = diffWithNode
                .every((v) => ${JSON.stringify(IGNORED_GLOBALS)}.includes(v));

            expect(isDiffSubsetOfIgnoredGlobals).to.be.true;
        `, done);
    });
});


