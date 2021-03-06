<!-- markdownlint-disable MD012 MD022 MD024 MD026 MD032 MD041 -->

# Change Log

- based on [Keep a Changelog](http://keepachangelog.com/)
- adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
~~Removed, Changed, Deprecated, Added, Fixed, Security~~

## [3.3.0] - 2019-07-12
### Changed
- minor tweeks
- reference to new [sample-distribution](https://www.npmjs.com/package/sample-distribution) project

## [3.2.0] - 2019-07-12
### Removed
- `.length`

## [3.1.0] - 2019-07
### Changed
- interpolate rank to preserve average
- `.ave` average approximation

## [3.0.0] - 2018-02-24
### Changed
- reverted to CJS modules only
### Fixed
- minor simplifications
- added more comments in code
- improved documentation

## [2.2.0] - 2017-06-09
### Changed
- split code into ES2015 modules

### Added
- distribution files for browser, CJS and ES6


## [2.1.1] - 2017-02-05
### Changed
- Changed interpolation to mid-point when splitting intervals
- Code simplification

### Fixed
- Error for exact value matches


## [2.0.1] - 2017-01-13
### Changed
- Tests for Bias and RMS errors
- Simplify code a little


## [2.0.0] - 2017-01-13
### Changed
- Input weights during initiation are padded with 0 and 1 to preserve min and max

### Fixed
- Improved arguments parsing


## [1.1.0] - 2017-01-12
### Changed
- Widening of the max/min weight limits to reduce the number of interpolation

### Added
- `CHANGELOG.md`
- `.editorconfig`


## [1.0.5] - 2016-10-21
### Fixed
- minor tweeks


## [1.0.4] - 2016-10-19
### Fixed
- fixed `devDependencies` in `package.json`


## [1.0.3] - 2016-10-12
### Fixed
- `README.md`


## [1.0.0] - 2016-09-22
### Added
- First publish
