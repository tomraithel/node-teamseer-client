var chai = require('chai');
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var chaiAsPromised = require("chai-as-promised");

var expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

var Rx = require('rx');

var Client = require('../lib/client');
var SoapAdapter = require('../lib/adapters/soap');



describe('Client', function() {

	var client;
	var conf;

	beforeEach(function() {
		conf = {
			companyId: 123,
			companyKey: 'mykey',
			apiVersion: '1_0_1'
		};
		client = new Client(conf, {});
	});


	describe('#constructor', function() {
		it('should be defined', function () {
			expect(Client).to.be.a('function');
		});

		it('should populate the getters', function () {
			expect(client.getCompanyId()).to.equal(123);
			expect(client.getCompanyKey()).to.equal('mykey');
			expect(client.getApiVersion()).to.equal('1_0_1');
		});
	});

	describe('#isAuthenticated', function() {
		it('should be false after initialization', function () {
			expect(client.isAuthenticated()).to.equal(false);
		});

		it('should be true after auth has been set', function () {
			client.setAuth(new Date());
			expect(client.isAuthenticated()).to.equal(true);
		});

		it('should be true after auth has been set and some time has passed', function () {
			var expiredTime = new Date().getTime() - 29 * 60 * 1000;
			client.setAuth(new Date(expiredTime));
			expect(client.isAuthenticated()).to.equal(true);
		});

		it('should be false after last auth has been expired', function () {
			var expiredTime = new Date().getTime() - 40 * 60 * 1000;
			client.setAuth(new Date(expiredTime));
			expect(client.isAuthenticated()).to.equal(false);
		});
	});

	describe('#getRecordsByUser', function() {
		var client;
		var mock;

		beforeEach(function() {
			mock = {
				authenticate: sinon.spy(function() {
					return Rx.Observable.just({
						value: true,
						cookie: 'PHPSESSID=123456'
					});
				}),
				getRecordsFor: sinon.spy(function() {
					return Rx.Observable.just(['2015-10-01', '2015-10-02', '2015-10-03']);
				})
			};
			client = new Client(conf, mock);
		});

		it('should call authenticate on the adapter if not authenticated', function () {
			client.getRecordsByUser();
			expect(mock.authenticate).to.have.been.calledWith(conf);
		});

		it('should not call authenticate on the adapter if authenticated', function () {
			client.setAuth(new Date());
			client.getRecordsByUser();
			expect(mock.authenticate).to.not.have.been.called;
		});

		it('should call the getRecordsFor method on the adapter', function (done) {
			var promise = client.getRecordsByUser('tom', '2015-10-01', '2015-12-01');
			expect(mock.getRecordsFor).to.have.been.calledWith({
				userIdentifier: 'tom',
				fromDate: '2015-10-01',
				toDate: '2015-12-01'
			});
			expect(promise).to.eventually.deep.equal(['2015-10-01', '2015-10-02', '2015-10-03']).notify(done);
		});
	});
});