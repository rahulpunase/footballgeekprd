const express = require("express");
const router = express.Router();
const middlewareContainer = require('../middlewares/middle.container');
const authenticationController = require('../controllers/controller.auth');

// user login
router.post("/loginuser", authenticationController.loginUser);

// user registration
router.post("/registeruser", authenticationController.registerUser);

// check username
router.post("/checkusername", authenticationController.checkUsername);

//check email
router.post("/checkemail", authenticationController.checkEmail);

// signinwithgoogle
router.post('/signinwithgoogle', authenticationController.signInWithGoogle);

//proceedwithusername
router.post('/proceedwithusername', authenticationController.proceedWithUserName);

// login user
// to access the headers...
router.get("/profile", middlewareContainer.jwtTokenByPasser, authenticationController.profileFetcher);

module.exports = router;
