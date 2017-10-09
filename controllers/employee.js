var mongoose = require('mongoose');
var Employee  = mongoose.model('Employee');
var EmployeeAud = mongoose.model('EmployeeAudit');
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

	//chequeo si ya existe un usuario con el mismo nombre apellido y legajo.
	this.existEmployeeByFullNameAndExpedient({name: req.body.name, lastName: req.body.lastName, expedient: req.body.expedient}, function(err, exist) {
		if(exist) res.status(500).send(String("Ya exite un usuario con el mismo nombre, apellido y legajo."));
	});

	const status = new Status({status: req.body.status});
	const scheduleWorkTime = new ScheduleWorkTime({name: req.body.scheduleWorkTime.name, timeFrom: req.body.scheduleWorkTime.timeFrom, 
									timeTo: req.body.scheduleWorkTime.timeTo});

	status.save(function(err, statusSaved){
		if(err) res.status(500).send(String(err));

		scheduleWorkTime.save(function(err, hoursSaved){
			if(err) res.status(500).send(String(err));

			const employee = new Employee({
				name:    req.body.name,
				lastName: 	  req.body.lastName,
				expedient:  req.body.expedient,
				nfcTag:   req.body.nfcTag,
				status: statusSaved._id,		
				scheduleWorkTime: hoursSaved._id
			});

			employee.save(function(err, employee) {
				if(err) res.status(500).send(String(err));
				res.status(201).jsonp(employee);
			});

			const employeeAudit = new EmployeeAud({revType : 1, expedient : req.body.expedient, nfcTag: req.body.nfcTag, 
										status: statusSaved._id, description: "creacion de empleado"});

			employeeAudit.save(function(err, auditSaved){
				if(err) res.status(500).send(String(err));
			});
		});
	});	
};

existEmployeeByFullNameAndExpedient = function(req, result){
	 Employee.findOne({name: req.name, lastName: req.lastName, expedient: req.expedient}, function(err, findEmp){
 		if(err) {
 			console.log("error " + err);
  			result(err);
  		}
  		console.log("empleado : " + findEmp);
  		result(null, findEmp != null);
	 });
};

exports.updateEmployee = function(req, res) {
	console.log('PUT /empleado');

	Employee.findOneAndUpdate({_id: req.params.id}, {name: req.params.name, lastName: req.params.lastName, 
			expedient: req.params.expedient, nfcTag: req.params.nfcTag, status: new Status({status: req.params.status}), 
			scheduleWorkTime: req.params.scheduleWorkTime}, {new: true}, function(err, updEmpl){
	    
	    if(err) res.status(500).send(String(err));
	 	console.log("updEmpl " + updEmpl);

		if(updEmpl == null) res.status(404).send("No se econtro ningun empleado con el id : " + req.params.id);

	    const employeeAudit = new EmployeeAud({revType : 2, expedient : updEmpl.expedient, nfcTag: updEmpl.nfcTag, 
	    							status: updEmpl.status, description: "modificacion del empleado"});

		employeeAudit.save(function(err, auditSaved){
			console.log("employeeAudit : " + auditSaved);
			if(err) res.status(500).send(String(err));
			res.status(200).jsonp(updEmpl);
		});
	});
};

//change status to inactive to employee.
exports.deleteEmployee = function(req, res) {
		console.log('DEL-PUT /empleado');
		Employee.findOneAndUpdate({_id: req.params.id}, {status: new Status({status: 'inactive'})}, {new: true}, function(err, delEmpl){
		    if(err) res.status(500).send(String(err));
			
		    console.log("delEmp " + delEmpl);

		    if(delEmpl == null) res.status(404).send("No se econtro ningun empleado con el id : " + req.params.id);

	    	const employeeAudit = new EmployeeAud({revType : 3, expedient : delEmpl.expedient, nfcTag: delEmpl.nfcTag, 
	    							status: delEmpl.status, description: 'modificacion del estado del empleado. (inactivo).'});

			employeeAudit.save(function(err, auditSaved){
				console.log("employeeAudit : " + auditSaved);
				if(err) res.status(500).send(String(err));
				res.status(200).jsonp(delEmpl);
			});
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
