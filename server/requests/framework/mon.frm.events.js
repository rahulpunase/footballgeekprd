const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventsSchema = new Schema({
  teamOne: {
    type: Object,
    require: true
    //done
  },
  teamTwo: {
    type: Object,
    require: true
    //done
  },
  matchDay: {
    type: Number,
    require: true
    //done
  },
  leagueAssociated: {
    type: Schema.ObjectId,
    require: true
    //done
  },
  isCupGame: {
    type: Boolean,
    require: true
    //done
  },
  leg: {
    type: Number
    //done
  },
  round: {
    type: Number
    //done
  },
  matchDate: {
    type: Date
    //done
  },
  teamOneScore: {
    type: Number,
    default: 0
    //done
  },
  teamTwoScore: {
    type: Number,
    default: 0
    //done
  },
  isGameFinished: {
    type: Boolean,
    require: true
  },
  isGameCanceled: {
    type: Boolean,
    require: true
  },
  rowState: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('fg_events', EventsSchema);
