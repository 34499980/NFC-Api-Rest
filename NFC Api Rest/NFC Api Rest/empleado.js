var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var empleado = new Schema({
    nombre: String,
    apellido: String,
    legajo: String,
    IdSube: String
});

module.exports = mongoose.module('Empleado', empleado);