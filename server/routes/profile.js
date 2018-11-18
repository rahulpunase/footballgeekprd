const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const UserDataSchema = require('../requests/mon.userdata');
const multer = require('multer');
const path = require('path');
const mkdirp = require('mkdirp');
const loggerServices = require('../loggerServices/loggerServices');
const CONSTANTS = require('../utils/footbalgeekContants');

router.use((req, res, next) => {
  const token = req.headers["auth"];
  if (!token) {
    res.json({
      success: false,
      message: "No token provided"
    });
    loggerServices.write(CONSTANTS.const_token_error_message);
  } else {
    jwt.verify(token, "football_geek", (err, token) => {
      if (err) {
        res.json({
          success: false,
          message: "Token Invalid",
          err
        });
      } else {
        req.decoded = token;
        next();
      }
    });
  }
});

const storageForWalls = multer.diskStorage({
  destination: function (req, file, cb) {
    const directory = './public/images/walls/' + req.headers.toappendinpath + '/';
    mkdirp.sync(directory);
    cb(null,
    directory
    )
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const storeAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    const directory = './public/avatars/' + req.headers.toappendinpath + '/';
    mkdirp.sync(directory);
    cb(null,
    directory
    )
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const uploadWall = multer({
  storage: storageForWalls
}).single('wall_edit_media')

const uploadAvatar = multer({
  storage: storeAvatar
}).single("avatar_edit_media");

// SAVE EDITED WALL
router.post('/saveeditedwall', (req, res) => {
  loggerServices.write("/saveeditedwall");
  UserDataSchema.findOne({
    _id: mongoose.Types.ObjectId(req.decoded.userId)
  }).exec().then(user => {
    uploadWall(req, res, err => {
      if (err) {
        res.json({
          success: false,
          message: 'Wall image could not be uploaded',
          err: err
        });
      } else {
        const data = req.body;
        let path = '';
        if (req.file === undefined) {
          path = user.wall_pic.wall_pic_path;
        } else {
          const temp = req.file.destination + req.file.filename;
          let pathToSave = temp.substring(9, temp.length);
          path = data.domain + '/' + pathToSave;
        }
        UserDataSchema.update(
          { _id: mongoose.Types.ObjectId(data.user_id) },
          {
            $set: {
              'wall_pic': {
                'wall_pic_path': path,
                'wall_x': Number(data.img_X.substring(0, data.img_X.length - 2)),
                'wall_y': Number(data.img_Y.substring(0, data.img_Y.length - 2))
              }
            }
          }
        ).exec((err) => {
          if (err) {
            res.json({
              success: false,
              message: 'Wall image could not be uploaded',
              err: err
            });
          } else {
            res.json({
              success: true,
              message: 'Wall image Changed',
              err: err
            });
          }
        })
      }
    }); // all in here
  }).catch(error => {
    res.json({
      success: false,
      message: 'No user found',
      err: error
    })
  })
});

router.post('/saveeditedprofile', (req, res) => {
  loggerServices.write("/saveeditedprofile");
  uploadAvatar(req, res, err => {
    if (err) {
      loggerServices.write(CONSTANTS.const_file_upload_error_message);
      res.json({
        success: false,
        message: "Error in uploading",
        err: err
      });
    } else {
      const data = req.body;
      let path = 'assets/img/default_avatar.png';
      if (req.file === undefined) {
        if (data.old_path === path) {
          // nothing...
        } else {
          path = data.old_path;
        }
      } else {
        const temp = req.file.destination + req.file.filename;
        let pathToSave = temp.substring(9, temp.length);
        path = data.domain + '/' + pathToSave;
      }
      UserDataSchema.update(
        { _id: mongoose.Types.ObjectId(data.user_id) },
        {
          $set: {
            name: data.fullname_edit,
            bio: data.bio_edit,
            profile_pic_path: path
          }
        }
      ).exec((err)=>{
        if(err) {
          loggerServices.write(CONSTANTS.const_file_upload_error_message);
          res.json({
            success: false,
            message: "Error in uploading",
            err: err,
            uploaded: true
          });
        } else {
          loggerServices.write(CONSTANTS.const_data_successfully_sent);
          res.json({
            success: true,
            message: "Profile updated."
          });
        }
      })
    }
  });
});



router.get('/whoseprofile/:username', (req, res) => {
  const username = req.params.username;
  loggerServices.write("/whoseprofile/" + username);
  if (!username) {
    loggerServices.write(CONSTANTS.const_username_error_message);
    res.json({
      success: false,
      message: 'Provide Username'
    });
  } else {
    UserDataSchema.find({
      username: username,
      rowstate: 1
    })
      .select("_id name username followers followings profile_pic_path bio wall_pic")
      .exec((err, user) => {
        if (err) {
          loggerServices.write(CONSTANTS.const_db_error_in_selecting_data);
          res.json({
            success: false,
            message: 'Some error occurred',
            err: err
          });
        } else {
          if (!user) {
            res.json({
              success: false,
              message: 'No user found'
            });
          } else {
            loggerServices.write(CONSTANTS.const_data_successfully_sent);
            res.json({
              success: true,
              whoseProfileUser: user
            });
          }
        }
      });
  }
});

module.exports = router;

