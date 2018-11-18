let Jimp = require("jimp");
let Promise = require("bluebird");
const path = require("path");
const fileType = require("file-type");

module.exports = {
  processImageFiles(file) {
    Jimp.read(file.path)
      .then(image => {
        image
          .resize(100, 100) // resize
          .quality(100) // set JPEG quality
          .write(file.destination + '/' + file.filename.split(".")[0] + '-sm-50.' + file.filename.split(".")[1]); // save
      })
      .catch(error => {
        console.log(error);
      });
  }
};
