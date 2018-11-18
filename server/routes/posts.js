const express = require("express");
const router = express.Router();
const PostSchema = require("../requests/mon.posts");
const UserDataSchema = require("../requests/mon.userdata");
const CommentsSchema = require("../requests/mon.comments");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
let mkdirp = require('mkdirp');
let imgProcessing = require('../utils/imageprocessing');
const activityLog = require('../middlewares/middle.useractivitylog');
// post.js
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const directory = "./public/images/posts/" + req.headers.toappendinpath + "/";
    mkdirp.sync(directory);
    callback(
      null,
      directory
    );
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-posts-" + Date.now() + path.extname(file.originalname)
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

const upload = multer({
  storage: storage
}).single("media");

const uploadAvatar = multer({
  storage: storeAvatar
}).single("avatar");

router.use((req, res, next) => {
  const token = req.headers["auth"];
  if (!token) {
    res.json({
      success: false,
      message: "No token provided"
    });
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

router.post("/savepost", (req, res, next) => {
  upload(req, res, err => {
    if (err) {
      res.json({
        success: false,
        message: "No file uploaded",
        fileUploaded: false,
        err: err
      });
    } else {
      //console.log(req);
      let post;
      if (req.file === undefined) {
        post = new PostSchema({
          content: req.body.content,
          createdBy: {
            _id: req.body.createdBy__id,
            name: req.body.createdBy_name,
            username: req.body.createdBy_username,
            email: req.body.createdBy_email
          },
          idOfcreatedBy: req.body.createdBy__id
        });
      } else {

        const temp = req.file.destination + req.file.filename;
        const pathToSave = temp.substring(9, temp.length);
        // console.log(pathToSave);
        post = new PostSchema({
          content: req.body.content,
          createdBy: {
            _id: req.body.createdBy__id,
            name: req.body.createdBy_name,
            username: req.body.createdBy_username,
            email: req.body.createdBy_email
          },
          idOfcreatedBy: req.body.createdBy__id,
          postImagePath: pathToSave,
          isImageContains: true,
          profile_pic_detail: req.file
        });
      }

      post.save(err => {
        if (err) {
          next(new Error("Mongo db error"));
          res.json({
            success: false,
            message: "Not saved",
            fileUploaded: true,
            err: err
          });
        } else {
          // fetching recent post form user...
          recentPostFromUserId(req, res, next);
          /*res.json({
            success: true,
            message: "Post is successfully created",
            fileUploaded: true
          });*/
        }
      });
    }
  });
});


function recentPostFromUserId(req, res, next){
  // fetching recent post from user...
  PostSchema.aggregate([
    {
      $match: {
        rowstate: 1,
        "idOfcreatedBy": mongoose.Types.ObjectId(req.body.createdBy__id)
      }
    },
    {
      $lookup: {
        from: "fg_user_datas",
        localField: "idOfcreatedBy",
        foreignField: "_id",
        as: "user_details"
      }
    },
    { $unwind: "$user_details" },
    {
      $project: {
        _id: 1,
        comments: 1,
        content: 1,
        createdAt: 1,
        isImageContains: 1,
        likedBy: 1,
        likes: 1,
        postImagePath: 1,
        post_pic_detail: 1,
        __fn__all_comments: 1,
        profile_pic_path: "$user_details.profile_pic_path",
        googleUser: "$user_details.googleUser",
        createdBy_id: "$user_details._id",
        createdByName: "$user_details.name",
        createdByUsername: "$user_details.username",
        profile_pic_path_50_50: "$user_details.profile_pic_path_50_50"
      }
    },
    {
      "$sort": { "createdAt": -1 }
    },
    {
      "$limit": 1
    }
  ]).exec().then(post => {
    const activity = req.body.activity;
    const actJs = JSON.parse(activity);
    actJs["post"] = post;
    req.body.activity = actJs;
    activityLog(req, res, next);
    res.json({
      success: true,
      message: "Post is successfully created.",
      fileUploaded: true,
      currentPost: post
    });
  }).catch(error => {
    next(new Error(error));
    res.json({
      success: false,
      message: "Post cannot be created.",
      error: error
    });
  })
}

router.post("/uploadavatar", (req, res) => {
  uploadAvatar(req, res, err => {
    const data = req.body;
    if (err) {
      res.json({ success: false, message: "File couldn't be uploaded" });
    } else {
      UserDataSchema.findOne({ _id: data.userid }).exec((err, user) => {
        if (err) {
          res.json({
            success: false,
            message: "File saved, But error occured",
            err: err,
            datasaved: false
          });
        } else {
          if (!user) {
            res.json({
              success: false,
              message: "File saved, User not found",
              err: err,
              dataSaved: false
            });
          } else {
            let pathToSave;
            let temp;
            if (req.file == undefined) {
              pathToSave = req.body.default_avatar;
              user.profile_pic_path = pathToSave;
              user.profile_pic_path_50_50 = null;
            } else {
              imgProcessing.processImageFiles(req.file);
              temp = req.file.destination + req.file.filename;
              pathToSave = temp.substring(9, temp.length);
              user.profile_pic_path = data.domain + pathToSave;
              user.profile_pic_path_50_50 = data.domain + pathToSave.split(".")[0] + '-sm-50.' + pathToSave.split(".")[1];
            }
            user.save(err => {
              if (!err) {
                res.json({
                  success: true,
                  message: "Profile Avatar successfully changed"
                });
              } else {
                res.json({ success: false, message: "Data not saved" });
              }
            });
          }
        }
      });
    }
  });
});




router.get("/getallposts", (req, res) => {
  const userId = req.decoded.userId;
  PostSchema.aggregate([
    {
      $lookup: {
        from: "fg_user_datas",
        localField: "idOfcreatedBy",
        foreignField: "_id",
        as: "user_details"
      }
    },
    { $unwind: "$user_details" },
    {
      $match: {
        rowstate: 1
      }
    },
    {
      $project: {
        _id: 1,
        comments: 1,
        content: 1,
        createdAt: 1,
        isImageContains: 1,
        likedBy: 1,
        likes: 1,
        postImagePath: 1,
        post_pic_detail: 1,
        __fn__all_comments: 1,
        profile_pic_path: "$user_details.profile_pic_path",
        googleUser: "$user_details.googleUser",
        createdBy_id: "$user_details._id",
        createdByName: "$user_details.name",
        createdByUsername: "$user_details.username",
        profile_pic_path_50_50: "$user_details.profile_pic_path_50_50",
        loggedInUserLikedIt: {
          $in: [mongoose.Types.ObjectId(userId), "$likedBy"]
        }
      }
    }
  ])
    .sort({ _id: -1 })
    .exec((err, posts) => {
      if (err) {
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          posts: posts
        });
      }
    });
});



router.get("/getsinglepost", (req, res) => {
  UserDataSchema.findOne({ _id: req.decoded.userId })
    .select("_id name username email")
    .exec((err, user) => {
      if (err) {
        res.json({
          success: false,
          message: "No user found"
        });
      } else {
        if (!user) {
          res.json({
            success: false,
            message: "No user found"
          });
        } else {
          PostSchema.findOne({
            idOfcreatedBy: user._id
          })
            .sort({ _id: -1 })
            .exec((err, post) => {
              if (err) {
                res.json({
                  success: false,
                  message: "Error in find Data"
                });
              } else {
                if (!post) {
                  res.json({
                    success: false,
                    message: "No post found"
                  });
                } else {
                  res.json({
                    success: true,
                    message: "Post Found",
                    post: post
                  });
                }
              }
            });
        }
      }
    });
});

router.get("/getsinglepostwithid/:postid", (req, res) => {
  const userid = req.decoded.userId;
  const postid = req.params["postid"];
  PostSchema.aggregate([{
    $match: { 
      _id: mongoose.Types.ObjectId(postid), 
      rowstate: 1 }
  },
  {
      $lookup: { 
        from: "fg_user_datas",
        localField: "idOfcreatedBy",
        foreignField: "_id",
        as: "user"
     }
  },
  { $unwind: "$user" },
  {
      $project: {
        "_id" : 1,
	    "isImageContains" : 1,
	    "postImagePath" : 1,
	    "updateAction" : 1,
	    "likes" : 1,
	    "likedBy": 1,
	    "isCommentAllowed" :1,
	    "content": 1,
	    "createdAt": 1,
	    "post_pic_detail": 1,
	    "user.username": "$user.username",
	    "user.name": "$user.name",
	    "user.profile_pic_path": "$user.profile_pic_path",
      "user.profile_pic_path_50_50": "$user.profile_pic_path_50_50",
      "loggedInUserLikedIt": {
        $in: [mongoose.Types.ObjectId(userid), "$likedBy"]
      }
      }
  }
  ]).exec().then(
    firststdata => {
      const postData = firststdata[0];
      //const likedByMapped = postData.likedBy.map(e => mongoose.Types.ObjectId(e));
      UserDataSchema.find({
        _id: { $in: postData.likedBy }
      }).select("username name profile_pic_path profile_pic_path_50_50").exec().then(
        userWhoLiked => {
           res.json({
            success: true,
            data: postData,
            userWhoLiked: userWhoLiked
          })
        }
      ).catch(error => {
        res.json({
          sucees: false,
          message: "some error",
          err: error
        });
      })
    }
  ).catch(error => {
    res.json({
      sucees: false,
      message: "some error",
      err: error
    });
  });
});

router.put("/likepost", (req, res, next) => {
  const data = req.body;
  if (!data.postid) {
    res.json({
      success: false,
      message: "No post to like"
    });
  } else {
    if (!data.likedBy) {
      res.json({
        success: false,
        message: "No User provided to like"
      });
    } else {
      // check if the post exist
      PostSchema.findOne({ _id: data.postid, rowstate: 1 }).exec(
        (err, post) => {
          if (err) {
            res.json({
              success: false,
              message: "Something went wrong"
            });
          } else {
            if (!post) {
              res.json({
                success: false,
                message: "No post found for such id"
              });
            } else {
              let found = false;
              for (let obj of post.likedBy) {
                if (obj.toString() === data.likedBy) {
                  found = true;
                  break;
                }
              }
              if (found) {
                res.json({
                  success: false,
                  message: "Cannot like the post again"
                });
              } else {
                post.likedBy.push(mongoose.Types.ObjectId(data.likedBy));
                post.likes++;
                post.save(err => {
                  if (err) {
                    res.json({
                      success: false,
                      message: "Could not save"
                    });
                  } else {
                    activityLog(req, res, next);
                    res.json({
                      success: true,
                      message: "Like posted",
                      count: post.likes
                    });
                  }
                });
              }
            }
          }
        }
      );
    }
  }
});

router.post("/deletepost", (req, res) => {
  const data = req.body;
  if (!data.postId) {
    res.json({ success: false, message: "No id is provided" });
  } else {
    if (!data.user) {
      res.json({ success: false, message: "No user is provided" });
    } else {
      // if post exist
      PostSchema.findOne({ _id: data.postId, rowstate: 1 }).exec(
        (err, post) => {
          if (err) {
            res.json({
              success: false,
              message: "some error occured",
              err: err
            });
          } else {
            if (!post) {
              res.json({ success: false, message: "No post found" });
            } else {
              const postcreatedBy = post.createdBy._id;
              if (postcreatedBy != data.user._id) {
                res.json({
                  success: false,
                  message: "You do not have permission to delete this post."
                });
              } else {
                // delete the post
                post.rowstate = 0;
                post.updateAction = "Delete";
                post.updatedAt = Date.now();
                post.save(err => {
                  if (err) {
                    res.json({
                      success: false,
                      message: "Post cannot be deleted",
                      err: err
                    });
                  } else {
                    res.json({
                      success: true,
                      message: `Post ${data.postId} successfully deleted`
                    });
                  }
                });
              }
            }
          }
        }
      );
    }
  }
});

router.post("/insertcomment", (req, res) => {
  const data = req.body;
  const content = data.content;
  const postId = data.postId;
  const createdBy = data.createdBy;
  const token = data.token;
  if (!createdBy) {
    res.json({ success: false, message: "Created by is not provided" });
  } else {
    if (!content) {
      res.json({ success: false, message: "Content not provided" });
    } else {
      if (!postId) {
        res.json({ success: false, message: "Post is not provided" });
      } else {
        // check if the post exists...
        PostSchema.findOne({ _id: postId, rowstate: 1 }).exec((err, post) => {
          if (err) {
            res.json({ success: false, message: "Some error occurred in fetching post", err: err });
          } else {
            if (!post) {
              res.json({ success: false, message: "Post not found. It is either deleted or moved." });
            } else {
              // insert comment
              const commentSchema = new CommentsSchema({
                postId: mongoose.Types.ObjectId(postId),
                userId: mongoose.Types.ObjectId(createdBy),
                content: content,
                token: token
              });
              commentSchema.save((err) => {
                if (err) {
                  res.json({ success: false, message: "Comment not saved" });
                } else {
                  // fetch the recent comment
                  CommentsSchema.aggregate([
                    {
                      $match: {
                        "userId": mongoose.Types.ObjectId(createdBy),
                        "postId": mongoose.Types.ObjectId(postId),
                        "rowState": 1
                      }
                    },
                    {
                      $lookup: {
                        from: "fg_user_datas",
                        localField: "userId",
                        foreignField: "_id",
                        as: "u"
                      }
                    },
                    {
                      $project: {
                        "_id": 1,
                        "ipAddress": 1,
                        "updatedAt": 1,
                        "location": 1,
                        "content": 1,
                        "createdAt": 1,
                        "token": 1,
                        "u._id": 1,
                        "u.username": 1,
                        "u.name": 1,
                        "u.profile_pic_path": 1
                      }
                    },
                    { $sort: { "createdAt": -1 } }
                  ]).exec((err, comment) => {

                    if (err) {
                      res.json({ success: false, message: "Comment could not be fetched" });
                    } else {
                      res.json({
                        success: true,
                        message: "Comment saved",
                        recentComment: comment
                      });
                    }

                  })
                }
              });
            }
          }
        });
      }
    }
  }
});

router.get("/getcomments/:postid", (req, res) => {
  let postId = req.params.postid;
  if (!postId) {
    res.json({ success: false, message: "request cannot be completed" });
  } else {

    CommentsSchema.aggregate([
      {
        $match:
        {
          "postId": mongoose.Types.ObjectId(postId),
          "rowState": 1
        }
      },
      {
        $lookup: {
          from: "fg_user_datas",
          localField: "userId",
          foreignField: "_id",
          as: "u"
        }
      },
      {
        $project: {
          "_id": 1,
          "ipAddress": 1,
          "updatedAt": 1,
          "location": 1,
          "content": 1,
          "createdAt": 1,
          "token": 1,
          "u._id": 1,
          "u.username": 1,
          "u.name": 1,
          "u.profile_pic_path": 1
        }
      },
      { $sort: { "createdAt": -1 } },
      { $limit: 8 }

    ]).exec((err, comments) => {
      if (err) {
        res.json({
          success: false,
          "message": "Error in fetching comments",
          err: err
        });
      } else {
        //count comments
        CommentsSchema.count({
          "postId": mongoose.Types.ObjectId(postId),
          "rowState": 1
        }
        ).exec((err, count) => {
          if (err) {
            res.json({
              success: false,
              "message": "Error in fetching comment's count",
              err: err
            });
          } else {
            res.json({
              success: true,
              comments: comments,
              count: count
            });
          }
        });
      }
    });
  }
});

router.put("/deletecomment", (req, res) => {
  const data = req.body.com;
  const index = req.body.index;
  PostSchema.findOne({
    _id: mongoose.Types.ObjectId(data._id),
    rowstate: 1,
    "commentsBy.rowstate": 1,
    "commentsBy.createdOnServer": data.commentsBy.createdOnServer
  }).exec((err, post) => {
    if (err) {
      res.json({
        success: false,
        message: "Some internal error occurred",
        err: err
      });
    } else {
      if (!post) {
        res.json({ success: false, message: "No post found" });
      } else {
        // res.json({ success: false, data:  });
        const comments = post.commentsBy;
        for (let i = 0; i < post.commentsBy.length; i++) {
          if (post.commentsBy[i].createdOnServer === data.commentsBy.createdOnServer) {
            post.commentsBy[i].comment = "BABABA AAYA";
            break;
          }
        }
        post.save((err) => {
          if (err) {
            res.json({ sucess: false, message: "Error occurred" });
          } else {
            res.json({ sucess: true, message: "Comment Deleted" });
          }
        });
      }
    }
  });
});

router.get('/getpostforprofile/:username', (req, res) => {
  const username = req.params.username;
  if (!username) {
    res.json({
      success: false,
      message: 'User name is not provided',
    });
  } else {
    UserDataSchema.findOne({
      username: username,
      rowstate: 1
    }).exec().then(user => {
      if (!user) {
        res.json({
          success: false,
          message: 'No user found',
        });
      } else {
        PostSchema.aggregate([
          {
            $match: {
              rowstate: 1,
              idOfcreatedBy: mongoose.Types.ObjectId(user._id)
            }
          },
          {
            $lookup: {
              from: "fg_user_datas",
              localField: "idOfcreatedBy",
              foreignField: "_id",
              as: "user_details"
            }
          },
          { $unwind: "$user_details" },
          {
            $project: {
              _id: 1,
              comments: 1,
              content: 1,
              createdAt: 1,
              isImageContains: 1,
              likedBy: 1,
              likes: 1,
              postImagePath: 1,
              post_pic_detail: 1,
              __fn__all_comments: 1,
              profile_pic_path: "$user_details.profile_pic_path",
              googleUser: "$user_details.googleUser",
              createdBy_id: "$user_details._id",
              createdByName: "$user_details.name",
              createdByUsername: "$user_details.username"
            }
          }
        ])
          .sort({ _id: -1 })
          .exec((err, posts) => {
            if (err) {
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                posts: posts
              });
            }
          });
    }
    }).catch(err => {
      // user
      res.json({
        success: false,
        message: 'Internal DB error Occurred.',
        err: err
      });
    })
  }
});

router.post('/togglecommentoptions', (req, res, next) => {
  const userId = req.decoded.userId;
  const postId = req.body.postId;
  let message = "";
  PostSchema.findOne({
    _id: mongoose.Types.ObjectId(postId),
    idOfcreatedBy: mongoose.Types.ObjectId(userId)
  }).exec().then(post => {
    if(!post) {
      res.json({
        success: false,
        error: error,
        message: 'No Post found.'
      });
    } else {
      message = (post.isCommentAllowed) ? "Allow Comments" : "Disallow Comments";
      post.isCommentAllowed = !post.isCommentAllowed;
      post.save().then(sv => {
        res.json({
          sucess: true,
          message_span: message,
          message: 'Post updated',
          up: sv
        });
      }).catch(error => {
        res.json({
          success: false,
          error: error,
          message: 'Data not updated'
        });
      })
    }
  }).catch(error => {
    res.json({
      success: false,
      error: error,
      message: 'Data not fetched'
    });
  })
});

//db.table.find({ age: { $gte: 20 } }, { id: 1, salary: 1 });

module.exports = router;
