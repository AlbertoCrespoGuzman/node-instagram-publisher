var mongoose = require('mongoose');
var Schema = mongoose.Schema

var instagram_accounts_get_feedSchema = new Schema({
    instagram_id:  {
        type: Number
    },
    name:  {
        type: String
    },
    language:  {
        type: String
    },
    get_videos: {
        type: Boolean,
        default: false
    },
    get_images: {
        type: Boolean,
        default: false
    },
    get_caption: {
        type: Boolean,
        default: false
    }

});

var instagram_accounts_get_feed = mongoose.model('InstagramAccountsGetFeed', instagram_accounts_get_feedSchema );

// make this available to our Node applications
module.exports = instagram_accounts_get_feed;