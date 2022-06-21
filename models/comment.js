var mongoose = require('mongoose')
var Schema = mongoose.Schema

var CommentSchema = new Schema({
    user: String,
    user_cover: String,
    post: String,
    content: String,
    created: Date,
})

module.exports = mongoose.model('Comment', CommentSchema)