const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserActivityLog = new Schema({
    userId: {
        type: Schema.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    action: {
        type: Object,
        required: true
    },
    query: {
        type: Object
    },
    actionOn: {
        type: Object
    },
    tokenWhenCreated: {
        type: String,
        required: true
    },
    urlHit: {
        type: Object
    },
    header: {
        type: Object
    },
    rowState: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model("fg_useractivity_log", UserActivityLog);