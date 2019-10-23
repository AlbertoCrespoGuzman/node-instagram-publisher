// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

var instagram_postSchema = new Schema({
    album: {
        type: Boolean,
        default: false
    },
    image: {
        type: Boolean,
        default: false
    },
    video: {
        type: Boolean,
        default: false
    },
    video_url:  {
        type: String
    },
    image_url:  {
        type: String
    }
});

instagram_postSchema.plugin(mongoosePaginate)
var instagram_post = mongoose.model('InstagramPosts', instagram_postSchema );

// make this available to our Node applications
module.exports = instagram_post;