#!/usr/bin/env node
/* eslint-env node, es6 */
require('shelljs/global');

var async = require('async'),
    colors = require('colors/safe');

async.series([
    require('./test-lint'),
    require('./test-system'),
    require('./test-unit'),
    require('./test-integration'),
    // run the browser tests locally and not on CI
    process.env.CI ? async.constant() : require('./test-browser')
], function (code) {
    !code && console.log(colors.green('\nuniscope tests: all ok!'));
    exit(code);
});
