'use strict';

var Client = require('./lib/client');
var SoapAdapter = require('./lib/adapters/soap');

module.exports = {
	Client: Client,
	adapters: {
		Soap: SoapAdapter
	}
};