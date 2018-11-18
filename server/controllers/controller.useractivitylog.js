const mongoose = require('mongoose');
const UserLoggingActivitySchema = require('../requests/mon.useractivity');

module.exports = {
    logUserActivity: (data, res) => {
        /*{
            baseUrl: req.baseUrl,
            body: req.body,
            decoded: req.decoded,
            originalUrl: req.originalUrl,
            headers: req.headers,
            route: req.route,
            query: req.query
        }; */

        const userActivity = new UserLoggingActivitySchema({
            userId: mongoose.Types.ObjectId(data.decoded.userId),
            action: data.body.activity,
            actionOn: {},
            tokenWhenCreated: data.headers.auth,
            urlHit: {
                baseUrl: data.baseUrl,
                originalUrl: data.originalUrl
            },
            header: data.headers,
            query: data.query
        });
        userActivity.save().then(sv => {
            // data saved.
        }).catch(error => {
            res.json({
                error: error,
                activitySaved: false
            })
        });
    }
}