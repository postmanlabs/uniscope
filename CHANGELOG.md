# Postman Uniscope Changelog

#### Unreleased
- Migrated tests to chai expect assertions

#### v1.1.2 (April 4, 2018)
* Updated dependencies :arrow_up:

#### 1.1.1 (May 11, 2017)
* Merge pull request #62 from postmanlabs/feature/ci-browser-tests
* Merge pull request #62 from postmanlabs/feature/ci-browser-tests
* Fixed a bug where "falsey" globals were not being accurately made available inside scope
* Updated dev dependencies to latest

#### 1.1.0 (December 16, 2016)
* Added feature to allow and reset a scope

#### 1.0.1 (December 16, 2016)
* Fixed dependency resolution issue

#### 1.0.0 (December 2016)
* Ensured that user globals are stageful globals
* Added concept of a _locals state variables to hold on to user generated variables and ignore them in subsequent runs
* Added a half-baked 3-way diff utility function
* Removed the tests for “jailed” mode that was mistakenly left skipped in previous commits
* Options have been streamlined to be part of scope and root context is generated once.
* Got rid of “unjailed” mode

#### 0.1.1 (December 2, 2016)
* Jailed mode fix

#### 0.1.1-beta.1 (December 1, 2016)
* Fixed an issue with jailed:false not being respected

#### 0.1.0 (November 30, 2016)
* Support for `ignored`, `blocked` and `jailed` globals
* Fix bug where console was blocked even if passed as import

#### 0.1.0-beta.2 (November 29, 2016)
* Added support to disable the jailed mode of scope
* Added support for blocked variables and made ignored variables configurable
* Cleaned up a few jsdoc entries
* Added checks to ensure integrity of global args and their values
* Added utility function to clone options and save defaults in the process
* Cleanup: Removed unwanted packages, updated README and added packing system tests
* Added vm support

#### 0.1.0-beta.1 (November 16, 2016)
* Added a separate context getter function the emulates context when a valid one is not found.
* Enabled integration tests and split the non-working vm test to a separate skipped spec
* Fixed issue with trailing array accessor in Node v6 causing transferable to bleed into scope
* Removed superfluous character escaping
* Separated test cases regarding console forwarding option of scope.
* Added integration tests. The one vm test added is currently skipped as it is pending vm support to be added in Scope
* Made system test spec loader recursive
* Isolated browser tests to unit tests only, since integration and system tests are not all isomorphic
* Added security check to prevent access to arguments variable
* Added options to import globals during construction
* Added check when .exec callback is missing
* Improved code documentation
* Moved scope source code to its separate folder
* Added code license reference to index file
* Improved test coverage by adding more tests to variable set and import flows
* Moved karma test config inside test folder to de-clutter root
* Moved mocha related lint configuration to `test` folder

#### 0.0.2 (October 5, 2016)
* Added a warning banner at the most critical part of the scope code
* Fixed issues with dependencies and made Scope get executed as an expression
* first code import
