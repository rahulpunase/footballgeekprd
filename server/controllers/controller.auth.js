const UserdataSchema = require("../requests/mon.userdata");
const UserloginDetails = require('../requests/mon.user_login_details');
const loggerServices = require('../loggerServices/loggerServices');
const jwt = require("jsonwebtoken");
const CONSTANTS = require('../utils/footbalgeekContants');

/** 
 * Module Object athentication
*/
function createGoogleUser(googleUserProfile, username, res) {
    let user = new UserdataSc({
        name: googleUserProfile.ig,
        username: username,
        email: googleUserProfile.U3,
        password: '****',
        googleUser: {
            isGoogleUser: true,
            googleId: googleUserProfile.Eea
        },
        wall_pic: {
            wall_pic_path: 'assets/img/default_wallpic.jpg',
            wall_x: 0,
            wall_y: 0
        },
        profile_pic_path: googleUserProfile.Paa,
        rowstate: 1
    });

    user.save((err) => {
        if (err) {
            if (err.code == 11000) {
                res.json({
                    success: false,
                    message: "Registraion Failed! Duplicate value entry for username or emailId.",
                    err: err
                });
            } else {
                res.json({
                    success: false,
                    message: "Registration failed.",
                    err: err
                });
            }

        } else {
            loginGoogleUser(res, googleUserProfile.Eea, true);
        }
    });
}

function loginGoogleUser(res, gId, newAccount) {
    UserdataSchema.find({
        "googleUser.googleId": gId
    }).exec((err, googleUser) => {
        if (err) {
            res.json({
                success: false,
                message: "Login could not be completed.",
                err: err
            });
        } else {
            // login google user
            const token = jwt.sign(
                {
                    userId: googleUser[0]._id
                },
                "football_geek",
                { expiresIn: "24h" }
            );
            loggerServices.write(' logged in successfully with token #GOOGLEUSER::=>' + token);
            res.json({
                success: true,
                message: "Login successfully",
                token: token,
                loginDetailsSaved: true,
                tokenExpiresIn: '24h',
                googleUser: true,
                newAccount: newAccount
            });
        }
    })
}

