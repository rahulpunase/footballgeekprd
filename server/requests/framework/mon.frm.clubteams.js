const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CLubTeamsSchema = new Schema({
  entity_id: {
    type: String,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  short_name: {
    type: String,
    require: true
  },
  league: {
    type: Schema.ObjectId,
    require: true
  },
  img_path: {
    type: String,
    default: null
  },
  famouus_factor: {
    type: Number
  },
  rowstate: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    default: 'T'
  }
});

module.exports = mongoose.model("fg_all_team_masters", CLubTeamsSchema);
