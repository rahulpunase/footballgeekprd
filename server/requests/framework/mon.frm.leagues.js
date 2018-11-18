const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LeaguesSchema = new Schema({
  entity_id: {
    type: String,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  league_country: {
    type: String,
    require: true
  },
  img_path: {
    type: String,
    default: ''
  },
  rowstate: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    default: 'L'
  }
});

module.exports = mongoose.model("fg_leagues", LeaguesSchema);
