exports = module.exports = function(mongoose) {
    
    var workDaytime = new mongoose.Schema({
        name:       { type: String },
        timeFrom:   { type: Number },
        timeTo:     { type: Number }
    });

    mongoose.model('WorkDayTime', workDaytime);
 };