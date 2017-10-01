var express     = require("express"),
app             = express(),
bodyParser      = require("body-parser"),
methodOverride  = require("method-override"),
mongoose        = require('mongoose'),
port = 3000,
mongodbURI = 'mongodb://localhost/nfc';

// Connection to DB
mongoose.connect(mongodbURI, function(err, res) {
	if(err){
		console.log ('ERROR connecting to: ' + mongodbURI + '. ' + err);
		throw err;
	} else {console.log('Connected to Database Successfull.');} 
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

// Import Models and controllers

var codeModel = require('./models/code')(app, mongoose)
var statusModel = require('./models/status')(mongoose)
var workDaytimeModel = require('./models/workDaytime')(mongoose)
var employeeModel = require('./models/employee')(app, mongoose)
var employeeController = require('./controllers/employee')
var codeController = require('./controllers/code')

// API routes
var nfcRoutes = express.Router();

nfcRoutes.route('/employee')
.get(employeeController.findAllEmployee)
.post(employeeController.addEmployee);

nfcRoutes.route('/employee/:id')
.get(employeeController.findById)
.get(employeeController.findByExpedient);
//.put(EmpleadosCtrl.updateEmpleado);
// .delete(EmpleadosCtrl.deleteEmpleado);


nfcRoutes.route('/code')
.get(codeController.getCode)
.post(codeController.addCode);

app.use('/api', nfcRoutes);

// Start server
app.listen(port, function() {
	console.log('Node server running on http://localhost:' + port);
});