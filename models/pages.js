const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const db = require('../configs/connection');

const PagesSchema = new Schema({
    pageUrl : {
        type : String,
        required:[true, 'Page Url is required']
    },
    user : {
        type : Schema.Types.ObjectId , ref: 'Users'
    },
    pageId: {
        type : String,
    },
    posts: []
    
});

var Pages = db.model('Pages', PagesSchema);

module.exports = Pages