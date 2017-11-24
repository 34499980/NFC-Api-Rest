var mongoose = require("mongoose");
var AccessAudit = mongoose.model("AccessAudit");

exports.findAllSubeTagInfoRejected = function(req, res) {
  AccessAudit.find(
  	{ status : 'ERROR' },
    function(err, findAll) {
      if (err) res.status(404).send(String(err));
      if (findAll == null || findAll == '') res.status(404).send("No se econtraron datos de accesos rechazados.");
      else res.status(200).send(findAll);
    }
  );
};

exports.findAllEmployeeInfoEnterToday = function(req, res) {
  var today = new Date();
  var dateTodayFirtHours = new Date(today.getFullYear(), today.getMonth(), today.getDate(), '00','00','00');
  var dateTodayLastHours = new Date(today.getFullYear(), today.getMonth(), today.getDate(), '23','59','59');

  AccessAudit.find(
  	{ status: 'OK', date: {$gte: dateTodayFirtHours, $lt: dateTodayLastHours} },
  	function(err, findAll) {
      if (err) res.status(404).send(String(err));
      if (findAll == null || findAll == '') res.status(404).send("No se econtraron datos de empleados que entraron en el dia.");
      else res.status(200).send(findAll);
    }
  );
};
