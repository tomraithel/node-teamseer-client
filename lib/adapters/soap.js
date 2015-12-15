'use strict';

var soap = require('soap');
var Rx = require('rxjs/Rx');

/**
 * An soap adapter for the teamseer api
 * @param {string?} endpoint
 * @param {object?} customSoapClient
 * @constructor
 */
var SoapAdapter = function(endpoint, customSoapClient) {
	this.endpoint = endpoint || 'https://www.teamseer.com/services/soap/coreapi/1_0_1/teamseer_core_api.wsdl';
	this.soap = customSoapClient || soap;
	this.initSource();
};

/**
 * Creates a rxjs observable which provides the api interface
 */
SoapAdapter.prototype.initSource = function() {
	var soapClientData;
	var isWsdlLoading = false;
	var waitingObservers = [];
	var endpoint = this.getEndpoint();

	// Create a stream to the soap API
	this.source = Rx.Observable.defer(function() {
		if(typeof soapClientData === 'undefined') {
			return Rx.Observable.create(function (observer) {
				waitingObservers.push(observer);

				if(!isWsdlLoading) {
					isWsdlLoading = true;
					this.soap.createClient(endpoint, function(err, client) {
						waitingObservers.forEach(function(observer) {
							if(err) {
								observer.error('Soap error: ' + err);
								return;
							}
							if(!client || !client.teamseer_core_apiService || !client.teamseer_core_apiService.teamseer_core_apiPort) {
								observer.error('Wrong WSDL format');
								return;
							}
							else {
								soapClientData = {
									client: client
								};
								observer.next(soapClientData);
							}
							observer.complete();
						});
					});
				}
			}.bind(this));
		}
		return Rx.Observable.of(soapClientData);
	}.bind(this));
};

SoapAdapter.prototype.getEndpoint = function() {
	return this.endpoint
};

SoapAdapter.prototype.getSource = function() {
	return this.source
};

/**
 * Returns an observable which contains soap response information as object
 * @param name
 * @param properties
 * @param headers
 * @returns {Rx.Observable}
 */
SoapAdapter.prototype.getSoapSource = function (name, properties, headers) {
	return this.source.flatMap(function(soap) {
		return Rx.Observable.create(function (observer) {
			if(typeof soap.client[name] === 'undefined') {
				observer.error('Soap API error: No method with name "' + name + '" defined');
			}
			else {
				// result is a javascript object
				// raw is the raw response
				// soapHeader is the response soap header as a javascript object
				soap.client[name](properties || null, function(err, result, raw, soapHeader) {
					if(err) {
						//console.log(raw);
						observer.error('Soap API error: ' + err);
					}
					else {
						var data = {
							response: result,
							raw: raw,
							soapHeader: soapHeader,
							headers: soap.client.lastResponseHeaders
						};
						observer.next(data);
					}
					observer.complete();
				}, {}, headers);
			}
		});
	});
};

/**
 * Authenticate a user
 * @param params
 * @returns {Rx.Observable}
 */
SoapAdapter.prototype.authenticate = function(params) {
	if(!params.companyId || !params.companyKey || !params.apiVersion) {
		throw new Error('Please provided companyId, companyKey and apiVersion');
	}
	return this.getSoapSource('authenticate', params)
		.map(function(data) {
			var cookie = '';
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
		}.bind(this));
};

/**
 * Get a list of active users
 * @param params
 * @param headers
 * @returns {Rx.Observable}
 */
SoapAdapter.prototype.getActiveUsers = function(params, headers) {
	if(!headers || !headers.Cookie) {
		throw new Error('Please provided a "Cookie" header');
	}
	return this.getSoapSource('getActiveUsers', params, headers)
		.map(function(data) {
			if(data.response &&
				data.response.getActiveUsersReturn &&
				data.response.getActiveUsersReturn.item) {
				return data.response.getActiveUsersReturn.item;
			}
			return [];
		})
		.map(function(list) {
			return list.map(function(item) {
				return item.$value;
			});
		});
};

/**
 * Get records for a a specific user
 * @param params
 * @param headers
 * @returns {Rx.Observable}
 */
SoapAdapter.prototype.getRecordsFor = function(params, headers) {
	if(!params.userIdentifier || !params.fromDate || !params.toDate) {
		throw new Error('Please provided userIdentifier, fromDate and toDate');
	}
	if(!headers || !headers.Cookie) {
		throw new Error('Please provided a "Cookie" header');
	}
	return this.getSoapSource('getRecordsFor', params, headers)
		.map(function(data) {
			if(data.response &&
				data.response.getRecordsForReturn &&
				data.response.getRecordsForReturn.item) {
				return data.response.getRecordsForReturn.item;
			}
			return [];
		})
		.flatMap(function(list) {
			if(typeof list === 'undefined') {
				return Rx.Observable.throw(new Error('Error - empty records response'));
			}
			else {
				return Rx.Observable.of(list.map(function(item) {
					return {
						date: 			item.date.$value,
						hasNotes: 		item.hasNotes.$value,
						needsApproval: 	item.needsApproval.$value,
						status: 		item.statusStr.$value,
						type: 			item.typeStr.$value,
						userIdentifier: item.userIdentifier.$value
					};
				}));
			}
		});
};

module.exports = SoapAdapter;
