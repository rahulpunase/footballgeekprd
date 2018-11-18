const CreatepageSchema = require('../requests/mon.createpage');
const UserDataSchema = require('../requests/mon.userdata');
const CONSTANTS = require('../utils/footbalgeekContants');
const mongoose = require('mongoose');
const pageObject = {
    savePageDetails: (req, res, next) => {
        const data = req.body;
        if (!data.createdBy) {
            res.json({ success: false, message: 'Created by is not provided' });
        } else if (!data.pageName) {
            res.json({ success: false, message: 'Page name is not provided' });
        } else if (!data.pageUsername) {
            res.json({ success: false, message: 'Page username is not provided' });
        } else {
            const pageMetaSchema = new CreatepageSchema({
                createdBy: mongoose.Types.ObjectId(data.createdBy),
                pageName: data.pageName.trim(),
                pageUsername: data.pageUsername.trim(),
                associatedTeam: (data.associatedTeam) ? mongoose.Types.ObjectId(data.associatedTeam) : null,
                tagLine: (data.tagLine) ? data.tagLine.trim() : null,
                description: (data.description) ? data.description.trim() : null,
                webSites: (data.webSites) ? data.webSites : [],
                email: (data.email) ? data.email: []
            });
            pageMetaSchema.save().then(response => {
                res.json({
                    success: true,
                    response: response,
                    message: 'data saved'
                });
            }).catch(error => {
                res.json({
                    success: 'false',
                    error: error,
                    message: 'Details are not saved'
                });
            });
        }
    },
    createPageWithPageName: (req, res, next) => {
        const data = req.body;
        const pageName = data.pageName;
        const createdBy = req.decoded.userId;
        if (!pageName) {
            res.json({
                success: false,
                message: 'Page name is required to proceed'
            });
        } else {
            const iniPage = new CreatepageSchema({
                createdBy: mongoose.Types.ObjectId(createdBy),
                pageName: pageName
            });
            iniPage.save().then(response => {
                res.json({
                    success: true,
                    response: { _id: response._id },
                    message: 'Page name is saved'
                })
            }).catch(error => {
                res.json({
                    success: false,
                    error: error,
                    message: CONSTANTS.const_db_error_in_selecting_data
                })
            });
        }
    },
    getCreatedPages: (req, res, next) => {
        const createdBy = req.decoded.userId
        CreatepageSchema.find({
            createdBy: mongoose.Types.ObjectId(createdBy),
            rowState: 1,
        }).select("_id pageName").
        exec().then(pages => {
            res.json({
                success: true,
                pages: pages,
                error: null,
            })
        }).catch(error => {
            res.json({
                success: false,
                error: error,
                message: CONSTANTS.const_db_error_in_selecting_data
            })
        });
    },
    getPageInfoFromId: (req, res, next) => {
        const createdBy = req.decoded.userId;
        const pageId = req.params.pageid;
        CreatepageSchema.findOne({
            createdBy: mongoose.Types.ObjectId(createdBy),
            _id: mongoose.Types.ObjectId(pageId),
            rowState: 1
        }).exec().then(page => {
            if(!page) {
                res.json({
                    pageFound: false,
                    error: null,
                    success: true
                });
            } else {
                // get users
                UserDataSchema.find({
                    "_id": { $in : page.group }
                }).select("_id profile_pic_path profile_pic_path_50_50 username name").then(
                    ingroupUsers => {
                        res.json({
                            pageFound: true,
                            error: null,
                            page: page,
                            ingroupUsers: ingroupUsers,
                            message: 'Data found.',
                            success: true
                        });
                    }
                ).catch(error => {
                    res.json({
                        error: error,
                        page: page,
                        message: 'Data found.',
                        success: false
                    });
                });
            }
        }).catch(error => {
            res.json({
                error: error,
                page: page,
                message: 'Data found.',
                success: false
            });
        })
    },
    getPageInfoFromUsername: (req, res, next) => {
        const createdBy = req.decoded.userId;
        const username = req.params.username;
        CreatepageSchema.findOne({
            createdBy: mongoose.Types.ObjectId(createdBy),
            pageUsername: username,
            rowState: 1
        }).exec().then(page => {
            if(!page) {
                res.json({
                    pageFound: false,
                    error: null,
                    success: true
                });
            } else {
                // get users
                if (page.isPublished) {
                    UserDataSchema.find({
                        "_id": { $in : page.group }
                    }).select("_id profile_pic_path profile_pic_path_50_50 username name").then(
                        ingroupUsers => {
                            res.json({
                                pageFound: true,
                                error: null,
                                page: page,
                                ingroupUsers: ingroupUsers,
                                message: 'Data found.',
                                success: true,
                                isPublished: true
                            });
                        }
                    ).catch(error => {
                        res.json({
                            error: error,
                            page: page,
                            message: 'Data found.',
                            success: false
                        });
                    });
                } else {
                    res.json({
                        page: {
                            pageName: page.pageName,
                            pageUsername: page.pageUsername
                        },
                        message: 'Data found.',
                        isPublished: false,
                        success: true
                    });
                }
            }
        }).catch(error => {
            res.json({
                error: error,
                message: 'Data found.',
                success: false
            });
        })
    },
    updateBasicPageDetails: (req, res, next) => {
        const createdBy = req.decoded.userId;
        const data = req.body;
        const query = {
            createdBy: mongoose.Types.ObjectId(createdBy),
            rowState: 1,
            _id: mongoose.Types.ObjectId(data.pageId)
        }
        CreatepageSchema.findOne(query).exec().then(page => {
            if (!page) {
                res.json({
                    success: false,
                    pageFound: false,
                    message: 'Error while updating data.'
                });
            } else {
                CreatepageSchema.update(query, {
                    $set: {
                        pageName: data.pageName,
                        pageUsername: data.pageUsername,
                        description: data.description
                    }
                }).exec().then(up => {
                    res.json({
                        success: true,
                        pageFound: true,
                        message: 'Data successfully updated.',
                        dbD: up
                    })
                }).catch(error => {
                    res.json({
                        success: false,
                        pageFound: false,
                        message: CONSTANTS.const_db_error_in_selecting_data
                    });
                })
            }
        }).catch(error => {
            res.json({
                success: false,
                pageFound: false,
                message: CONSTANTS.const_db_error_in_selecting_data
            });
        });
    },
    updateDetailedPageDetails: (req, res, next) => {
        const createdBy = req.decoded.userId;
        const data = req.body;
        const query = {
            createdBy: mongoose.Types.ObjectId(createdBy),
            rowState: 1,
            _id: mongoose.Types.ObjectId(data.pageId)
        }
        CreatepageSchema.update(query, {
            $set: {
                tagLine: data.tagLine,
                isPagePrivate: data.isPagePrivate,
                webSites: data.webSites,
                emails: data.emails
            }
        }).exec().then(up => {
            res.json({
                success: true,
                pageFound: true,
                message: 'Data successfully updated.',
                dbD: up
            })
        }).catch(error => {
            res.json({
                success: false,
                pageFound: false,
                message: CONSTANTS.const_db_error_in_selecting_data
            });
        });
    },
    updateGroupForPage: (req, res, next) => {
        const createdBy = req.decoded.userId;
        const data = req.body;
        const query = {
            createdBy: mongoose.Types.ObjectId(createdBy),
            rowState: 1,
            _id: mongoose.Types.ObjectId(data.pageId)
        };
        CreatepageSchema.update(query, {
            $set: {
               group: data.group.map(e =>mongoose.Types.ObjectId(e))
            }
        }).exec().then(up => {
            res.json({
                success: true,
                pageFound: true,
                message: 'Data successfully updated.',
                dbD: up
            });
        }).catch(error => {
            res.json({
                success: false,
                pageFound: false,
                message: CONSTANTS.const_db_error_in_selecting_data
            });
        });

    },
    updatePublishRequest: (req, res, next) => {
        const createdBy = req.decoded.userId;
        const data = req.body;
        const query = {
            createdBy: mongoose.Types.ObjectId(createdBy),
            rowState: 1,
            _id: mongoose.Types.ObjectId(data.pageId)
        };
        CreatepageSchema.findOne(query).exec().then(page => {
            if (page.pageUsername === '' || page.pageUsername === null) {
                res.json({
                    message: 'Page cannot be published as username is not created.',
                    success: false,
                    showErrorBox: true
                });
            } else {
                page.update({
                    $set: { isPublished: data.request }
                }).exec().then(up => {
                    res.json({
                        message: 'Data updated',
                        success: true,
                        pub: !data.request,
                        showErrorBox: false,
                        pageUsername: page.pageUsername
                    });
                }).catch(error => {
                    res.json({
                        error: error,
                        success: false,
                        pageFound: false,
                        message: CONSTANTS.const_db_error_in_selecting_data
                    });
                });
            }
        }).catch(error => {
            res.json({
                error: error,
                success: false,
                pageFound: false,
                message: CONSTANTS.const_db_error_in_selecting_data
            });
        });
    }
}

module.exports = pageObject;