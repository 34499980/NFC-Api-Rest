var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();
var mongoose = require('mongoose');
var Code  = mongoose.model('Code');

chai.use(chaiHttp);

describe('Code', function() {

  Code.collection.drop();
  
    beforeEach(function(done){
      var newCode = new Code({"nfcTag":"initialTag"});
      newCode.save(function(err) {
        done();
      });
    });
    afterEach(function(done){
      Code.collection.drop();
      done();
    });

  it('should add a SINGLE code on /api/code POST', function(done) {
    chai.request(server)
      .post('/api/code')
      .send({"nfcTag":"testTag"})
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('nfcTag');
        res.body.nfcTag.should.be.a('string');
        res.body.nfcTag.should.equal('testTag')
        done();
      });
  } );
  // it('should update a SINGLE code on /api/code/<id> PUT');
  // it('should delete a SINGLE code on /api/code/<id> DELETE');
});