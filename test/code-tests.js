var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

describe('Code', function() {
  it('should list ALL codes on /code GET', function(done) {
    chai.request(server)
      .get('/api/code')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        done();
      });
  });
  it('should list a SINGLE code on /code/<id> GET');
  it('should add a SINGLE code on /code POST');
  it('should update a SINGLE code on /code/<id> PUT');
  it('should delete a SINGLE code on /code/<id> DELETE');
});