
//File: controllers/tvshows.js
var mongoose = require('mongoose');
var Empleado  = mongoose.model('Empleado');

//GET - Return all tvshows in the DB
exports.findAllEmpleados = function(req, res) {
	Empleado.find(function(err, empleados) {
    if(err) res.send(500, err.message);

    console.log('GET /empleados')
		res.status(200).jsonp(empleados);
	});
};

//POST - Insert a new TVShow in the DB
exports.addEmpleado = function(req, res) {
	console.log('POST');
	console.log(req.body);

	var empleado = new Empleado({
		nombre:    req.body.nombre,
		apellido: 	  req.body.apellido,
		legajo:  req.body.legajo,
		IdSube:   req.body.idSube		
	});

	empleado.save(function(err, empleado) {
		if(err) return res.send(500, err.message);
    res.status(200).jsonp(empleado);
	});
}