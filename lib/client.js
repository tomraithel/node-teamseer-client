'use strict';

class Client  {
	constructor(companyId, companyKey, apiVersion) {
		this.companyId = companyId;
		this.companyKey = companyKey;
		this.apiVersion = apiVersion;
	}

	getCompanyId() {
		return this.companyId;
	}

	getCompanyKey() {
		return this.companyKey;
	}

	getApiVersion() {
		return this.apiVersion;
	}
}

module.exports = Client;