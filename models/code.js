exports = module.exports = function(app, mongoose) {
    
    var codeSchema = new mongoose.Schema({
        nfcTag: { type: String }                      
    });

    mongoose.model('Code', codeSchema);
};