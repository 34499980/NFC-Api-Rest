var mongoose = require('mongoose');
var Code  = mongoose.model('Code');

exports.getCode = function(req, res) {
	Code.find(function(err, code) {
    	if(err) res.send(500, err.message);
    	console.log('GET /code')
		res.status(200).jsonp(code);
	});
};

exports.addCode = function(req, res) {
	console.log('POST');
	console.log(req.body);

	var code = new Code({
		nfcTag: req.body.nfcTag				
	});

	code.save(function(err, code) {
		if(err) return res.send(500, err.message);
   		res.status(200).jsonp(code);
	});
}