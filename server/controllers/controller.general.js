/** 
 * Schema imports
 * from requests model package
*/
const UserDataSchema = require('../requests/mon.userdata');
const NewsSchema = require("../requests/framework/mon.frm.news");
const LeaguesSchema = require("../requests/framework/mon.frm.leagues");
const ClubTeamsSchema = require("../requests/framework/mon.frm.clubteams");
const ConversationSchema = require("../requests/mon.conversation");
const ActivitySchema = require("../requests/mon.useractivity");
const activityLog = require('../middlewares/middle.useractivitylog');
const mongoose = require('mongoose');
const CONSTANTS = require('../utils/footbalgeekContants');
const loggerServices = require('../loggerServices/loggerServices');

generalFunctions = {
    getSingleFollowerFromId: (req, res) => {
        // /followers/:id
        const data = req.params;
        UserDataSchema.find(
            { "_id": mongoose.Types.ObjectId(data.id) },
            { "followers": 1 }
        ).exec((err, user) => {
            UserDataSchema.find(
                {
                    "_id": { $in: user[0].followers }
                }
            ).exec((err, user) => {
                res.json({
                    followers: user
                })
            })
        })
    },
    getSingleUserInfoFromId: (req, res) => {
        const id = req.params.id;
        if (!id) {
            res.json({ success: false, message: "please provide the id." });
        } else {
            UserDataSchema.findOne({ _id: id, rowstate: 1 })
            .select(CONSTANTS.CONST_USER_SELECTOR)
            .exec((err, user) => {
                if (err) {
                    loggerServices.write('Internal db error occured in path /userinfo/' + id);
                    res.json({
                        success: false,
                        message: "Internal server error occured",
                        err: err
                    });
                } else {
                    if (!user) {
                        loggerServices.write('Internal db error occured in path /userinfo/' + id);
                        res.json({ success: false, message: "No user found" });
                    } else {
                        loggerServices.write('Telecasted userinfo for ' + id);
                        res.json({ success: true, user: user });
                    }
                }
            });
        }
    },
    getAllNews: (req, res) => {
        NewsSchema.find({}).sort({ _id: -1 }).exec((err, news) => {
            if (err) {
                res.json({
                    success: false,
                    message: 'Some error occured',
                    err: err
                })
            } else {
                if (!news) {
                    res.json({
                        success: false,
                        message: 'No news found'
                    })
                } else {
                    res.json({
                        success: true,
                        news: news
                    })
                }
            }
        })
    },
    getSingleNewsFromId: (req, res) => {
        //const href = req.body.href;
        const href = req.params.href;
        NewsSchema.findOne({
            href: href
        }).exec((err, news) => {
            if (err) {
                res.json({ success: false, message: 'Some error occured' });
            } else {
                if (!news) {
                    res.json({ success: false, message: 'New may have been removed.' });
                } else {
                    // res.json({success: true, news: news});
                    ClubTeamsSchema.find({
                        "_id": { $in: news.associatedClub }
                    }).exec((err, associatedClub) => {
                        if (err) {
                            res.json({ success: false, message: "Some error occurred", err: err });
                        } else {
                            // res.json({success: true, news: news, associatedClub: associatedClub});
                            LeaguesSchema.find({
                                "_id": { $in: news.associatedLeague }
                            }).exec((err, associatedLeague) => {
                                if (err) {
                                    res.json({ success: false, message: "Some error occurred", err: err });
                                } else {
                                    res.json({
                                        success: true,
                                        news: news,
                                        associatedClub: associatedClub,
                                        associatedLeague: associatedLeague
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    },
    getFollowUser: (req, res, next) => {
        const data = req.body;
        if (!data.loggedInUser) {
            res.json({
                success: false,
                message: 'Request cannot be completed'
            });
        } else {
            if (!data.userToFollow) {
                res.json({
                    success: false,
                    message: 'Request cannot be completed'
                });
            } else {
                if (data.loggedInUser !== data.userToFollow) {
                    UserDataSchema.update({
                        "_id": mongoose.Types.ObjectId(data.loggedInUser),
                        "rowstate": 1
                    }, {
                            $push: { "followings": mongoose.Types.ObjectId(data.userToFollow) }
                        }).exec()
                        .then(data => {
                            UserDataSchema.update({
                                "_id": mongoose.Types.ObjectId(data.userToFollow),
                                "rowstate": 1
                            }, {
                                    $push: { "followers": mongoose.Types.ObjectId(data.loggedInUser) }
                                }).exec((err) => {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            message: 'Request cannot be completed',
                                            err: err
                                        });
                                    } else {
                                        activityLog(req, res, next);
                                        res.json({
                                            success: true,
                                            message: 'User followed',
                                            data: data
                                        });

                                    }
                                });
                        })
                        .catch(error => {
                            res.json({
                                success: false,
                                message: 'Request cannot be completed',
                                err: error
                            });
                        })
                } else {
                    res.json({
                        success: false,
                        message: 'Users cannot be same.'
                    })
                }
            }
        }
    },
    getNewSuggestions: (req, res) => {
        const data = req.body;
        const currentNewsId = data.currentNewsId;
        const currentAssociatedClub = data.currentAssociatedClub;
        const currentAssociatedLeague = data.currentAssociatedLeague;

        let currentAssociatedClubIds = [];
        let currentAssociatedLeagueIds = [];
        if (currentAssociatedClub.length > 0) {
            for (let i = 0; i < currentAssociatedClub.length; i++) {
                currentAssociatedClubIds.push(mongoose.Types.ObjectId(currentAssociatedClub[i]._id));
            }
        }
        if (currentAssociatedLeague.length > 0) {
            for (let i = 0; i < currentAssociatedLeague.length; i++) {
                currentAssociatedLeagueIds.push(mongoose.Types.ObjectId(currentAssociatedLeague[i]._id));
            }
        }

        NewsSchema.find(
            {
                "_id": { $ne: mongoose.Types.ObjectId(currentNewsId) },
                $or: [
                    { "associatedClub": { $in: currentAssociatedClubIds } },
                    { "associatedLeague": { $in: currentAssociatedLeagueIds } }
                ]
            }
        )
            .select("heading href createdAt title _id imagepath")
            .exec()
            .then(newsSuggestions => {
                if (!newsSuggestions) {
                    res.json({ success: false, message: 'No news found' });
                } else {
                    res.json({ success: true, suggestedNews: newsSuggestions });
                }
            }).catch(error => {
                res.json({ success: false, message: 'Some error occurred', err: error });
            });
    },
    getTeamMetaData: (req, res) => {
        const teamid = req.params.teamid;
        if (!teamid) {
            res.json({
                success: false,
                message: 'No id is provided.'
            })
        } else {
            // after the token has been authenticated...
            ClubTeamsSchema.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(teamid) } },
                {
                    $lookup: {
                        from: 'fg_leagues',
                        localField: 'league',
                        foreignField: '_id',
                        as: 'league'
                    }
                }
            ]).exec((err, team) => {
                if (!err) {
                    if (team.length === 0) {
                        res.json({
                            success: false,
                            message: 'No team found'
                        })
                    } else {
                        NewsSchema.find({
                            $or: [{
                                associatedClub: { $in: [mongoose.Types.ObjectId(team[0]._id)] },
                            }, {
                                associatedLeague: { $in: [mongoose.Types.ObjectId(team[0].league[0]._id)] }
                            }
                            ]
                        }).exec((err, news) => {
                            if (err) {
                                // err
                                res.json({
                                    err: err,
                                    message: 'Internal data error occured'
                                });
                            } else {
                                res.json({
                                    success: true,
                                    team: team,
                                    relatednews: news
                                });
                            }
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        message: 'Internal error occurred',
                        err: err
                    })
                }
            });
        }
    },
    searchRequest: (req, res) => {
        const q = req.query.query;
        if (q.length > 0) {
            ClubTeamsSchema.find(
                { name: { $regex: new RegExp(q, "i") } }
            ).limit(10).exec((err, team) => {
                if (err) {
                    res.json({
                        success: false,
                        message: 'No result',
                        err: err
                    });
                } else {
                    // second search starts here
                    LeaguesSchema.find(
                        { name: { $regex: new RegExp(q, "i") } }
                    ).exec((err, league) => {
                        if (err) {
                            res.json({
                                success: false,
                                message: 'No result',
                                err: err
                            });
                        } else {
                            // search users
                            UserDataSchema.find({
                                $or: [
                                    { name: { $regex: new RegExp(q, "i") } },
                                    { username: { $regex: new RegExp(q, "i") } }
                                ]
                            }).select("name username profile_pic_path")
                                .limit(10).exec((err, user) => {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            message: 'No result',
                                            err: err
                                        });
                                    } else {
                                        res.json({
                                            success: true,
                                            team: team,
                                            league: league,
                                            users: user
                                        });
                                    }
                                });
                        }
                    });
                }
            })
        } else { // q length if else
            res.json({
                success: false,
                message: 'No result'
            });
        }
    },
    getTopTeams: (req, res) => {
        ClubTeamsSchema.find().limit(12).exec((err, teams) => {
            if (err) {
                res.json({
                    success: false,
                    message: 'Teams not found'
                })
            } else {
                res.json({
                    success: true,
                    teams: teams
                })
            }
        })
    },
    fetchFollowersById: (req, res) => {
        const username = req.params.id;
        const loggedInUser = req.decoded.userId;

        UserDataSchema.aggregate([
            { $match: { "username": username } },
            {
                "$lookup": {
                    "from": "fg_user_datas",
                    "as": "followers",
                    "localField": "followers",
                    "foreignField": "_id"
                }
            },
            { $unwind: "$followers" },
            {
                "$project": {
                    "_id": true,
                    "_username": '$followers.username',
                    "username": 1,
                    "name": '$followers.name',
                    "profile_pic_path": '$followers.profile_pic_path',
                    "wall_pic": '$followers.wall_pic',
                    "bio": '$followers.bio',
                    "followings": '$followers.followings',
                    isLoggedInUserFollowing: {
                        $in: [mongoose.Types.ObjectId(loggedInUser), '$followers.followings']
                    }
                }
            }
        ]).exec().then(followers => {
            res.json({
                success: true,
                followers: followers,
            })
        }).catch(err => {
            res.json({
                success: false,
                message: 'Unable to fetch followers',
                err: err
            })
        });
    },
    fetchPeople: (req, res) => {
        const q = req.query.query;
        const userId = req.decoded.userId;
        UserDataSchema.find({
            $and: [
                {
                    $or: [
                        { name: { $regex: new RegExp(q, "i") } },
                        { username: { $regex: new RegExp(q, "i") } }
                    ]
                },
                { "_id": { $ne: mongoose.Types.ObjectId(userId) } }
            ]
        })
            .select("name username profile_pic_path profile_pic_path_50_50")
            .exec().then(users => {
                res.json({
                    success: true,
                    people: users
                });
            }).catch(error => {
                res.json({
                    success: false,
                    message: CONSTANTS.const_db_error_in_selecting_data,
                    err: error
                })
            });
    },
    fetchMessagingInfo: (req, res) => {
        const messageFrom = req.decoded.userId;
        const messageTo = req.body._id;
        const reqReceiveTime = new Date().toISOString();
        if (!messageTo) {
            res.json({
                success: false,
                message: CONSTANTS.const_username_error_message
            });
        } else {
            UserDataSchema.findOne({
                _id: mongoose.Types.ObjectId(messageTo)
            }).select("name username profile_pic_path profile_pic_path_50_50")
                .exec().then(user => {
                    if (!user) {
                        res.json({
                            success: false,
                            message: CONSTANTS.const_db_error_in_selecting_data
                        });
                    } else {
                        ConversationSchema.aggregate([
                            {
                                $match: {
                                    $or: [
                                        {
                                            $and: [
                                                { "members.member1": mongoose.Types.ObjectId(messageFrom) },
                                                { "members.member2": mongoose.Types.ObjectId(messageTo) }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { "members.member2": mongoose.Types.ObjectId(messageFrom) },
                                                { "members.member1": mongoose.Types.ObjectId(messageTo) }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                $project: {
                                    messages: true
                                }
                            }
                        ]).exec().then(data => {
                            if (data.length === 0) {
                                // create a new conversation
                                const con = new ConversationSchema({
                                    members: {
                                        member1: mongoose.Types.ObjectId(messageFrom),
                                        member2: mongoose.Types.ObjectId(messageTo)
                                    },
                                    messages: []
                                });
                                con.save(
                                    (error, inserted) => {
                                        if (error) {
                                            // Error in saving
                                            res.json({
                                                conversationCreated: false,
                                                err: error,
                                                success: false,
                                                message: CONSTANTS.const_db_error_in_selecting_data
                                            });
                                        } else {
                                            // new conversation is created...
                                            res.json({
                                                success: true,
                                                user: user,
                                                reqReceiveTime: reqReceiveTime,
                                                time: new Date().toISOString(),
                                                conversationId: (data.length > 0) ? data[0]._id : inserted._id,
                                                newConversation: true,
                                                inserted: inserted,
                                                message: {
                                                    data: [{ messages: [] }]
                                                }
                                            });
                                        }
                                    }
                                )

                            } else {
                                // send the fetched conversation
                                res.json({
                                    success: true,
                                    user: user,
                                    reqReceiveTime: reqReceiveTime,
                                    time: new Date().toISOString(),
                                    conversationId: data[0]._id,
                                    message: {
                                        data: data
                                    }
                                });
                            }
                        }).catch(
                            error => {
                                res.json({
                                    success: false,
                                    err: error,
                                    user: user,
                                    reqReceiveTime: reqReceiveTime,
                                    time: new Date().toISOString(),
                                    message: {
                                        data: null
                                    }
                                });
                            }
                        );

                    }
                }).catch(error => {
                    res.json({
                        success: false,
                        err: error,
                        message: CONSTANTS.const_db_error_in_selecting_data
                    });
                })
        }
    },
    createMessage: (req, res) => {
        const data = req.body;
        const msg = {
            userId: mongoose.Types.ObjectId(data.messageFrom),
            messageBody: data.messageBody,
            createAt: data.time
        };
        ConversationSchema.findOne({
            $or: [
                {
                    $and: [
                        { "members.member1": mongoose.Types.ObjectId(data.messageFrom) },
                        { "members.member2": mongoose.Types.ObjectId(data.messageTo) }
                    ]
                },
                {
                    $and: [
                        { "members.member2": mongoose.Types.ObjectId(data.messageFrom) },
                        { "members.member1": mongoose.Types.ObjectId(data.messageTo) }
                    ]
                }
            ]
        }).exec()
            .then(
                conversation => {
                    if (conversation) {
                        // conversation found... insert messages only
                        conversation.messages.push(msg);
                        conversation.save(
                            error => {
                                if (error) {
                                    // Error in saving
                                    res.json({
                                        conversationCreated: false,
                                        err: error,
                                        success: false,
                                        message: CONSTANTS.const_db_error_in_selecting_data
                                    });
                                } else {
                                    res.json({
                                        success: true,
                                        err: null,
                                        messageAdded: true,
                                        addedMessage: msg
                                    })
                                }
                            }
                        );
                    } else {
                        res.json({
                            success: false,
                            error: CONSTANTS.const_db_error_in_selecting_data,
                            inServerError: null,
                            newConversation: 'Could not be created.'
                        });
                    }
                }
            ).catch(
                error => {
                    res.json({
                        err: error,
                        message: "Error in fetching Conversation",
                        success: false
                    })
                }
            );
    },
    createConversation: (req, res) => {
        const messageFrom = req.decoded.userId;
        const messageTo = req.body.messageTo;
        const con = new ConversationSchema({
            members: {
                member1: mongoose.Types.ObjectId(data.messageFrom),
                member2: mongoose.Types.ObjectId(messageTo)
            },
            messages: []
        });
        con.save(
            error => {
                if (error) {
                    // Error in saving
                    res.json({
                        conversationCreated: false,
                        err: error,
                        success: false,
                        message: CONSTANTS.const_db_error_in_selecting_data
                    });
                } else {
                    res.json({
                        conversationCreated: true,
                        success: true,
                        err: null,
                        messageAdded: false
                    })
                }
            }
        );
    },
    fetchAllActiveConversation: (req, res) => {
        const userId = req.decoded.userId;
        UserDataSchema.findOne({
            "_id": mongoose.Types.ObjectId(userId)
        }).exec().then(
            user => {
                if (user) {
                    // user is found
                    ConversationSchema.aggregate([
                        {
                            $match: {
                                $or: [
                                    { "members.member1": mongoose.Types.ObjectId(userId) },
                                    { "members.member2": mongoose.Types.ObjectId(userId) }
                                ]
                            },

                        },
                        {
                            "$lookup": {
                                "from": "fg_user_datas",
                                "as": "users1",
                                "localField": "members.member1",
                                "foreignField": "_id"
                            }
                        },
                        {
                            "$lookup": {
                                "from": "fg_user_datas",
                                "as": "users2",
                                "localField": "members.member2",
                                "foreignField": "_id"
                            }
                        },
                        {
                            $unwind: "$users1"
                        },
                        {
                            $unwind: "$users2"
                        },
                        {
                            $sort: {
                                "messages.time": 1
                            }
                        },
                        {
                            $project: {
                                "members": true,
                                "lastMessages": {
                                    $slice: ["$messages", -1]
                                },
                                "user1": {
                                    "_id": "$users1._id",
                                    "profile_pic_path_50_50": "$users1.profile_pic_path_50_50",
                                    "profile_pic_path": "$users1.profile_pic_path",
                                    "name": "$users1.name",
                                    "username": "$users1.username"
                                },
                                "user2": {
                                    "_id": "$users2._id",
                                    "profile_pic_path_50_50": "$users2.profile_pic_path_50_50",
                                    "profile_pic_path": "$users2.profile_pic_path",
                                    "name": "$users2.name",
                                    "username": "$users2.username"
                                }
                            }
                        }
                    ]).exec()
                        .then(
                            conversation => {
                                if (conversation) {
                                    res.json({
                                        conversation: conversation,
                                        success: true
                                    });
                                } else {
                                    res.json({
                                        conversation: conversation,
                                        success: true
                                    });
                                }
                            }
                        )
                } else {
                    res.json({
                        success: false,
                        message: CONSTANTS.const_username_error_message
                    });
                }
            }
        )
    },
    getUserActivity: (req, res, next) => {
        const userId = req.decoded.userId;
        ActivitySchema.find({
            "userId": mongoose.Types.ObjectId(userId)
        }).sort({"createdAt": -1}).exec().then(activity => {
            res.json({
                success: true,
                act: activity
            });
        }).catch(error => {
            res.json({
                success: false,
                error: error
            });
        });
    }
}
module.exports = generalFunctions;