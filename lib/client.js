'use strict';

var Rx = require('rx');

/**
 * The API client
 * @param {object} conf
 * @param {object} adapter Instance of an API adapter
 * @constructor
 */
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

Client.prototype.getAdapter = function() {
	return this.adapter;
};

/**
 * Set authentification information
 * @param {Date} lastAuth
 * @param {string?} cookie
 */
Client.prototype.setAuth = function(lastAuth, cookie) {
	this.auth = {
		lastAuth: lastAuth,
		headers: {
			Cookie: cookie
		}
	}
};

/**
 * Returns true, if authentication is valid and active
 * @returns {boolean}
 */
Client.prototype.isAuthenticated = function() {
	if(!this.auth.lastAuth) {
		return false;
	}
	else {
		var secondsPassed = (new Date().getTime() - this.auth.lastAuth.getTime()) / 1000;
		return (secondsPassed < this.reAuthAfterSeconds);
	}
};

/**
 * Returns the auth information as Rx steam
 * @returns {*}
 */
Client.prototype.getAuthStream = function() {
	if(!this.isAuthenticated()) {
		return this.adapter.authenticate(this.conf)
			.map(function(data) {
				this.setAuth(new Date(), data.cookie);
				return this.auth;
			}.bind(this));
	}
	else {
		return Rx.Observable.just(this.auth);
	}
};

/**
 * Performs an authenticated request via the adapter
 * @param {string} methodName
 * @param {object?} params
 * @returns {Promise}
 */
Client.prototype.authenticatedRequest = function(methodName, params) {
	return this.getAuthStream().flatMap(function(auth) {
		return this.adapter[methodName](params, auth.headers)
	}.bind(this)).toPromise();
};

/**
 * Returns active users as an array
 * @returns {Promise}
 */
Client.prototype.getActiveUsers = function() {
	return this.authenticatedRequest('getActiveUsers');
};

/**
 * Return all recorded days for a user within a given range
 * @param {string} userIdentifier Typically the users email
 * @param {string} fromDate The start date as YYYY-MM-DD
 * @param {string} toDate The end date as YYYY-MM-DD
 * @returns {Promise}
 */
Client.prototype.getRecordsByUser = function(userIdentifier, fromDate, toDate) {
	return this.authenticatedRequest('getRecordsFor', {
		userIdentifier: userIdentifier,
		fromDate: fromDate,
		toDate: toDate
	});
};

module.exports = Client;