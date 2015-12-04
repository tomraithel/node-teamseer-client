'use strict';

var soap = require('soap');
var Rx = require('rx');

var Soap = function(url) {
	this.url = url;

	// Create a stream to the soap API
	this.sequence = Rx.Observable.create(function (observer) {
		soap.createClient(url, function(err, client) {
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
};

Soap.prototype.getUrl = function() {
	return this.url;
};

Soap.prototype.getSequence = function() {
	return this.sequence;
};

module.exports = Soap;