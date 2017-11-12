var chai = require("chai");
var chaiHttp = require("chai-http");
var server = require("../app");
var moment = require("moment");
var should = chai.should();
var mongoose = require("mongoose");
var Employee = mongoose.model("Employee");
var EmployeeAud = mongoose.model("EmployeeAudit");
var initialEmployeeId;

chai.use(chaiHttp);

describe("Employee", function() {
  Employee.collection.drop();

  beforeEach(function(done) {
    var firstEmployee = new Employee({
      name: "Test 1 name",
      lastName: "Test 1 lastName",
      expedient: "Test1expedient",
      nfcTag: "Test 1 nfcTag",
      status: "status",
      scheduleWorkTime: []
    });
    var SecondEmployee = new Employee({
      name: "Test 2 name",
      lastName: "Test 2 lastName",
      expedient: "Test2expedient",
      nfcTag: "Test 2 nfcTag",
      status: "status",
      scheduleWorkTime: []
    });
    firstEmployee.save(function(err, e) {
      this.initialEmployeeId = e._id;
      SecondEmployee.save(function(err) {
        done();
      });
    });
  });

  afterEach(function(done) {
    Employee.collection.drop();
    EmployeeAud.collection.drop();
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
  //Post tests
  it("should add a SINGLE employee on /employee POST", function(done) {
    chai
      .request(server)
      .post("/api/employee")
      .send({
        name: "Post",
        lastName: "Post",
        expedient: "AB1234",
        nfcTag: "D1000F",
        status: "active",
        scheduleWorkTime: [
          {
            dayNumber: 0,
            timeFrom: 12,
            timeTo: 16
          },
          {
            dayNumber: 1,
            timeFrom: 12,
            timeTo: 16
          }
        ]
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

  it("should fail to add duplicated nfc tag employee on /employee POST", function(
    done
  ) {
    chai
      .request(server)
      .post("/api/employee")
      .send({
        name: "Test 1 name",
        lastName: "Test 1 lastName",
        expedient: "new expedient",
        nfcTag: "Test 1 nfcTag",
        status: "active",
        scheduleWorkTime: []
      })
      .end(function(err, res) {
        res.should.have.status(500);
        done();
      });
  });

  it("should fail to add duplicated expedient employee on /employee POST", function(
    done
  ) {
    chai
      .request(server)
      .post("/api/employee")
      .send({
        name: "Test 1 name",
        lastName: "Test 1 lastName",
        expedient: "Test 1 expedient",
        nfcTag: "new tag",
        status: "active",
        scheduleWorkTime: []
      })
      .end(function(err, res) {
        res.should.have.status(500);
        done();
      });
  });

  //Put tests
  it("should update a SINGLE employee on /employee POST", function(done) {
    var accessEmployee = new Employee({
      name: "PUT",
      lastName: "PUT",
      expedient: "PUTEXPEDIENT",
      nfcTag: "PUTNFCTAG",
      status: "active",
      scheduleWorkTime: []
    });
    accessEmployee.save(function(err, employeeData) {
      chai
        .request(server)
        .put("/api/employee/" + employeeData._id)
        .send({
          name: "PUT", //NfcTag y expediente repetidos, pero tiene que guardar porque estoy actualizando el mismo empleado.
          lastName: "PUT",
          expedient: "PUTEXPEDIENT",
          nfcTag: "PUTNFCTAG",
          status: "active",
          scheduleWorkTime: []
        })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.should.have.property("nfcTag");
          res.body.should.have.property("expedient");
          res.body.nfcTag.should.equal("PUTNFCTAG");
          res.body.expedient.should.equal("PUTEXPEDIENT");
          done();
        });
    });
  });

  it("should fail to update employee with repeated nfctag on /employee POST", function(
    done
  ) {
    var accessEmployee = new Employee({
      name: "PUT",
      lastName: "PUT",
      expedient: "PUTEXPEDIENT",
      nfcTag: "PUTNFCTAG",
      status: "active",
      scheduleWorkTime: []
    });
    accessEmployee.save(function(err, employeeData) {
      chai
        .request(server)
        .put("/api/employee/" + employeeData._id)
        .send({
          name: "PUT",
          lastName: "PUT",
          expedient: "PUTEXPEDIENT",
          nfcTag: "Test 1 nfcTag",
          status: "active",
          scheduleWorkTime: []
        })
        .end(function(err, res) {
          res.should.have.status(500);
          res.text.should.equal(
            "Ya exite un usuario con el mismo legajo o numero de sube."
          );
          console.log();
          done();
        });
    });
  });

  it("should fail to update employee with repeated expedient on /employee POST", function(
    done
  ) {
    var accessEmployee = new Employee({
      name: "PUT",
      lastName: "PUT",
      expedient: "PUTEXPEDIENT",
      nfcTag: "PUTNFCTAG",
      status: "active",
      scheduleWorkTime: []
    });
    accessEmployee.save(function(err, employeeData) {
      chai
        .request(server)
        .put("/api/employee/" + employeeData._id)
        .send({
          name: "PUT",
          lastName: "PUT",
          expedient: "Test1expedient",
          nfcTag: "PUTNFC",
          status: "active",
          scheduleWorkTime: []
        })
        .end(function(err, res) {
          res.should.have.status(500);
          res.text.should.equal(
            "Ya exite un usuario con el mismo legajo o numero de sube."
          );
          console.log();
          done();
        });
    });
  });

  //Can access tests
  it("active employee inside working hours should have access on /api/employee/canAccess Get", function(
    done
  ) {
    var today = new Date();
    var workTime = {
      dayNumber: today.getDay(),
      timeFrom: moment().subtract(2, "hours"),
      timeTo: moment().add(2, "hours")
    };
    var accessEmployee = new Employee({
      name: "Access",
      lastName: "Access",
      expedient: "Access",
      nfcTag: "Access",
      status: "active",
      scheduleWorkTime: [workTime]
    });
    accessEmployee.save(function(err, employeeData) {
      chai
        .request(server)
        .get("/api/employee/canAccess/byId/" + employeeData._id)
        .end(function(err, res) {
          res.should.have.status(200);
          done();
        });
    });
  });

  it("active employee outside working hours should not have access on /api/employee/canAccess Get", function(
    done
  ) {
    var today = new Date();
    var workTime = {
      dayNumber: today.getDay(),
      dayNumber: today.getDay(),
      timeFrom: moment().add(2, "hours"),
      timeTo: moment().subtract(2, "hours")
    };
    var accessEmployee = new Employee({
      name: "Access",
      lastName: "Access",
      expedient: "Access",
      nfcTag: "Access",
      status: "active",
      scheduleWorkTime: [workTime]
    });
    accessEmployee.save(function(err, employeeData) {
      chai
        .request(server)
        .get("/api/employee/canAccess/byId/" + employeeData._id)
        .end(function(err, res) {
          res.should.have.status(403);
          done();
        });
    });
  });

  it("inactive employee should not have access on /api/employee/canAccess Get", function(
    done
  ) {
    var today = new Date();
    var workTime = {
      dayNumber: today.getDay(),
      timeFrom: moment().subtract(2, "hours"),
      timeTo: moment().add(2, "hours")
    };
    var accessEmployee = new Employee({
      name: "Access",
      lastName: "Access",
      expedient: "Access",
      nfcTag: "Access",
      status: "inactive",
      scheduleWorkTime: [workTime]
    });
    accessEmployee.save(function(err, employeeData) {
      chai
        .request(server)
        .get("/api/employee/canAccess/byId/" + employeeData._id)
        .end(function(err, res) {
          res.should.have.status(403);
          done();
        });
    });
  });
  it("unregistered employee should not have access on /api/employee/canAccess Get", function(
    done
  ) {
    var today = new Date();
    var workTime = {
      dayNumber: today.getDay(),
      timeFrom: moment().subtract(2, "hours"),
      timeTo: moment().add(2, "hours")
    };
    var accessEmployee = new Employee({
      name: "Access",
      lastName: "Access",
      expedient: "Access",
      nfcTag: "Access",
      status: "inactive",
      scheduleWorkTime: [workTime]
    });
    accessEmployee.save(function(err, employeeData) {
      chai
        .request(server)
        .get("/api/employee/canAccess/byNfcTag/" + "aaa")
        .end(function(err, res) {
          res.should.have.status(403);
          done();
        });
    });
  });
});
