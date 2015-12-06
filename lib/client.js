'use strict';

var Rx = require('rx');

class Client  {
	constructor(conf, adapter) {
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
	}

	getCompanyId() {
		return this.conf.companyId;
	}

	getCompanyKey() {
		return this.conf.companyKey;
	}

	getApiVersion() {
		return this.conf.apiVersion;
	}

	setAuth(lastAuth, cookie) {
		this.auth = {
			lastAuth: lastAuth,
			headers: {
				Cookie: cookie
			}
		}
	}

	isAuthenticated() {
		if(!this.auth.lastAuth) {
			return false;
		}
		else {
			let secondsPassed = (new Date().getTime() - this.auth.lastAuth.getTime()) / 1000;
			return (secondsPassed < this.reAuthAfterSeconds);
		}
	}

	getRecordsByUser(userIdentifier, fromDate, toDate) {
		let authentificationStream;
		if(!this.isAuthenticated()) {
			authentificationStream = this.adapter.authenticate(this.conf)
				.map(data => {
					this.setAuth(new Date(), data.cookie);
					return this.auth;
				});
		}
		else {
			authentificationStream = Rx.Observable.just(this.auth);
		}

		return authentificationStream.flatMap(auth => {
			return this.adapter.getRecordsFor({
				userIdentifier: userIdentifier,
				fromDate: fromDate,
				toDate: toDate
			}, auth.headers)
		}).toPromise();
	}
}

module.exports = Client;