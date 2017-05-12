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
    require('./test-browser')
], function (code) {
    !code && console.log(colors.green('\nuniscope tests: all ok!'));
    exit(code);
});
