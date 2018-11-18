const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const InsertNews = new Schema({
  title: {
    type: String,
    required: true
  },
  href: {
    type: String,
    required: true
  },
  heading: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  newsBy: {
    type: Object,
    default: {
      "source" : "One Football",
      "sourceUrl" : "https://onefootball.com/en/home",
      "sourceOwner" : "",
      "sourceType" : "Copy Paste",
      "wasPermitted" : false
    }
  },
  associatedClub: {
    type: Array
  },
  associatedCountry: {
    type: Array
  },
  associatedLeague: {
    type: Array
  },
  imagepath: {
    type: String,
    default: ""
  },
  rowstate:{
    type: Number,
    default: 1
  }
});

// InsertNews.pre('save', function(next){
//   const replaced = this.title.replace(/[^a-zA-Z ]/gm, "")
//   const sp = replaced.replace(" ", "-");
//   this.title = sp;
//   next();
// })

InsertNews.methods.replcaeForHref = function(href) {
  this.href =  href.replace(/[^a-zA-Z ]/gm, "").replace(/\s/g, "-");
}

module.exports = mongoose.model("fg_new", InsertNews);
