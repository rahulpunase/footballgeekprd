const express = require("express");
const router = express.Router();
const EventsSchema = require("../../requests/framework/mon.frm.events");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');



router.post("/insertevents", (req, res) => {
  const data = req.body;
  const eventSchema = new EventsSchema({
    teamOne: mongoose.Types.ObjectId(data.teamOne),
    teamTwo: mongoose.Types.ObjectId(data.teamTwo),
    matchDay: Number(data.matchDay),
    leagueAssociated: mongoose.Types.ObjectId(data.leagueAssociated),
    isCupGame: data.isCupGame == "true",
    leg: Number(data.leg),
    round: Number(data.round),
    matchDate: data.matchDate,
    teamOneScore: Number(data.teamOneScore),
    teamTwoScore: Number(data.teamTwoScore),
    isGameFinished: data.isGameFinished == "true",
    isGameCanceled: data.isGameCanceled == "true"
  });
  eventSchema.save(err => {
    if (err) {
      res.json({ success: false, err: err, message: "Data not saved" });
    } else {
      res.json({ success: true, message: "Data saved." });
    }
  });
});

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

router.get("/getrecentevents", (req, res) => {
  EventsSchema.aggregate([
    // { $match: { leagueAssociated: ObjectId("5b533e25db3a19db084b5867") } },
    {
      $lookup: {
        from: "fg_all_team_masters",
        localField: "teamOne",
        foreignField: "_id",
        as: "homeTeam"
      }
    },
    {
      $lookup: {
        from: "fg_all_team_masters",
        localField: "teamTwo",
        foreignField: "_id",
        as: "awayTeam"
      }
    },
    {
      $project: {
        _id: 1,
        teamOneScore: 1,
        teamTwoScore: 1,
        matchDay: 1,
        leagueAssociated: 1,
        isCupGame: 1,
        matchDate: 1,
        isGameFinished: 1,
        isGameCanceled: 1,
        homeTeam: 1,
        awayTeam: 1
      }
    },
    { $sort: { matchDate: 1 } }
  ]).exec()
    .then((events)=>{
      res.json({
        success: true,
        events: events
      })
    }).catch((err)=>{
      res.json({
        success: false,
        message: 'Some error occurred'
      })
    })
});

module.exports = router;
