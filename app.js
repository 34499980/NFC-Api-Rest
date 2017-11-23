var cors = require('cors');
var config = require('./config');
var express     = require('express'),
app             = express(),
bodyParser      = require('body-parser'),
methodOverride  = require('method-override'),
mongoose        = require('mongoose'),
port = 3000
var server = app.listen(port);
var io = require('socket.io').listen(server);
//Web socker for nfc events
io.on('connection', function(){ console.log("Web socket conectado"); });


// Connection to DB
mongoose.connect(config.mongoURI[app.settings.env], function(err, res) {
	if(err){
		console.log ('ERROR connecting to: ' + config.mongoURI[app.settings.env] + '. ' + err);
		throw err;
	} else {console.log('Connected to Database ' + config.mongoURI[app.settings.env]);} 
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(cors({origin: 'http://localhost:8080'}));

// Import Models and controllers
var codeModel = require('./models/code')(mongoose)
var statusModel = require('./models/status')(mongoose)
var employeeModel = require('./models/employee')(mongoose)
var employeeAudModel = require('./models/employeeAud')(mongoose)
var accessAuditModel = require('./models/accessAudit')(mongoose)
var employeeController = require('./controllers/employee')
var reportAccessController = require('./controllers/reportAccess')

// API routes
var nfcRoutes = express.Router();

nfcRoutes.route('/employee')
.get(employeeController.findAllEmployee)
.post(employeeController.addEmployee);
//.put(EmpleadosCtrl.updateEmpleado);
//.delete(EmpleadosCtrl.deleteEmpleado);

nfcRoutes.route('/employee/byStatus/:status')
.get(employeeController.findAllEmployeeByStatus);

nfcRoutes.route('/employee/:id')
.get(employeeController.findById)
.put(employeeController.updateEmployee)
.delete(employeeController.deleteEmployee);

nfcRoutes.route('/employee/byExpedient/:expedient')
.get(employeeController.findByExpedient);

nfcRoutes.route('/employee/canAccess/byId/:id')
.get(employeeController.canAccessById);

nfcRoutes.route('/employee/canAccess/byNfcTag/:nfcTag')
.get(employeeController.canAccessByNfcTag);

nfcRoutes.route('/code')
.post((req, res) => {
	io.emit('nfc-tag', {type:'new-nfc-tag', text: req.body.nfcTag}); 
	res.status(200).jsonp(req.body);
});

nfcRoutes.route('/reports/byRejectedSubeTag')
.get(reportAccessController.findAllSubeTagInfoRejected)

nfcRoutes.route('/reports/byEmployeeEnterToday')
.get(reportAccessController.findAllEmployeeInfoEnterToday)

app.use('/api', nfcRoutes);

// Start server
module.exports = app;