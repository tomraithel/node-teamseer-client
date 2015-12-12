# node-teamseer-client

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]

A simple Node client for the [teamseer.com](http://www.teamseer.com/) SOAP API.

## Installation

```
npm install teamseer-client
```

## Api coverage

Only `getActiveUsers` and `getRecordsByUser` are implemented.

## Documentation

### Creating a client

```javascript
var teamseer = require('teamseer-client');

var client = new teamseer.Client({
	companyId: '12345',
	companyKey: 'abc123fghi456',
	apiVersion: '1_0_1'
});
```


### `getRecordsByUser` Get records as array for one person

```javascript
/**
 * Return all recorded days for a user within a given range
 * @param {string} userIdentifier Typically the users email
 * @param {string} fromDate The start date as YYYY-MM-DD
 * @param {string} toDate The end date as YYYY-MM-DD
 * @returns {Promise}
 */
client.getRecordsByUser('anna.miller@example.com', '2015-12-01', '2015-12-31').then(function(records) {
	console.log(records);
});

// Example output:
//[
//	{
//		date: '2015-12-21',
//		hasNotes: true,
//		needsApproval: true,
//		status: '22',
//		type: '00',
//		userIdentifier: 'anna.miller@example.com'
//	},
//	{
//		date: '2015-12-22',
//		hasNotes: false,
//		needsApproval: true,
//		status: '22',
//		type: '00',
//		userIdentifier: 'anna.miller@example.com'
//	}
//]
```

### `getActiveUsers` Get a list of all active users

```javascript
/**
 * Returns active users as an array
 * @returns {Promise}
 */
client.getActiveUsers().then(function(records) {
	console.log(records);
});

// Example output:
//
// [ 'anna.miller@example.com',
//	'clemens.doe@example.com',
//	'tanja.jackson@example.com',
//	'timo.foo@example.com',
//	'anne.bar@example.com',
//	'linda.baz@example.com' ]
```

## Full Example

```javascript
var teamseer = require('teamseer-client');

var client = new teamseer.Client({
	companyId: '12345',
	companyKey: 'abc123fghi456',
	apiVersion: '1_0_1'
});

client.getRecordsByUser('youremail@test.com', '2015-12-01', '2015-12-31').then(function(records) {
	console.log("success", records);
}, function(err) {
	console.log("error", err);
});
```

## Changelog

- `1.0.0` Initial release


[npm-image]: https://img.shields.io/npm/v/teamseer-client.svg?style=flat-square
[npm-url]: https://npmjs.org/package/teamseer-client
[travis-image]: https://img.shields.io/travis/tomraithel/node-teamseer-client.svg?style=flat-square
[travis-url]: https://travis-ci.org/tomraithel/node-teamseer-client