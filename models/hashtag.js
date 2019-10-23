    var mongoose = require('mongoose')
    var Schema = mongoose.Schema

    var hashtagSchema = new Schema({
        color:  {
            type: String,
            default: '#000000'
        },
        name:  {
            type: String
        }
    });
    var hashtag = mongoose.model('Hashtag', hashtagSchema )

    module.exports = hashtag