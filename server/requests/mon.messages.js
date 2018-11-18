const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MessageSchema = new Schema({

  conversationId: {
    type: Schema.ObjectId,
    required: true
  },
  userId: {
    type: Schema.ObjectId,
    required: true
  },
  messageBody: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('fg_message', MessageSchema);
