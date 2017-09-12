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
var models     = require('./models/empleado')(app, mongoose)
var NfcCtrl = require('./controllers/nfc')

// API routes
var nfcRoutes = express.Router();

nfcRoutes.route('/empleados')
.get(NfcCtrl.findAllEmpleados)
.post(NfcCtrl.addEmpleado);

// tvshows.route('/empleados/:id')
// .get(TVShowCtrl.findById)
// .put(TVShowCtrl.updateTVShow)
// .delete(TVShowCtrl.deleteTVShow);

app.use('/api', nfcRoutes);

// Start server
app.listen(3000, function() {
console.log("Node server running on http://localhost:3000");
});