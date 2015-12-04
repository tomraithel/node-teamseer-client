'use strict';

var soap = require('soap');
var Rx = require('rx');

Rx.Observable.prototype.soap = function (name, properties) {
	return this.flatMap((api) => {
		return Rx.Observable.create(function (observer) {
			// result is a javascript object
			// raw is the raw response
			// soapHeader is the response soap header as a javascript object
			api[name](properties, function(err, result, raw, soapHeader) {
				if(err) {
					//console.log(err);
					observer.onError('Soap API error: ' + err);
					return;
				}
				else {
					//console.log(result);
					observer.onNext(result, soapHeader);
				}
				observer.onCompleted();
			});
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
							observer.onNext(client.teamseer_core_apiService.teamseer_core_apiPort);
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

	authenticate(companyId, companyKey, apiVersion) {
		return this.source
			.soap('authenticate', {
				companyId: companyId,
				companyKey: companyKey,
				apiVersion: apiVersion
			})
			.select(response => {
				return response.authenticateReturn.$value;
			});
	}
}

module.exports = SoapAdapter;