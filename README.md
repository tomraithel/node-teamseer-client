# node-teamseer-client

[![Build Status](https://travis-ci.org/tomraithel/node-teamseer-client.svg)](https://travis-ci.org/tomraithel/node-teamseer-client) [![npm version](https://badge.fury.io/js/teamseer-client.svg)](https://badge.fury.io/js/teamseer-client)

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


## Note

This project has been developed for personal needs and therefore has no demand to be feature-complete.
I used RxJs because I wanted to play with - it´ my first project with this library, so if I´m doing something stupid,
please let me know.
