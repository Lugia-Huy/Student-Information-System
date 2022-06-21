var mongoose = require('mongoose')
var Schema = mongoose.Schema

var TopicSchema = new Schema({
    name: String,
    content: String,
    cover: String
})
 
module.exports = mongoose.model('ChuDe', TopicSchema)