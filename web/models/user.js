const mongoose = require('mongoose') // mongoose 모듈 가져오기
const bcrypt = require('bcrypt') // bcrypt 모듈 가져오기
const saltRounds = 15
const jwt = require('jsonwebtoken')

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
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updatedAt : {
        type: Date
    },
    isDeleted : {
        type: Boolean,
        default: false,
        required: true,
    },
})

userSchema.pre('save', function( next ){
    var user = this;

    if(user.isModified('password')) {
        // password를 변경할 때에만 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                user.password = hash
                next()
            })
        })   
    } else {
        next() // password 외에 다른 정보를 수정할 때에는 index.js에 있는 user.save 실행
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
    // 입력한 비밀번호를 암호화하여 기존의 암호화된 데이터베이스에 있는 비밀번호와 비교한다.
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err)
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;
    // jsonwebtoken을 이용하여 token을 생성해준다.
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    user.token = token
    user.updatedAt = CurrentTime.getCurrentDate();

    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this

    // token을 decode한다.
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // 사용자 아이디를 이용해서 사용자를 찾은 다음에 client에서 가져온 token과 DB에 보관된 token이 일치하는지 확인
        user.findOne({"_id": decoded, "token": token, "isDeleted": false}, function(err, user) {
            if(err) return cb(err)
            cb(null, user)
        })
    })
}

const User = mongoose.model('user', userSchema)

module.exports = { User }