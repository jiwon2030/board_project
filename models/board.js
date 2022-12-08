const mongoose = require('mongoose') // mongoose 모듈 가져오기

// TO-DO > 시간 한국 기준으로 변경

const boardSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // 여기 수정
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

const Board = mongoose.model('board', boardSchema)

module.exports = { Board }