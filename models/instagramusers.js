// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var instagramuserSchema = new Schema({
    id_instagram:  {
        type: String
    },
    username:  {
        type: String
    },
    followed:  {
        type: Boolean,
        default: false
    }
});

// the schema is useless so far
// we need to create a model using it
var instagramuser = mongoose.model('Instagramuser', instagramuserSchema );

// make this available to our Node applications
module.exports = instagramuser;