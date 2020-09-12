#!/usr/bin/env node
// ---------------------------------------------------------------------------------------------------------------------
// This script is intended to execute all unit tests.
// ---------------------------------------------------------------------------------------------------------------------
/* eslint-env node, es6 */

const path = require('path'),
    chalk = require('chalk'),
    expect = require('chai').expect,
    recursive = require('recursive-readdir'),

    SPEC_SOURCE_DIR = path.join('test', 'unit');

module.exports = function (exit) {
    // banner line
    console.log(chalk.yellow.bold('Running unit tests using mocha on node...'));

    var Mocha = require('mocha');

    // add all spec files to mocha
    recursive(SPEC_SOURCE_DIR, function (err, files) {
        if (err) { console.error(err); return exit(1); }

        var mocha = new Mocha({ timeout: 1000 * 60 });

        files.filter(function (file) { // extract all test files
            return (file.substr(-8) === '.test.js');
        }).forEach(mocha.addFile.bind(mocha));

        // start the mocha run
        global.expect = expect; // for easy reference

        mocha.run(function (runError) {
            // clear references and overrides
            delete global.expect;

            runError && console.error(runError.stack || runError);

            exit(runError || process.exitCode ? 1 : 0);
        });
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(process.exit);
