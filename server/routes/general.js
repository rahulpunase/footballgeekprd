const express = require("express");
const router = express.Router();
const generalController = require('../controllers/controller.general');
const middlewareContainer = require('../middlewares/middle.container');

// getSingleFollowerFromId
router.get("/followers/:id", middlewareContainer.jwtTokenByPasser, generalController.getSingleFollowerFromId);

// getSingleUserInfoFromId
router.get("/userinfo/:id", middlewareContainer.jwtTokenByPasser, generalController.getSingleUserInfoFromId);

// getAllNews
router.get('/getallnews', middlewareContainer.jwtTokenByPasser, generalController.getAllNews);

// getSingleNews
router.get("/getsinglenews/:href", middlewareContainer.jwtTokenByPasser, generalController.getSingleNewsFromId);

// followuser
router.post('/followuser', middlewareContainer.jwtTokenByPasser, generalController.getFollowUser);

// newssuggestions
router.post('/newssuggestions', middlewareContainer.jwtTokenByPasser, generalController.getNewSuggestions);

// getTeamMetaData
router.get('/getteamdata/:teamid', middlewareContainer.jwtTokenByPasser, generalController.getTeamMetaData);

// searchrequest
router.get('/searchrequest', middlewareContainer.jwtTokenByPasser, generalController.searchRequest);

// getTopTeams
router.get('/gettopteams', middlewareContainer.jwtTokenByPasser, generalController.getTopTeams);

// fetchFollowersById
router.get('/fetchfollowers/:id', middlewareContainer.jwtTokenByPasser, generalController.fetchFollowersById);

// fetchPeople
router.get('/fetchpeople', middlewareContainer.jwtTokenByPasser, generalController.fetchPeople);

// fetchMessagingInfo
router.post('/fetchmessaginginfo', middlewareContainer.jwtTokenByPasser, generalController.fetchMessagingInfo);

// createMessage
router.post('/createmessage', middlewareContainer.jwtTokenByPasser, generalController.createMessage);

// createConversation
router.post('/createconversation', middlewareContainer.jwtTokenByPasser, generalController.createConversation);

// fetchallactiveconversation
router.post('/fetchallactiveconversation', middlewareContainer.jwtTokenByPasser, generalController.fetchAllActiveConversation);

//getuseractivity
router.get('/getuseractivity', middlewareContainer.jwtTokenByPasser, generalController.getUserActivity);

module.exports = router;
