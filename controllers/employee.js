var mongoose = require('mongoose');
var employee  = mongoose.model('Employee');

exports.findAllEmployee = function(req, res) {
	employee.find(function(err, employee) {
    	if(err) res.send(500, err.message);
    	console.log('GET /employee');
		res.status(200).jsonp(employee);
	});
};

exports.addEmployee = function(req, res) {
	console.log('POST');
	console.log(req.body);

	var employee = new employee({
		name:    req.body.name,
		lastname: 	  req.body.lastname,
		expedient:  req.body.expedient,
		nfcTag:   req.body.nfcTag,
		status: req.body.status,		
		scheduleWorkTime: req.body.scheduleWorkTime
	});

	employee.save(function(err, employee) {
		if(err) return res.send(500, err.message);
		console.log('POST /employee');
    	res.status(200).jsonp(employee);
	});
};

exports.findById = function(req, res) {
	employee.findById(req.id ,function(err, employee) {
    	if(err) res.send(500, err.message);
    	console.log('GET /employee/id');
		res.status(200).jsonp(employee);
	});
};

exports.findByExpedient = function(req, res) {
	employee.find({expedient: req.expedient} ,function(err, employee) {
    	if(err) res.send(500, err.message);
    	console.log('GET /employee');
		res.status(200).jsonp(employee);
	});
};

/*exports.updateEmpleado = function(req, res) {
	Empleado.findByIdAndUpdate(function(err, empleados) {
    if(err) res.send(500, err.message);
    console.log('GET /empleados');
		res.status(200).jsonp(empleados);
	});
};*/
