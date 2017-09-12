var express = require('express')
var mongoose = require('mongoose')
var app = express();

mongoose.connect('mongodb://localhost/empleado', function (err, res) {
    if (err) console.log('ERROR: Conectando a la BD' + err);
    else console.log('Conexion  a la BD realizada');
});
//si no es localhost, se le pone el puerto en mongodb

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});

app.get('/', function (rec, res) {
    res.send('Hola, Mundo!');
});
//require('./routes', routes);
app.listen(5000);
console.log('Servidor express escuchando en el puerto 5000');
