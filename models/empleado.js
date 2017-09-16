exports = module.exports = function(app, mongoose) {
    
        var empleadoSchema = new mongoose.Schema({
            nombre:     { type: String },
            apellido:   { type: String },
            legajo:     { type: String },
            IdSube:  	{ type: String },            
        });
    
        mongoose.model('Empleado', empleadoSchema);
    
    };