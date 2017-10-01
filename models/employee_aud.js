exports = module.exports = function(app, mongoose) {
    
    var employeeAudSchema = new mongoose.Schema({
        revType:    [{ type: Number, desc: String}],
        expedient:  { type: String, required: true },
        nfcTag:  	{ type: Schema.Types.ObjectId, ref: 'Code', required: true },     
        status:     { type: Schema.Types.ObjectId, ref: 'Status', required: true },
        description: { type: String, required: true}
    });

    mongoose.model('EmployeeAudit', employeeAudSchema);
 };