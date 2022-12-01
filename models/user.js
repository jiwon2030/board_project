const mongoose = require('mongoose') // mongoose 모듈 가져오기

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 100
    },
    id: {
        type: String,
        trim: true,
        maxlength: 15,
        unique: 1
    },
    password: {
        type: String,
        minlenth: 8
    },
    role: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

const User = mongoose.model('user', userSchema)

module.exports = { User }