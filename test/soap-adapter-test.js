var expect = require('chai').expect;
var SoapAdapter = require('../lib/adapters/soap');

require('dotenv').load();

var validWsdl = 'https://www.teamseer.com/services/soap/coreapi/1_0_1/teamseer_core_api.wsdl';

describe('SoapApiInterface', function() {

	//return; // Disabled

	// Give us a little bit more time - mocha has a default of 2000ms before
	// tests exceed timeout
	this.timeout(8000);

	describe('dotenv', function() {
		it('.env should be loaded', function () {
			expect(process.env.COMPANY_ID).to.be.a('string');
			expect(process.env.COMPANY_KEY).to.be.a('string');
		});
	});

	describe('#constructor', function() {
		it('should be defined', function () {
			expect(SoapAdapter).to.be.a('function');
		});

		it('should populate the getters', function () {
			var client = new SoapAdapter(validWsdl);
			expect(client.getEndpoint()).to.equal(validWsdl);
			expect(client.getSource()).to.be.a('object');

		});
	});

	describe('#source', function() {
		it('should throw an error with non existing wsdl', function (done) {
			var client = new SoapAdapter('http://www.test.com/nonExistingWsdl');
			client.getSource().subscribe(
				function (x) {},
				function (e) {
					expect(e).to.equal('Soap error: Unexpected root element of WSDL or include');
					done();
				},
				function () {});
		});

		it('should return the teamseer soap api methods', function (done) {
			var client = new SoapAdapter(validWsdl);
			client.getSource().subscribe(
				function (x) {
					expect(x).to.be.a('object');
					expect(x.client).to.be.a('object');
					expect(x.client.authenticate).to.be.a('function');
					done();
				},
				function (e) {},
				function () {});
		});
	});


	describe('API Methods', function() {

		var client,
			cookie = 'PHPSESSID=ac0f78afe450b0cc55072a142e1c8ed2',
			companyId = process.env.COMPANY_ID,
			companyKey = process.env.COMPANY_KEY,
			apiVersion = '1_0_1';

		beforeEach(function() {
			client = new SoapAdapter(validWsdl);
		});

		describe('#authenticate', function() {
			it('should return true on login', function (done) {
				client.authenticate({
					companyId: companyId,
					companyKey: companyKey,
					apiVersion: apiVersion
				}).subscribe(
					function (data) {
						expect(data.value).to.equal(true);
						expect(data.cookie).to.be.a('string');

						cookie = data.cookie;
						done();
					}
				);
			});
		});

		describe('#getActiveUsers', function() {
			it('should return a list of active users', function (done) {
				client.getActiveUsers(null, {
					'Cookie': cookie
				}).subscribe(
					function (data) {
						expect(data).to.be.a('array');
						done();
					}
				);
			});
		});

		describe('#getRecordsFor', function() {
			it('should give some records for a user', function (done) {
				client.getRecordsFor({
					userIdentifier: 'thomas.raithel@aoe.com',
					fromDate: '2015-01-01',
					toDate: '2015-12-01'
				}, {
					'Cookie': cookie
				}).subscribe(
					function (data) {
						expect(data).to.be.a('array');
						done();
					}
				);
			});
		});
	});
});