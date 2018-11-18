const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserLoginDetails = new Schema({
  userid: {
    type: Schema.ObjectId,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  loggedinAt:{
    type: Date,
    default: Date.now
  },
  loggedinFromBrowser:{
    type: String
  },
  ipAddress: {
    type: String,
    default: ""
  },
  rowstate:{
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model("fg_userlogin_details", UserLoginDetails);
