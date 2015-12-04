var expect = require('chai').expect;
var SoapAdapter = require('../lib/adapters/soap');

require('dotenv').load();

//var testSubscription = function(source) {
//
//};

var validWsdl = 'https://www.teamseer.com/services/soap/coreapi/1_0_1/teamseer_core_api.wsdl';


describe('SoapApiInterface', function() {

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
					expect(x.authenticate).to.be.a('function');
					done();
				},
				function (e) {},
				function () {});
		});
	});


	describe('API Methods', function() {
		var client,
			companyId = process.env.COMPANY_ID,
			companyKey = process.env.COMPANY_KEY,
			apiVersion = '1_0_1';

		beforeEach(function() {
			client = new SoapAdapter(validWsdl);
		});

		describe('#authenticate', function() {
			it('should return true on login', function (done) {
				client.authenticate(companyId, companyKey, apiVersion).subscribe(
					function (x) {
						expect(x).to.equal(true);
						done();
					}
				);
			});
		});
	});
});