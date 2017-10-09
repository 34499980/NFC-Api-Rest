var mongoose = require("mongoose");
var Employee = mongoose.model("Employee");
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
    });
  });
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
  const workTime = employee.scheduleWorkTime.filter((schedule) => {
	  return schedule.dayNumber == today.getDay();
  })[0];
  
  return (employee.status.status == "active" && allowedTime(workTime)) ? true : false;
};

const allowedTime = function(workTime){
	let allowed = false;
	const today = new Date();
	if (workTime){
		const timeFrom = workTime.timeFrom;
		const timeTo = workTime.timeTo;
		allowed = (today.getHours() >= timeFrom && today.getHours() <= timeTo) ;
	}
	return allowed;
}

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
      return err ? reject('Error al guardar el status') : resolve(savedObj._id);
    });
  });
};

/*exports.updateEmpleado = function(req, res) {
	Empleado.findByIdAndUpdate(function(err, empleados) {
    if(err) res.send(500, err.message);
    console.log('GET /empleados');
		res.status(200).jsonp(empleados);
	});
};*/
