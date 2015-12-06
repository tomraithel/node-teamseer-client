# teamseer-node-client

A simple Node client for the teamseer.com API.

Note: This project has been developed for personal needs and therefore has no demand to be feature-complete.
I used RxJs because I wanted to play with - it´ my first project with this library so maybe I´ doing something stupid :)

**Not every thing is tested and documented yet - Please use this library at your own risk!**

## Api coverage

Only `getActiveUsers` and `getRecordsFor` are implemented... more to come.

## Usage

	var teamseer = require('teamseer-node-client');

	var client = new teamseer.Client({
		companyId: '12345',
		companyKey: 'abc123fghi456',
		apiVersion: '1_0_1'
	}, new teamseer.adapters.Soap('https://www.teamseer.com/services/soap/coreapi/1_0_1/teamseer_core_api.wsdl'));

	client.getRecordsByUser('youremail@test.com', '2015-12-01', '2015-12-31').then(function(records) {
		console.log("success");
		console.log(records);
	}, function(err) {
		console.log("error");
		console.log(err);
	});
