var chai = require('chai');
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var chaiAsPromised = require("chai-as-promised");

var expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

var Rx = require('rxjs/Rx');

var Client = require('../lib/client');


describe('Client', function() {

	var client;
	var conf;
	var mockedAdapter;

	beforeEach(function() {
		conf = {
			companyId: 123,
			companyKey: 'mykey',
			apiVersion: '1_0_1'
		};

		mockedAdapter = {
			authenticate: sinon.spy(function() {
				return Rx.Observable.of({
					value: true,
					cookie: 'PHPSESSID=123456'
				});
			}),
			getActiveUsers: sinon.spy(function() {
				return Rx.Observable.of(['knut@test.com']);
			}),
			getRecordsFor: sinon.spy(function() {
				return Rx.Observable.of(['2015-10-01', '2015-10-02', '2015-10-03']);
			})
		};
		client = new Client(conf, mockedAdapter);
	});


	describe('#constructor', function() {
		it('should be defined', function () {
			expect(Client).to.be.a('function');
		});

		it('should populate the getters', function () {
			expect(client.getCompanyId()).to.equal(123);
			expect(client.getCompanyKey()).to.equal('mykey');
			expect(client.getApiVersion()).to.equal('1_0_1');
			expect(client.getAdapter()).to.equal(mockedAdapter);
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

	describe('#getAuthStream', function() {
		it('should call authenticate on the adapter if not authenticated', function () {
			client.getAuthStream();
			expect(mockedAdapter.authenticate).to.have.been.calledWith(conf);
		});

		it('should not call authenticate on the adapter if authenticated', function () {
			client.setAuth(new Date());
			client.getAuthStream();
			expect(mockedAdapter.authenticate).to.not.have.been.called;
		});
	});

	describe('#getActiveUsers', function() {
		it('should call the getActiveUsers method on the adapter', function (done) {
			var promise = client.getActiveUsers();
			expect(mockedAdapter.getActiveUsers).to.have.been.called;
			expect(promise).to.eventually.deep.equal(['knut@test.com']).notify(done);
		});
	});

	describe('#getRecordsByUser', function() {
		it('should call the getRecordsFor method on the adapter', function (done) {
			var promise = client.getRecordsByUser('tom', '2015-10-01', '2015-12-01');
			expect(mockedAdapter.getRecordsFor).to.have.been.calledWith({
				userIdentifier: 'tom',
				fromDate: '2015-10-01',
				toDate: '2015-12-01'
			});
			expect(promise).to.eventually.deep.equal(['2015-10-01', '2015-10-02', '2015-10-03']).notify(done);
		});
	});
});
