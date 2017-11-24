exports = module.exports = function(mongoose) {

  var accessAuditSchema = new mongoose.Schema({
    nfcTag: { type: String, required: true },
    status: {type: String, required: true },
    date : { type: Date, default: Date.now },
    description: { type: String, required: true },
    employeeFullName: { type: String },
    employeeExpedient: { type: String }
  });

  mongoose.model("AccessAudit", accessAuditSchema);
};