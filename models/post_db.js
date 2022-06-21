var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PostSchema = new Schema({
    user: String,
    user_cover: String,
    content: String,
    linkimage: String,
    linkyoutube: String,
	linkembed: String, 
    created: Date,
    comment: String
})

module.exports = mongoose.model('Post', PostSchema)