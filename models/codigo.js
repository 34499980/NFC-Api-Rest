exports = module.exports = function(app, mongoose) {
    
        var codigoSchema = new mongoose.Schema({
            codigoSube: { type: String },                      
        });
    
        mongoose.model('Codigo', codigoSchema);
    };