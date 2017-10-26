exports = module.exports = function(mongoose) {
    
    var employeeAudSchema = new mongoose.Schema({
        revType:    { type: Number, required: true },//1-create, 2-update, 3-delete
        name: { type: String, required: true },
        lastName: { type: String, required: true },
        expedient: { type: String, required: true },
        nfcTag: { type: String, required: true },
        status: { type: String, required: true },
        scheduleWorkTime: [
          {
            dayNumber: { type: Number },
            timeFrom: { type: Number },
            timeTo: { type: Number }
          }
        ]
      }
    );

    mongoose.model('EmployeeAudit', employeeAudSchema);
 };