exports = module.exports = function(mongoose) {
    
    var codeSchema = new mongoose.Schema({
        nfcTag: { type: String }                      
    });

    mongoose.model('Code', codeSchema);
};