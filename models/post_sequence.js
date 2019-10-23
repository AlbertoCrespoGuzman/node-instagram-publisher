var mongoose = require('mongoose')
var Schema = mongoose.Schema

var post_sequenceSchema = new Schema({
    last:  {
        type: String,
        default: ''
    }
});
var post_sequence = mongoose.model('PostSequence', post_sequenceSchema )

module.exports = post_sequence