var mongoose = require("mongoose");
var validator = require("validator");
var moment = require("moment");
var Employee = mongoose.model("Employee");
var EmployeeAud = mongoose.model("EmployeeAudit");

exports.findAllEmployee = function(req, res) {
  Employee.find({})
    .exec()
    .then(e => {
      res.status(200).send(e);
    });
};

exports.addEmployee = function(req, res) {
  if (validator.isEmpty(req.body.name) || validator.isEmpty(req.body.lastName)
    || validator.isEmpty(req.body.expedient) || validator.isEmpty(req.body.status)
    || validator.isEmpty(req.body.nfcTag)) {res.status(500).send(String("No puede haber campos vacios"));return;}
  if (!validator.matches(req.body.name, /^[a-z .'-]+$/i)) {res.status(500).send(String("El nombre debe contener solo letras."));return;}
  if (!validator.matches(req.body.lastName, /^[a-z .'-]+$/i)) {res.status(500).send(String("El Apellido debe contener solo letras."));return;}
  if (!validator.isAlphanumeric(req.body.expedient)) {res.status(500).send(String("El legajo debe contener letras y numeros unicamente."));return;}
  if (!validator.isAlpha(req.body.status)) {res.status(500).send(String("El estado debe contener solo letras."));return;}

  //TODO investigar promises y ver si se puede mejorar usandolo.
  this.duplicatedEmployee(
    undefined,
    { $or:[ {nfcTag: req.body.nfcTag}, {expedient: req.body.expedient} ]}, //La query que va a usar el find para ver si esta duplicado     
    function(err, exist) {
      if (exist) {
        res.status(500)
           .send(String("Ya exite un usuario con el mismo legajo o numero de sube."));
      } else {
          const employee = new Employee({
            name: req.body.name,
            lastName: req.body.lastName,
            expedient: req.body.expedient,
            nfcTag: req.body.nfcTag,
            status: req.body.status,
            scheduleWorkTime: req.body.scheduleWorkTime
          });
          
          employee.save(function(err, employee) {
            if (err) {
              res.status(500).send(String(err));
            }else {
              saveAudit(1, employee)
              res.status(200).send(employee);
            }            
          });
      }
    }
  );
};

duplicatedEmployee = function(employeeId, req, result) {
  var context = this;
  Employee.find(req,
    function(err, findEmp) {
      if (err) {
        console.log("error " + err);
        result(err);
      }
      result(null, context.isOtherEmployee(findEmp, employeeId));
    }
  );
};

isOtherEmployee = function(empList, employeeId) {
    if (empList == null) {
      return false;
    }
    const l = empList.filter((e) => {
      return e._id != employeeId;
    });
    return l.length != 0;
};


exports.updateEmployee = function(req, res) {
  if (validator.isEmpty(req.body.name) || validator.isEmpty(req.body.lastName)
    || validator.isEmpty(req.body.expedient) || validator.isEmpty(req.body.status)
    || validator.isEmpty(req.body.nfcTag)) {res.status(500).send(String("No puede haber campos vacios"));return;}
  if (!validator.matches(req.body.name, /^[a-z .'-]+$/i)) {res.status(500).send(String("El nombre debe contener solo letras."));return;}
  if (!validator.matches(req.body.lastName, /^[a-z .'-]+$/i)) {res.status(500).send(String("El nombre debe contener solo letras."));return;}
  if (!validator.isAlphanumeric(req.body.expedient)) {res.status(500).send(String("El legajo debe contener letras y numeros unicamente."));return;}
  if (!validator.isAlpha(req.body.status)) {res.status(500).send(String("El estado debe contener solo letras."));return;}

  //TODO investigar promises y ver si se puede mejorar usandolo.
  this.duplicatedEmployee(
    req.params.id, 
    {$or:[ {nfcTag: req.body.nfcTag}, {expedient: req.body.expedient} ]}, //La query que va a usar el find para ver si esta duplicado
    function(err, exist) {
      if (exist) { //Si encontro uno con el mismo legajo o sube que no sea el empleado mandado en el request
        res.status(500)
           .send(String("Ya exite un usuario con el mismo legajo o numero de sube."));
      } else {
        Employee.findOneAndUpdate(
          { _id: req.params.id },
          {
            name: req.body.name,
            lastName: req.body.lastName,
            expedient: req.body.expedient,
            nfcTag: req.body.nfcTag,
            status: req.body.status,
            scheduleWorkTime: req.body.scheduleWorkTime
          },
          { new: true },
          function(err, updEmpl) {
            if (err) res.status(500).send(String(err));
    
            if (updEmpl == null) {
              res
                .status(404)
                .send("No se econtro ningun empleado con el id : " + req.params.id);
            } else {
              saveAudit(2, updEmpl)
              res.status(200).send(updEmpl);          
            }
          }
        );
      }
    }
  );
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
        saveAudit(3, delEmpl)
        res.status(200).send(delEmpl);
      }
    }
  );
};

exports.findById = function(req, res) {
  Employee.findOne({ _id: req.params.id })
    .exec()
    .then(e => {
      res.status(200).send(e);
    });
};

exports.findAllEmployeeByStatus = function(req, res) {
  Employee.find({status: req.params.status})
    .exec()
    .then(e => {
      res.status(200).send(e);
    });
};

exports.findByExpedient = function(req, res) {
  Employee.findOne({ expedient: req.params.expedient })
    .exec()
    .then(e => {
      res.status(200).send(e);
    });
};

exports.canAccessById = function(req, res) {
  Employee.findOne({ _id: req.params.id })
    .exec()
    .then(e => {
      if (e == null) {
        res.status(403).jsonp("No estas registrado. Por favor registrate para ingresar");
      }
      const authorizedObj = isAuthorized(e);
      authorizedObj.status != 'Unauthorized'
        ? res.status(200).jsonp(authorizedObj.message)
        : res.status(403).jsonp(authorizedObj.message);
    });
};

exports.canAccessByNfcTag = function(req, res) {
  Employee.findOne({ nfcTag: req.params.nfcTag })
    .exec()
    .then(e => {
      if (e == null) {
        res.status(403).jsonp("No estas registrado. Por favor registrate para ingresar");
      }
      const authorizedObj = isAuthorized(e);
      authorizedObj.status != 'Unauthorized'
        ? res.status(200).jsonp(authorizedObj.message)
        : res.status(403).jsonp(authorizedObj.message);
    });
};

const isAuthorized = function(employee) {
  const today = new Date();
  const workTime = employee.scheduleWorkTime.filter(schedule => {
    return schedule.dayNumber == today.getDay();
  })[0];
  
  return employee.status == 'active' 
    ? workTime 
      ? allowedTime(workTime, employee) 
      : {status: 'Unauthorized', message:'No tiene permitido entrar este dia.'}
    : {status: 'Unauthorized', message:'Usted no esta activo y no puede ingresar.'};
};

const allowedTime = function(workTime, employee) {
  let todayHours = moment().get('hour');
  let todayMinutes = moment().get('minute');
  let today = moment(workTime.timeFrom); //Los seteo al mismo mes y año para comparar solo horarios
  //Seteo hora y minutos actuales
  today.hours(todayHours);
  today.minutes(todayMinutes);
  
  const isSame = today.isSame(workTime.timeTo) || today.isSame(workTime.timeFrom)
  return today.isBetween(workTime.timeFrom, workTime.timeTo, []) || isSame
  ? {status: 'Authorized', message:'Bienvenido ' + employee.name} 
  : {status: 'Unauthorized', message:'No puede entrar en este horario '};    
};

const saveAudit = function(revType, usr) {
  const employeeAudit = new EmployeeAud({
    revType: revType,
    name: usr.name,
    lastName: usr.lastName,
    expedient: usr.expedient,
    nfcTag: usr.nfcTag,
    status: usr.status,
    scheduleWorkTime: usr.scheduleWorkTime
  });
  employeeAudit.save((function(err, audit) {
    console.log(err)
  }));
};
