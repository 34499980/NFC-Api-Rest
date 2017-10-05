var chai = require("chai");
var chaiHttp = require("chai-http");
var server = require("../app");
var should = chai.should();
var mongoose = require("mongoose");
var Employee = mongoose.model("Employee");
var Status = mongoose.model("Status");
var WorkDayTime = mongoose.model("WorkDayTime");

chai.use(chaiHttp);

describe("Employee", function() {
  Employee.collection.drop();
  Status.collection.drop();
  WorkDayTime.collection.drop();

  beforeEach(function(done) {
    var firstEmployee = new Employee({
      name: "Test 1 name",
      lastName: "Test 1 lastName",
      expedient: "Test 1 expedient",
      nfcTag: "Test 1 nfcTag",
      status: mongoose.Types.ObjectId(),
      scheduleWorkTime: mongoose.Types.ObjectId()
    });
    var SecondEmployee = new Employee({
      name: "Test 2 name",
      lastName: "Test 2 lastName",
      expedient: "Test 2 expedient",
      nfcTag: "Test 2 nfcTag",
      status: mongoose.Types.ObjectId(),
      scheduleWorkTime: mongoose.Types.ObjectId()
    });
    firstEmployee.save(function(err) {
      SecondEmployee.save(function(err) {
        done();
      });
    });
  });

  afterEach(function(done) {
    Employee.collection.drop();
    Status.collection.drop();
    WorkDayTime.collection.drop();
    done();
  });

  it("should list ALL employees on /api/employee GET", function(done) {
    chai
      .request(server)
      .get("/api/employee")
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("array");
        res.body[0].name.should.equal("Test 1 name");
        res.body[1].name.should.equal("Test 2 name");
        done();
      });
  });

  it("should add a SINGLE employee on /employee POST", function(done) {
    chai
      .request(server)
      .post("/api/employee")
      .send({
        name: "Post",
        lastName: "Post",
        expedient: "AB1234",
        nfcTag: "D1000F",
        status: {
          status: "active"
        },
        scheduleWorkTime: {
          name: "Lunes",
          timeFrom: 12,
          timeTo: 16
        }
      })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("object");
        res.body.should.have.property("name");
        res.body.name.should.be.a("string");
        res.body.name.should.equal("Post");
        done();
      });
  });

  it("employee should not have access on /api/employee/canAccess Get", function(done) {
    var status = new Status({
      status: "active"
    });

    status.save(function(err, statusData) {
      var accessEmployee = new Employee({
        name: "Access",
        lastName: "Access",
        expedient: "Access",
        nfcTag: "Access",
        status: statusData._id,
        scheduleWorkTime: mongoose.Types.ObjectId()
      });
      accessEmployee.save(function(err, employeeData) {
        chai
          .request(server)
          .get("/api/employee/canAccess/" + employeeData._id)
          .end(function(err, res) {
            res.should.have.status(200);
            done();
          });
      });
    });
  });

  it("employee should have access on /api/employee/canAccess Get", function(done) {
    var status = new Status({
      status: "inactive"
    });

    status.save(function(err, statusData) {
      var accessEmployee = new Employee({
        name: "Access",
        lastName: "Access",
        expedient: "Access",
        nfcTag: "Access",
        status: statusData._id,
        scheduleWorkTime: mongoose.Types.ObjectId()
      });
      accessEmployee.save(function(err, employeeData) {
        chai
          .request(server)
          .get("/api/employee/canAccess/" + employeeData._id)
          .end(function(err, res) {
            res.should.have.status(403);
            done();
          });
      });
    });
  });
  // it('should update a SINGLE employee on /employee/<id> PUT');
  // it('should list a SINGLE employee on /employee/<id> GET');
});