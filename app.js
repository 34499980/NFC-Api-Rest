var express     = require("express"),
app             = express(),
bodyParser      = require("body-parser"),
methodOverride  = require("method-override"),
mongoose        = require('mongoose');

// Connection to DB
mongoose.connect('mongodb://localhost/nfc', function(err, res) {
if(err) throw err;
console.log('Connected to Database');
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

// Import Models and controllers
var empleadoModel = require('./models/empleado')(app, mongoose)
var codigoModel = require('./models/codigo')(app, mongoose)
var EmpleadosCtrl = require('./controllers/empleados')
var CodigoCtrl = require('./controllers/codigo')

// API routes
var nfcRoutes = express.Router();

nfcRoutes.route('/empleados')
.get(EmpleadosCtrl.findAllEmpleados)
.post(EmpleadosCtrl.addEmpleado);

// nfcRoutes.route('/empleados/:id')
// .get(EmpleadosCtrl.findById)
// .put(EmpleadosCtrl.updateEmpleado)
// .delete(EmpleadosCtrl.deleteEmpleado);


nfcRoutes.route('/codigo')
.get(CodigoCtrl.getCodigo)
.post(CodigoCtrl.addCodigo);

app.use('/api', nfcRoutes);

// Start server
app.listen(3000, function() {
console.log("Node server running on http://localhost:3000");
});