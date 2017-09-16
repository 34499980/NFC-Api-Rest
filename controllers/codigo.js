var mongoose = require('mongoose');
var Codigo  = mongoose.model('Codigo');

exports.getCodigo = function(req, res) {
	Codigo.find(function(err, codigo) {
    if(err) res.send(500, err.message);

    console.log('GET /codigo')
		res.status(200).jsonp(codigo);
	});
};

exports.addCodigo = function(req, res) {
	console.log('POST');
	console.log(req.body);

	var codigo = new Codigo({
		codigoSube:	req.body.codigoSube,				
	});

	codigo.save(function(err, codigo) {
		if(err) return res.send(500, err.message);
    res.status(200).jsonp(codigo);
	});
}