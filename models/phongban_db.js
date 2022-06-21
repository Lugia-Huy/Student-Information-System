var mongoose = require('mongoose')
var Schema = mongoose.Schema

var DepartmentSchema = new Schema({
    name: String,
    content: String
})

module.exports = mongoose.model('PhongBan', DepartmentSchema)