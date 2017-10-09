exports = module.exports = function(mongoose) {
  var workDaytime = new mongoose.Schema({
    dayNumber: { type: Number },
    timeFrom: { type: Number },
    timeTo: { type: Number },
  });

  mongoose.model("WorkDayTime", workDaytime);
};