authentication = {
    loginUser: (req, res) => {
        const data = req.body;
        if (!data.username) {
            res.json({ success: false, message: "No username is provided" });
        } else {
            if (!data.password) {
                res.json({ success: false, message: "No password is provided" });
            } else {
                UserdataSchema.findOne(
                    { username: data.username }
                ).exec()
                    .then(user => {
                        /**
                         * if user is available
                         */
                        if (!user) {
                            res.json({ success: false, message: "No user found" });
                        } else {
                            // user is found... match the password
                            const valid = user.comparePasswords(data.password, user.password);
                            if (!valid) {
                                res.json({ success: false, message: "Password invalid" });
                            } else {
                                // user is logged in
                                const token = jwt.sign({ userId: user._id }, "football_geek", { expiresIn: "24h" }
                                );
                                const logindetails = new UserloginDetails({
                                    userid: user._id,
                                    token: token,
                                    loggedinFromBrowser: data.browser
                                });
                                logindetails.save((err) => {
                                    if (err) {
                                        res.json({
                                            success: true,
                                            message: "Login successfully",
                                            token: token,
                                            logindetailssaved: false,
                                            err: err
                                        });
                                    }
                                });
                                loggerServices.write(data.username + ' logged in successfully with token::=>' + token);
                                res.json({
                                    success: true,
                                    message: "Login successfully",
                                    token: token,
                                    loginDetailsSaved: true,
                                    tokenExpiresIn: '24h'
                                });
                            }
                        }
                    })
                    .catch(error => {
                        loggerServices.write('Error in Login user req');
                        res.json({
                            success: false,
                            message: CONSTANTS.const_internal_server_error,
                            err: error
                        });
                    });
            }
        }
    },
    registerUser: (req, res) => {
        const data = req.body;
        if (!data.name) {
            res.json({
                success: false,
                message: CONSTANTS.const_provide_name
            });
        } else {
            if (!data.username) {
                res.json({
                    success: false,
                    message: CONSTANTS.const_username_error_message
                });
            } else {
                if (!data.email) {
                    res.json({
                        success: false,
                        message: CONSTANTS.const_email_error_message
                    });
                } else {
                    if (!data.password) {
                        res.json({
                            success: false,
                            message: CONSTANTS.const_password_error_message
                        });
                    } else {
                        // save
                        let user = new UserdataSchema({
                            name: data.name,
                            username: data.username,
                            email: data.email.toLowerCase(),
                            password: data.password,
                            wall_pic: {
                                wall_pic_path: CONSTANTS.const_default_wall_pic,
                                wall_x: 0,
                                wall_y: 0
                            },
                            rowstate: 1
                        });
                        user.save(err => {
                            if (err) {
                                // Error occured here
                                if (err.code === 11000) {
                                    res.json({
                                        success: false,
                                        message: CONSTANTS.const_already_exists_error_message
                                    });
                                } else {
                                    if (err.errors) {
                                        if (err.errors.email) {
                                            res.json({
                                                success: false,
                                                message: err.errors.email.message
                                            });
                                        }
                                    } else {
                                        res.json({
                                            success: false,
                                            message: CONSTANTS.const_db_error_in_selecting_data,
                                            err
                                        });
                                    }
                                }
                            } else {
                                // when no error has occured
                                loggerServices.write("Account created");
                                loggerServices.write("of " + data.username);
                                res.json({
                                    success: true,
                                    message: "Account Created"
                                });
                            }
                        });
                    }
                }
            }
        }
    },
    checkUsername: (req, res) => {
        let data = req.body;
        if (!data.username) {
            res.json({
                success: false,
                message: "username not provided"
            });
        } else {
            UserdataSchema.findOne({
                username: data.username
            }).exec()
                .then(user => {
                    if (user) {
                        res.json({
                            success: false,
                            message: "Username is taken"
                        });
                    } else {
                        res.json({
                            success: true,
                            message: "Username is available"
                        });
                    }
                })
                .catch(error => {
                    if (error) {
                        res.json({
                            success: false,
                            message: error
                        });
                    }
                });
        }
    },
    checkEmail: (req, res) => {
        let data = req.body;
        if (!data.email) {
            res.json({
                success: false,
                message: "Email is not provided"
            });
        } else {
            UserdataSchema.findOne({
                email: data.email
            }).exec()
                .then(user => {
                    if (user) {
                        res.json({
                            success: false,
                            message: "Account is already cerated using this email"
                        });
                    } else {
                        res.json({
                            success: true,
                            message: "Email is available"
                        });
                    }
                })
                .catch(error => {
                    if (error) {
                        res.json({
                            success: false,
                            message: error
                        });
                    }
                });
        }
    },
    signInWithGoogle: (req, res) => {
        const googleUser = req.body;
        UserdataSchema.findOne({
            "googleUser.googleId": googleUser.Eea,
            rowstate: 1
        }).exec()
            .then(googleFoundUser => {
                if (!googleFoundUser) {
                    // register a new google user...
                    res.json({
                        success: true,
                        action: 'username',
                        redirectTo: 'signingInFromGoogle'
                    })
                } else {
                    loggerServices.write("Logging in with google id...");
                    //internal function
                    loginGoogleUser(res, googleUser.Eea, false);
                }
            })
            .catch(error => {
                if (error) {
                    res.json({
                        success: false,
                        message: "Error occurred. Please try again after sometime.",
                        error: error,
                        googleUser: false
                    });
                }
            })
    },
    proceedWithUserName: (req, res) => {
        const data = req.body;
        if (!data.googleProfile) {
            res.json({
                success: false,
                message: "Profile is not provided."
            });
        } else {
            if (!data.username) {
                res.json({
                    success: false,
                    message: "Username is not provided."
                });
            } else {
                // internal function 
                createGoogleUser(data.googleProfile, data.username, res);
            }
        }
    },
    profileFetcher: (req, res) => {
        loggerServices.write("/profile");
        UserdataSchema.findOne({ _id: req.decoded.userId })
            .select("_id name username email profile_pic_path followers followings googleUser bio wall_pic club_team_follow national_team_follow profile_pic_path_50_50 isVerified")
            .exec()
            .then(user => {
                // THEN
                if (!user) {
                    res.json({
                        success: false,
                        message: "User not found"
                    });
                } else {
                    UserdataSchema.find(
                        {
                            "_id": { $in: user.followers },
                            "rowstate": 1
                        }
                    ).select("_id name username email profile_pic_path followers isVerified")
                        .exec()
                        .then(followers => {
                            // THEN
                            UserdataSchema.find(
                                {
                                    "_id": { $in: user.followings },
                                    "rowstate": 1
                                }
                            ).select("_id name username email profile_pic_path followers isVerified")
                                .exec()
                                .then(followings => {
                                    //THEN
                                    loggerServices.write("profile Data fetched for " + req.decoded.userId);
                                    res.json({
                                        success: true,
                                        user: user,
                                        followers: followers,
                                        followings: followings
                                    });
                                })
                                .catch(error => {
                                    if (error) {
                                        res.json({
                                            success: false,
                                            message: 'error occurred in fetching followers'
                                        });
                                    }
                                })
                        })
                        .catch(error => {
                            if (error) {
                                res.json({
                                    success: false,
                                    message: 'error occurred in fetching followings'
                                });
                            }
                        });
                }
            })
            .catch(error => {
                if (error) {
                    res.json({
                        success: false,
                        message: "User not found",
                        error: error
                    });
                }
            })
    }

}
module.exports = authentication;