var mongoose = require('mongoose')
var Schema = mongoose.Schema

var NewsSchema = new Schema({
    name: String,
    topic: String,
    department: String,
    content: String,
    created: Date,
})

module.exports = mongoose.model('ThongBao', NewsSchema)