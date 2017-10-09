exports = module.exports = function(mongoose) {
    
    var statusSchema = new mongoose.Schema({
        status:   { type: String, enum: ['active', 'suspended', 'inactive'], default: ['inactive']}       
    });

    mongoose.model('Status', statusSchema);
 };