var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema({
    authId: String,
    mssv: {
        type: String,
        default: '518HXXXX'
    },
    name: String,
    email: String,
    password: {
        type: String,
        default: '123456'
    },
    classs: {
        type: String,
        default: '18H50202'
    },
    faculty: {
        type: String,
        default: 'Công nghệ thông tin'
    },
    role: String,
    cover: {
        type: String,
        default: '/images/logo.jpg'
    },
    created: Date,
})

module.exports = mongoose.model('User', UserSchema)