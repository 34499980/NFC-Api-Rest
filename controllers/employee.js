var mongoose = require("mongoose");
var validator = require("validator");
var Employee = mongoose.model("Employee");
var EmployeeAud = mongoose.model("EmployeeAudit");
var Status = mongoose.model("Status");
var ScheduleWorkTime = mongoose.model("WorkDayTime");
var NfcTag = mongoose.model("Code");

exports.findAllEmployee = function(req, res) {
  Employee.find({})
    .populate("status")
    .populate("scheduleWorkTime")
    .exec()
    .then(e => {
      res.status(200).send(e);
    });
};

exports.addEmployee = function(req, res) {
	if(!validator.isAlpha(req.body.name)) {res.status(500).send(String("El nombre debe contener solo letras.")); return}
	if(!validator.isAlpha(req.body.lastName)) {res.status(500).send(String("El apellido debe contener solo letras.")); return};
	if(!validator.isAlphanumeric(req.body.expedient)) {res.status(500).send(String("El legajo debe contener letras y numeros unicamente.")); return};
	if(!validator.isAlpha(req.body.status.status)) {res.status(500).send(String("El estado debe contener solo letras.")); return};
  this.existEmployeeByFullNameAndExpedient(
    {
      name: req.body.name,
      lastName: req.body.lastName,
      expedient: req.body.expedient
    },
    function(err, exist) {
      if (exist){
				res
				.status(500)
				.send(
					String(
						"Ya exite un usuario con el mismo nombre, apellido y legajo."
					)
				);
			} else {
				saveStatus(req.body.status).then(s => {
					saveWorkTimes(req.body.scheduleWorkTime).then(wt => {
						const employee = new Employee({
							name: req.body.name,
							lastName: req.body.lastName,
							expedient: req.body.expedient,
							nfcTag: req.body.nfcTag,
							status: s,
							scheduleWorkTime: wt
						});
						employee.save(function(err, employee) {
							if (err) res.send(500, err.message);
							res.status(200).jsonp(employee);
						});
						const employeeAudit = new EmployeeAud({
							revType: 1,
							expedient: req.body.expedient,
							nfcTag: req.body.nfcTag,
							status: s._id,
							description: "creacion de empleado"
						});
					
						// employeeAudit.save(function(err, auditSaved) {
						// 	if (err) res.status(500).send(String(err));
						// });
					});
				});
			}
    }
  );

  
};

existEmployeeByFullNameAndExpedient = function(req, result) {
  Employee.findOne(
    { name: req.name, lastName: req.lastName, expedient: req.expedient },
    function(err, findEmp) {
      if (err) {
        console.log("error " + err);
        result(err);
      }
      result(null, findEmp != null);
    }
  );
};

exports.updateEmployee = function(req, res) {
  console.log("PUT /empleado");

  Employee.findOneAndUpdate(
    { _id: req.params.id },
    {
      name: req.params.name,
      lastName: req.params.lastName,
      expedient: req.params.expedient,
      nfcTag: req.params.nfcTag,
      status: new Status({ status: req.params.status }),
      scheduleWorkTime: req.params.scheduleWorkTime
    },
    { new: false },
    function(err, updEmpl) {
      if (err) res.status(500).send(String(err));

      if (updEmpl == null)
        res
          .status(404)
          .send("No se econtro ningun empleado con el id : " + req.params.id);

      const employeeAudit = new EmployeeAud({
        revType: 2,
        expedient: updEmpl.expedient,
        nfcTag: updEmpl.nfcTag,
        status: updEmpl.status,
        description: "modificacion del empleado"
      });

      employeeAudit.save(function(err, auditSaved) {
        if (err) res.status(500).send(String(err));
        res.status(200).jsonp(updEmpl);
      });
    }
  );
};

//change status to inactive to employee.
exports.deleteEmployee = function(req, res) {
  console.log("DEL-PUT /empleado");
  Employee.findOneAndUpdate(
    { _id: req.params.id },
    { status: new Status({ status: "inactive" }) },
    { new: true },
    function(err, delEmpl) {
      if (err) res.status(500).send(String(err));

      if (delEmpl == null)
        res
          .status(404)
          .send("No se econtro ningun empleado con el id : " + req.params.id);

      const employeeAudit = new EmployeeAud({
        revType: 3,
        expedient: delEmpl.expedient,
        nfcTag: delEmpl.nfcTag,
        status: delEmpl.status,
        description: "modificacion del estado del empleado. (inactivo)."
      });

      employeeAudit.save(function(err, auditSaved) {
        if (err) res.status(500).send(String(err));
        res.status(200).jsonp(delEmpl);
      });
    }
  );
};

exports.findById = function(req, res) {
  Employee.findOne({ _id: req.params.id })
    .populate("status")
    .populate("scheduleWorkTime")
    .exec()
    .then(e => {
      res.status(200).send(e);
    });
};

exports.findByExpedient = function(req, res) {
  Employee.findOne({ expedient: req.params.expedient })
    .populate("status")
    .populate("scheduleWorkTime")
    .exec()
    .then(e => {
      res.status(200).send(e);
    });
};

exports.canAccess = function(req, res) {
  Employee.findOne({ _id: req.params.id })
    .populate("status")
    .populate("scheduleWorkTime")
    .exec()
    .then(e => {
      isAuthorized(e)
        ? res.status(200).send("Authorized")
        : res.status(403).send("Unauthorized");
    });
};

const isAuthorized = function(employee) {
  const today = new Date();
  const workTime = employee.scheduleWorkTime.filter(schedule => {
    return schedule.dayNumber == today.getDay();
  })[0];
  return employee.status.status == "active" && allowedTime(workTime)
    ? true
    : false;
};

const allowedTime = function(workTime) {
  let allowed = false;
  const today = new Date();
  if (workTime) {
    const timeFrom = workTime.timeFrom;
    const timeTo = workTime.timeTo;
    allowed = today.getHours() >= timeFrom && today.getHours() <= timeTo;
  }
  return allowed;
};

const saveWorkTimes = function(worktimes) {
  return new Promise(function(resolve, reject) {
    const savedHours = [];
    worktimes.forEach(function(workTime, index) {
      const s = new ScheduleWorkTime(workTime);
      s.save(function(err, savedObj) {
        if (err) reject("Error al guardar los horarios");
        savedHours.push(savedObj._id);
        if (savedHours.length == worktimes.length) {
          resolve(savedHours);
        }
      });
    });
  });
};

const saveStatus = function(status) {
  return new Promise(function(resolve, reject) {
    const statusObj = new Status(status);
    statusObj.save(function(err, savedObj) {
      return err ? reject("Error al guardar el status") : resolve(savedObj._id);
    });
  });
};
