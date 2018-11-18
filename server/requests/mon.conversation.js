const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ConversationSchema = new Schema({

  createdAt: {
    type: Date,
    default: Date.now
  },
  members: {
    type: Object,
    required: true
  },
  messages: {
    type: Array,
    required: true
  }

});

module.exports = mongoose.model('fg_conversation', ConversationSchema);
