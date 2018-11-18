const express = require("express");
const router = express.Router();
const InertData = require("../../requests/framework/mon.frm.news");
const ClubTeamSchema = require("../../requests/framework/mon.frm.clubteams");
const LeagueSchema = require("../../requests/framework/mon.frm.leagues");
const multer = require("multer");
const path = require("path");
const mongoose = require('mongoose');

const diskStorage = multer.diskStorage({
  destination: "./public/images/news/",
  filename: function(req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const storeNewsImage = multer({
  storage: diskStorage
}).single("newsfile");

router.post("/insertnews", (req, res) => {
  storeNewsImage(req, res, err => {
    // console.log(req);
    if (err) {
      res.json({
        success: false,
        message: "Image not uploaded",
        err: err
      });
    } else {
      // console.log(req);
      const data = req.body;
      if (!data.title) {
        res.json({
          success: false,
          message: "Title is not provided"
        });
      } else {
        if (!data.heading) {
          res.json({
            success: false,
            message: "Heading is not provided"
          });
        } else {
          if (!data.para) {
            res.json({
              success: false,
              message: "Content is not provided"
            });
          } else {
            const path = req.file.destination + req.file.filename;
            const para = data.para;
            let whole_data = "";
            for(let i=0; i<para.length; i++){
              whole_data += `<p class="content_para" id="content_para_no_${i}_of_paragraphs">${para[i].trim()}</p>`;
            }
            const requestArray = data.associatedClubs;
            const requestArrayLeague = data.associatedLeagues;
            const arrayToInsertClubs= [];
            const arrayToInsertLeagues = [];


              requestArray.map(function (e) {
                if(e === null || e=== undefined) { return false; }
                arrayToInsertClubs.push(mongoose.Types.ObjectId(e));
              });


              requestArrayLeague.map(function (e) {
                if(e === null || e=== undefined) { return false; }
                arrayToInsertLeagues.push(mongoose.Types.ObjectId(e));
              });

            const insert = InertData({
              title: data.title,
              heading: data.heading,
              content: whole_data,
              imagepath: path.substring(9, path.length),
              associatedClub: arrayToInsertClubs,
              associatedLeague: arrayToInsertLeagues
            });
            insert.replcaeForHref(data.title);
            insert.save(err => {
              if (err) {
                res.json({
                  success: false,
                  message: "Some error occured",
                  err: err
                });
              } else {
                res.json({
                  success: true,
                  message: "News Inserted"
                });
              }
            });
          }
        }
      }
    }
  });
});

router.get("/getallteams", (req, res) => {
  ClubTeamSchema.find({}).exec((err, teams)=>{
    if(err) {
      res.json({
        success: false,
        message: 'No teams found'
      });
    } else {
      res.json({
        success: true,
        clubTeams: teams
      })
    }
  });
});

router.get('/getallleagues', (req, res) => {
  LeagueSchema.find({}).exec((err, leagues) => {
    if(err) {
      res.json({
        success: false,
        message: 'No teams found'
      });
    } else {
      res.json({
        success: true,
        leagues: leagues
      })
    }
  })
});

module.exports = router;
