exports = module.exports = function(mongoose) {
  var employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    expedient: { type: String, required: true },
    nfcTag: { type: String, required: true },
    status: { type: String, required: true },
    scheduleWorkTime: [
      { type: mongoose.Schema.Types.ObjectId, ref: "WorkDayTime" }
    ]
  });

  mongoose.model("Employee", employeeSchema);
};
