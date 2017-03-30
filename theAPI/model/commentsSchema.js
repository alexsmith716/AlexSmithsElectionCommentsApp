
var mongoose = require('mongoose');

/*
User
    > User can create MainComments
    > User can SubComment on other User's MainComments
*/

var subCommentsSchema = new mongoose.Schema({
    displayname: {
        type: String, 
        required: true
    },
    commenterId: {
        type: String, 
        required: true
    },
    city: {
        type: String, 
        required: true
    },
    state: {
        type: Object, 
        required: true
    },
    datecreated: {
        type: Date, 
        default: Date.now
    },
    comment: {
        type: String, 
        required: true
    }
});

var commentsSchema = new mongoose.Schema({
    displayname: {
        type: String, 
        required: true
    },
    commenterId: {
        type: String, 
        required: true
    },
    city: {
        type: String, 
        required: true
    },
    state: {
        type: Object, 
        required: true
    },
    datecreated: {
        type: Date, 
        default: Date.now
    },
    candidate: {
        type: String, 
        required: true
    },
    comment: {
        type: String, 
        required: true
    },
    recommended: {
        type: Boolean, 
        required: false
    },
    subComments: [subCommentsSchema]
});

var Comment = mongoose.model('Comment', commentsSchema);
module.exports = Comment;
