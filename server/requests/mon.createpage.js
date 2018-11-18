const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function validatePageName() {
    return [{
                validator: function (v) {
                    return v.length < 30; // true
                },
                message: mes => 'More than 30 characters are not allowed'
            }, 
            {
                validator: function (v) {
                    return v.length > 6;
                },
                message: mes => 'Provide atleast 6 characters'
            }];
}


let PageMetaData = new Schema({
    createdBy: {
        type: Schema.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    pageName: {
        type: String,
        validate: validatePageName(),
        required: true
    },
    pageUsername: {
        type: String,
        default: ''
    },
    associatedTeam: {
        type: Schema.ObjectId,
        default: null
    },
    noOfLikes: {
        type: Number,
        default: 0
    },
    likedBy: {
        type: Array,
        default: []
    },
    followers: {
        type: Array,
        default: []
    },
    tagLine: {
        type: String,
        max: [100, 'Max tag line letters limit reached'],
        default: ''
    },
    pageProfilePic: {
        type: String,
        default: ''
    },
    pageCoverPic: {
        type: Object,
        default: {
            pcp_x: 0,
            pcp_y: 0,
            pcp_path: ''
        }
    },
    isPagePrivate: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        default: null,
        max: [200, 'Max 200 characters allowed.']
    },
    webSites: {
        type: Array,
        default: []
    },
    emails: {
        type: Array,
        default: []
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isWarned: {
        type: Boolean,
        default: false
    },
    connectedProfiles: {
        type: Array,
        default: []
    },
    rowState: {
        type: Number,
        default: 1
    },
    group: {
        type: Array,
        default:[]
    }

});

module.exports = mongoose.model("fg_create_page_metadata", PageMetaData);
