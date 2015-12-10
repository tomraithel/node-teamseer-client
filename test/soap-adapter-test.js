var chai = require('chai');
var sinon = require("sinon");
var SoapAdapter = require('../lib/adapters/soap');

var sinonChai = require("sinon-chai");
var chaiAsPromised = require("chai-as-promised");

var expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('SoapApiInterface', function() {

	// We mock everything - therefore there is no need to wait for long timeouts
	this.timeout(200);

	var soapAdapter;
	var mockedSoapClient;

	var wsdl = 'https://www.teamseer.com/services/soap/coreapi/1_0_1/teamseer_core_api.wsdl';

	beforeEach(function() {

		mockedSoapClient = {
			teamseer_core_apiService: {
				teamseer_core_apiPort: {
				}
			},
			authenticate: sinon.spy(function(url, callback) {

			})
		};

		soapAdapter = new SoapAdapter(wsdl, {
			createClient: function(url, callback) {
				callback(null, mockedSoapClient);
			}
		});
	});

	describe('#constructor', function() {
		it('should be defined', function () {
			expect(SoapAdapter).to.be.a('function');
		});

		it('should populate the getters', function () {
			expect(soapAdapter.getEndpoint()).to.equal(wsdl);
			expect(soapAdapter.getSource()).to.be.a('object');
		});
	});

	describe('#source', function() {

		it('should throw an error if a SOAP error occures', function (done) {
			soapAdapter = new SoapAdapter(wsdl, {
				createClient: function(url, callback) {
					callback('SOAP error 110', null);
				}
			});

			soapAdapter.getSource().subscribe(
				function (x) {},
				function (e) {
					expect(e).to.equal('Soap error: SOAP error 110');
					done();
				});
		});

		it('should throw an error with non existing wsdl', function (done) {
			soapAdapter = new SoapAdapter(wsdl, {
				createClient: function(url, callback) {
					callback(null, null);
				}
			});

			soapAdapter.getSource().subscribe(
				function (x) {},
				function (e) {
					expect(e).to.equal('Wrong WSDL format');
					done();
				});
		});

		it('should return the teamseer soap api methods', function (done) {
			soapAdapter = new SoapAdapter(wsdl, {
				createClient: function(url, callback) {
					callback(null, mockedSoapClient);
				}
			});

			soapAdapter.getSource().subscribe(
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

		var cookie = 'PHPSESSID=123';

		describe('#authenticate', function() {
			it('should return true on login', function (done) {
				var credentials = {
					companyId: 123456,
					companyKey: 'foobar',
					apiVersion: '1_0_1'
				};

				mockedSoapClient.authenticate = sinon.spy(function(params, callback) {
					callback(null, {
						authenticateReturn: {
							$value: true
						}
					});
				});

				mockedSoapClient.lastResponseHeaders = {
					'set-cookie': [cookie]
				};

				soapAdapter.authenticate(credentials).subscribe(
					function (data) {
						expect(data.value).to.equal(true);
						expect(data.cookie).to.equal(cookie);
						done();
					}
				);

				expect(mockedSoapClient.authenticate).to.have.been.calledWith(credentials);
			});
		});

		describe('#getActiveUsers', function() {

			it('should return a list of active users', function (done) {

				mockedSoapClient.getActiveUsers = sinon.spy(function(params, callback) {
					callback(null, {
						getActiveUsersReturn: {
							item: [{
								$value:'anton'
							}, {
								$value: 'bert'
							}, {
								$value: 'edi'
							}]
						}
					});
				});

				soapAdapter.getActiveUsers(null, {
					'Cookie': cookie
				}).subscribe(
					function (data) {
						expect(data).to.deep.equal(['anton', 'bert', 'edi']);
						done();
					}
				);
			});
		});

		describe('#getRecordsFor', function() {
			it('should give some records for a user', function (done) {

				mockedSoapClient.getRecordsFor = sinon.spy(function(params, callback) {
					callback(null, {
						getRecordsForReturn: {
							item: [
								{
									attributes: {'xsi:type': 'ns1:DayActivityAPI'},
									categoryArr: {attributes: {}},
									date: {attributes: {}, '$value': '2015-12-21'},
									hasNotes: {attributes: {}, '$value': true},
									needsApproval: {attributes: {}, '$value': true},
									statusStr: {attributes: {}, '$value': '22'},
									typeStr: {attributes: {}, '$value': '02'},
									userIdentifier: {attributes: {}, '$value': 'johndoe@test.com'}
								},
								{
									attributes: {'xsi:type': 'ns1:DayActivityAPI'},
									categoryArr: {attributes: {}},
									date: {attributes: {}, '$value': '2015-12-22'},
									hasNotes: {attributes: {}, '$value': false},
									needsApproval: {attributes: {}, '$value': false},
									statusStr: {attributes: {}, '$value': '12'},
									typeStr: {attributes: {}, '$value': '00'},
									userIdentifier: {attributes: {}, '$value': 'johndoe@test.com'}
								}
							]
						}
					});
				});


				soapAdapter.getRecordsFor({
					userIdentifier: 'johndoe@test.com',
					fromDate: '2015-10-01',
					toDate: '2015-12-01'
				}, {
					'Cookie': cookie
				}).subscribe(
					function (data) {
						expect(data).to.deep.equal([{
							date: '2015-12-21',
							hasNotes: true,
							needsApproval: true,
							status: '22',
							type: '02',
							userIdentifier: 'johndoe@test.com'
						}, {
							date: '2015-12-22',
							hasNotes: false,
							needsApproval: false,
							status: '12',
							type: '00',
							userIdentifier: 'johndoe@test.com'
						}]);
						done();
					}
				);
			});
		});
	});
});