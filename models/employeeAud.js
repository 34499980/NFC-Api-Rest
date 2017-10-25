exports = module.exports = function(mongoose) {
    
    var employeeAudSchema = new mongoose.Schema({
        revType:    { type: Number, required: true },//1-create, 2-update, 3-delete
        expedient:  { type: String, required: true },
        nfcTag:     { type: String, required: true },     
        status:     { type: String, required: true },
        description: { type: String, required: true}
    });

    mongoose.model('EmployeeAudit', employeeAudSchema);
 };