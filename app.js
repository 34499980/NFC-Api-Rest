var cors = require('cors');
var config = require('./config');
var express     = require('express'),
app             = express(),
bodyParser      = require('body-parser'),
methodOverride  = require('method-override'),
mongoose        = require('mongoose'),
port = 3000


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
var workDaytimeModel = require('./models/workDaytime')(mongoose)
var employeeModel = require('./models/employee')(mongoose)
var employeeAudModel = require('./models/employeeAud')(mongoose)
var employeeController = require('./controllers/employee')
var codeController = require('./controllers/code')

// API routes
var nfcRoutes = express.Router();

nfcRoutes.route('/employee')
.get(employeeController.findAllEmployee)
.post(employeeController.addEmployee);
//.put(EmpleadosCtrl.updateEmpleado);
//.delete(EmpleadosCtrl.deleteEmpleado);

nfcRoutes.route('/employee/:id')
.get(employeeController.findById)
.put(employeeController.updateEmployee)
.delete(employeeController.deleteEmployee);

nfcRoutes.route('/employee/byExpedient/:expedient')
.get(employeeController.findByExpedient);

nfcRoutes.route('/employee/canAccess/:id')
.get(employeeController.canAccess);

nfcRoutes.route('/code')
.get(codeController.getCode)
.post(codeController.addCode);

app.use('/api', nfcRoutes);

// Start server
module.exports = app.listen(port, function() {
	console.log('Node server running on http://localhost:' + port);
});