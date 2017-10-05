var mongoose = require('mongoose');
var Employee  = mongoose.model('Employee');
var Status  = mongoose.model('Status');
var ScheduleWorkTime  = mongoose.model('WorkDayTime');
var NfcTag  = mongoose.model('Code');

exports.findAllEmployee = function(req, res) {
	Employee.find({})
	.populate("status")
	.populate("scheduleWorkTime")
	.exec()
	.then(e => {
		res.status(200).send(e);
	})
};

exports.addEmployee = function(req, res) {
	const status = new Status(req.body.status);
	const scheduleWorkTime = new ScheduleWorkTime(req.body.scheduleWorkTime)

	status.save(function(err, statusSaved){
		if(err) res.send(500, err.message);

		scheduleWorkTime.save(function(err, hoursSaved){
			if(err) res.send(500, err.message);
			const employee = new Employee({
				name:    req.body.name,
				lastName: 	  req.body.lastName,
				expedient:  req.body.expedient,
				nfcTag:   req.body.nfcTag,
				status: statusSaved._id,		
				scheduleWorkTime: hoursSaved._id
			});
			employee.save(function(err, employee) {
				if(err) res.send(500, err.message);
				
				res.status(200).jsonp(employee);
			});
		})
	});	
};

exports.findById = function(req, res) {
	Employee.findOne({_id: req.params.id})
	.populate("status")
	.populate("scheduleWorkTime")
	.exec()
	.then(e => {
		res.status(200).send(e);
	})
};

exports.findByExpedient = function(req, res) {
	Employee.findOne({expedient: req.params.expedient})
	.populate("status")
	.populate("scheduleWorkTime")
	.exec()
	.then(e => {
		res.status(200).send(e);
	})
};

exports.canAccess = function(req, res) {
	Employee.findOne({_id: req.params.id})
	.populate("status")
	.populate("scheduleWorkTime")
	.exec()
	.then(e => {		
		isAuthorized(e) ? res.status(200).send("Authorized") : res.status(403).send("Unauthorized")
	})
};

const isAuthorized = function (employee) {
	return  employee.status.status == "active" ? true : false;
}

/*exports.updateEmpleado = function(req, res) {
	Empleado.findByIdAndUpdate(function(err, empleados) {
    if(err) res.send(500, err.message);
    console.log('GET /empleados');
		res.status(200).jsonp(empleados);
	});
};*/
