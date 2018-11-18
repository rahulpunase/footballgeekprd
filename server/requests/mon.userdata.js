const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

// validations...

let emailLengthChecker = email => {
  if (!email) {
    return false;
  } else {
    if (email.length < 5 || email.length > 40) {
      return false;
    } else {
      return true;
    }
  }
};

let emailValidityChecker = email => {
  if (!email) {
    return false;
  } else {
    const regExEmail = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    return regExEmail.test(email);
  }
};

const emailValidators = [
  {
    validator: emailLengthChecker,
    message: "Email must be contain more than 5 characters but no more than 40"
  },
  {
    validator: emailValidityChecker,
    message: "Email must be in correct format"
  }
];

var UserDataSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    validate: emailValidators
  },
  password: {
    type: String,
    required: true
  },
  rowstate: {
    type: Number,
    required: true
  },
  profile_pic_path: {
    type: String,
    default: "assets/img/default_avatar.png"
  },
  profile_pic_path_50_50:{
    type: String,
    default: null
  },
  followers: {
    type: Array,
    default: null
  },
  followings: {
    type: Array,
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  wall_pic: {
    type: {
      'wall_pic': '',
      'wall_x': 0,
      'wall_y': 0
    },
    default: null
  },
  googleUser: {
    type: Object,
    default: null
  },
  club_team_follow: {
    type: Array,
    default: null
  },
  compition_follow: {
    type: Array,
    default: null
  },
  national_team_follow: {
    type: Array,
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

UserDataSchema.pre("save", function(next) {
  // encrypting the password
  if (!this.isModified("password")) {
    return next();
  }else{
    bcrypt.hash(this.password, null, null, (err, hash)=>{
      if(err) return next(err);
      this.password = hash;
      next();
    })
  }
});

UserDataSchema.methods.comparePasswords = function(password){
  return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model("fg_user_data", UserDataSchema);
