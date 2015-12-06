'use strict';

var soap = require('soap');
var Rx = require('rx');

Rx.Observable.prototype.soap = function (name, properties, headers) {
	return this.flatMap((soap) => {
		return Rx.Observable.create(function (observer) {
			if(typeof soap.client[name] === 'undefined') {
				observer.onError('Soap API error: No method with name "' + name + '" defined');
			}
			else {
				// result is a javascript object
				// raw is the raw response
				// soapHeader is the response soap header as a javascript object
				soap.client[name](properties || null, function(err, result, raw, soapHeader) {
					if(err) {
						//console.log(raw);
						observer.onError('Soap API error: ' + err);
					}
					else {
						let data = {
							response: result,
							raw: raw,
							soapHeader: soapHeader,
							headers: soap.client.lastResponseHeaders
						};
						observer.onNext(data);
					}
					observer.onCompleted();
				}, {}, headers);
			}
		});
	});
};

class SoapAdapter  {
	constructor(endpoint) {
		this.endpoint = endpoint;

		var obs;
		// Create a stream to the soap API
		this.source = Rx.Observable.defer(function() {
			if(typeof obs === 'undefined') {
				obs = Rx.Observable.create(function (observer) {
					soap.createClient(endpoint, function(err, client) {
						if(err) {
							observer.onError('Soap error: ' + err);
							return;
						}
						if(!client || !client.teamseer_core_apiService || !client.teamseer_core_apiService.teamseer_core_apiPort) {
							observer.onError('Wrong WSDL format');
							return;
						}
						else {
							observer.onNext({
								client: client
							});
						}
						observer.onCompleted();
					});
				});
			}
			return obs;
		});
	}

	getEndpoint() {
		return this.endpoint
	}

	getSource() {
		return this.source
	}

	authenticate(params) {
		if(!params.companyId || !params.companyKey || !params.apiVersion) {
			throw new Error('Please provided companyId, companyKey and apiVersion');
		}
		return this.source
			.soap('authenticate', params)
			.select(data => {
				let cookie = '';
				if(data.headers['set-cookie'] && data.headers['set-cookie'] && data.headers['set-cookie'].length > 0) {
					var match = data.headers['set-cookie'][0].match(/PHPSESSID=\w+/);
					if(match) {
						cookie = match[0];
					}
				}

				return {
					value:	data.response.authenticateReturn.$value,
					cookie: cookie
				}
			});
	}

	getActiveUsers(params, headers) {
		if(!headers || !headers.Cookie) {
			throw new Error('Please provided a "Cookie" header');
		}
		return this.source
			.soap('getActiveUsers', params, headers)
			.pluck('response', 'getActiveUsersReturn', 'item')
			.map(list => {
				return list.map(function(item) {
					return item.$value;
				});
			});
	}

	getRecordsFor(params, headers) {
		if(!params.userIdentifier || !params.fromDate || !params.toDate) {
			throw new Error('Please provided userIdentifier, fromDate and toDate');
		}
		if(!headers || !headers.Cookie) {
			throw new Error('Please provided a "Cookie" header');
		}
		return this.source
			.soap('getRecordsFor', params, headers)
			.pluck('response', 'getRecordsForReturn', 'item')
			.flatMap(list => {
				if(typeof list === 'undefined') {
					return Rx.Observable.throw(new Error('Error - empty records response'));
				}
				else {
					return Rx.Observable.return(list.map(function(item) {
						return item.date.$value;
					}));
				}
			});
	}
}

module.exports = SoapAdapter;