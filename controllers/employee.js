var mongoose = require("mongoose");
var validator = require("validator");
var Employee = mongoose.model("Employee");
var EmployeeAud = mongoose.model("EmployeeAudit");
var Status = mongoose.model("Status");
var ScheduleWorkTime = mongoose.model("WorkDayTime");
var NfcTag = mongoose.model("Code");

exports.findAllEmployee = function(req, res) {
  Employee.find({})
    .populate("scheduleWorkTime")
    .exec()
    .then(e => {
      res.status(200).send(e);
    });
};

exports.addEmployee = function(req, res) {
  if (!validator.isAlpha(req.body.name)) {res.status(500).send(String("El nombre debe contener solo letras."));return;}
  if (!validator.isAlpha(req.body.lastName)) {res.status(500).send(String("El apellido debe contener solo letras."));return;}
  if (!validator.isAlphanumeric(req.body.expedient)) {res.status(500).send(String("El legajo debe contener letras y numeros unicamente."));return;}
  if (!validator.isAlpha(req.body.status)) {res.status(500).send(String("El estado debe contener solo letras."));return;}

  //chequeo si ya existe un usuario con el mismo nombre apellido y legajo.
  this.existEmployeeByFullNameAndExpedient(
    {
      name: req.body.name,
      lastName: req.body.lastName,
      expedient: req.body.expedient
    },
    function(err, exist) {
      if (exist) {
        res
          .status(500)
          .send(
            String(
              "Ya exite un usuario con el mismo nombre, apellido y legajo."
            )
          );
      } else {
        const scheduleWorkTime = new ScheduleWorkTime({
          name: req.body.scheduleWorkTime.name,
          timeFrom: req.body.scheduleWorkTime.timeFrom,
          timeTo: req.body.scheduleWorkTime.timeTo
        });
        scheduleWorkTime.save(function(err, hoursSaved) {
          if (err) res.status(500).send(String(err));

          const employee = new Employee({
            name: req.body.name,
            lastName: req.body.lastName,
            expedient: req.body.expedient,
            nfcTag: req.body.nfcTag,
            status: req.body.status,
            scheduleWorkTime: hoursSaved._id
          });

          employee.save(function(err, employee) {
            if (err) res.status(500).send(String(err));
            res.status(200).jsonp(employee);
          });

          const employeeAudit = new EmployeeAud({
            revType: 1,
            expedient: employee.expedient,
            nfcTag: employee.nfcTag,
            status: employee.status,
            description: "creacion de empleado"
          });

          employeeAudit.save(function(err, auditSaved) {
            if (err)
              console.log("Error al grabar auditoria", employeeAudit, err);
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
      //console.log("empleado : " + findEmp);
      result(null, findEmp != null);
    }
  );
};

exports.updateEmployee = function(req, res) {
  console.log("PUT /empleado");
	if (!validator.isAlpha(req.body.name)) {res.status(500).send(String("El nombre debe contener solo letras."));return;}
  if (!validator.isAlpha(req.body.lastName)) {res.status(500).send(String("El apellido debe contener solo letras."));return;}
  if (!validator.isAlphanumeric(req.body.expedient)) {res.status(500).send(String("El legajo debe contener letras y numeros unicamente."));return;}
  if (!validator.isAlpha(req.body.status)) {res.status(500).send(String("El estado debe contener solo letras."));return;}

  const scheduleWorkTime = new ScheduleWorkTime({
    name: req.body.scheduleWorkTime.name,
    timeFrom: req.body.scheduleWorkTime.timeFrom,
    timeTo: req.body.scheduleWorkTime.timeTo
  });

  scheduleWorkTime.save(function(err, hoursSaved) {
    if (err) res.status(500).send(String(err));

    Employee.findOneAndUpdate(
      { _id: req.params.id },
      {
        name: req.body.name,
        lastName: req.body.lastName,
        expedient: req.body.expedient,
        nfcTag: req.body.nfcTag,
        status: req.body.status,
        scheduleWorkTime: hoursSaved._id
      },
      { new: true },
      function(err, updEmpl) {
        if (err) res.status(500).send(String(err));

        if (updEmpl == null) {
          res
            .status(404)
            .send("No se econtro ningun empleado con el id : " + req.params.id);
        } else {
          const employeeAudit = new EmployeeAud({
            revType: 2,
            expedient: updEmpl.expedient,
            nfcTag: updEmpl.nfcTag,
            status: updEmpl.status,
            description: "modificacion del empleado"
          });
          employeeAudit.save(function(err, auditSaved) {
            if (err) console.log("Error al actualizar auditoria del empleado ", err, updEmpl);
            res.status(200).jsonp(updEmpl);
          });
        }
      }
    );
  });
};

//change status to inactive to employee.
exports.deleteEmployee = function(req, res) {
  Employee.findOneAndUpdate(
    { _id: req.params.id },
    { status: "inactive" },
    { new: true },
    function(err, delEmpl) {
      if (err) res.status(500).send(String(err));

      if (delEmpl == null) {
        res
          .status(404)
          .send("No se econtro ningun empleado con el id : " + req.params.id);
      } else {
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
    }
  );
};

exports.findById = function(req, res) {
  Employee.findOne({ _id: req.params.id })
    .populate("scheduleWorkTime")
    .exec()
    .then(e => {
      res.status(200).send(e);
    });
};

exports.findByExpedient = function(req, res) {
  Employee.findOne({ expedient: req.params.expedient })
    .populate("scheduleWorkTime")
    .exec()
    .then(e => {
      res.status(200).send(e);
    });
};

exports.canAccess = function(req, res) {
  Employee.findOne({ _id: req.params.id })
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
