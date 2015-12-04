var expect = require('chai').expect;
var Client = require('../lib/client');



describe('Client', function() {

	describe('#constructor', function() {
		it('should be defined', function () {
			expect(Client).to.be.a('function');
		});

		it('should populate the getters', function () {
			var client = new Client(123, 'mykey', '1_0_1');
			expect(client.getCompanyId()).to.equal(123);
			expect(client.getCompanyKey()).to.equal('mykey');
			expect(client.getApiVersion()).to.equal('1_0_1');
		});
	});
});