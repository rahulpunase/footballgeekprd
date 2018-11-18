const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CommentsSchema = new Schema({
  postId: {
    type: Schema.ObjectId,
    required: true
  },
  userId: {
    type: Schema.ObjectId,
    required: true
  },
  content: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: null
  },
  lastUpdateAction: {
    type: String,
    default: null
  },
  token: {
    type: String,
    required: true,
  },
  location: {
    type: Object,
    default: null
  },
  rowState: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model("fg_comments_on_posts", CommentsSchema);
