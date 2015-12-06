'use strict';

var Rx = require('rx');

var Client = function(conf, adapter) {
	if(!conf || !conf.companyId || !conf.companyKey || !conf.apiVersion) {
		throw new Error('Please provide a config with companyId, companyKey and apiVersion');
	}

	if(!adapter) {
		throw new Error('Please provide an api adapter');
	}

	this.conf = conf;
	this.adapter = adapter;

	this.reAuthAfterSeconds = 30 * 60;
	this.auth = {
		lastAuth: null,
		headers: {}
	};
};

Client.prototype.getCompanyId = function() {
	return this.conf.companyId;
};

Client.prototype.getCompanyKey = function() {
	return this.conf.companyKey;
};

Client.prototype.getApiVersion = function() {
	return this.conf.apiVersion;
};

Client.prototype.setAuth = function(lastAuth, cookie) {
	this.auth = {
		lastAuth: lastAuth,
		headers: {
			Cookie: cookie
		}
	}
};

Client.prototype.isAuthenticated = function() {
	if(!this.auth.lastAuth) {
		return false;
	}
	else {
		var secondsPassed = (new Date().getTime() - this.auth.lastAuth.getTime()) / 1000;
		return (secondsPassed < this.reAuthAfterSeconds);
	}
};

Client.prototype.getRecordsByUser = function(userIdentifier, fromDate, toDate) {
	var authentificationStream;
	if(!this.isAuthenticated()) {
		authentificationStream = this.adapter.authenticate(this.conf)
			.map(function(data) {
				this.setAuth(new Date(), data.cookie);
				return this.auth;
			}.bind(this));
	}
	else {
		authentificationStream = Rx.Observable.just(this.auth);
	}

	return authentificationStream.flatMap(function(auth) {
		return this.adapter.getRecordsFor({
			userIdentifier: userIdentifier,
			fromDate: fromDate,
			toDate: toDate
		}, auth.headers)
	}.bind(this)).toPromise();
};

module.exports = Client;