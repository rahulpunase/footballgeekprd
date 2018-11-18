const mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PostsSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  createdBy: {
    type: Object,
    required: true
  },
  idOfcreatedBy: {
    type: Schema.ObjectId,
    required: true
  },
  isImageContains: {
    type: Boolean,
    default: false
  },
  postImagePath: {
    type: String,
    default: null
  },
  post_pic_detail:{
    type: Object,
    default :{}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updateAction: {
    type: String,
    default: null
  },
  likes: {
    type:Number,
    default: 0
  },
  likedBy: {
    type: Array,
    default: null
  },
  __fn__all_comments:{
    type: Array,
    default: null
  },
  isCommentAllowed: {
    type: Boolean,
    default: true
  },
  rowstate:{
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('fg_post', PostsSchema);
