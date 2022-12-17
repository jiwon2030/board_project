const express = require('express');
const { User } = require("./models/user")
const { Board } = require("./models/board")
const { auth } = require('./middleware/auth')
const router = express.Router();

// 게시물 생성 기능
// 로그인 시 생성한 토큰을 쿠키에서 가져온 후 게시물 생성 > 게시물 작성하려면 로그인 필수
// @json : title, content
app.post('/api/boards', auth, (req, res) => {
    User.findOne({ _id: req.user._id, isDeleted: false }, (err, user) => {
        if (!user) {
          return res.status(400).send({
            success: false,
            modal_title: "저장 실패",
            modal_body: " 제공된 _id에 해당하는 user가 없습니다.",
          });
        }

        const board = new Board(req.body)
        board.userId = user._id

        board.save((err, boardInfo) => {
            if(err) return res.json({ success: false, err})
            return res.status(200).send({
                success: true,
                modal_title: "저장 성공",
                modal_body: "글이 저장되었습니다.",
            })
        })
    })
})

// 게시물 전체 조회
app.get("/api/boards", async (req, res) => {
    const list = await Board.find({ isDeleted: false }).populate('userId');

    res.status(200).send({ boards: list });
});

// 게시물 상세페이지 조회 > 특정 게시물 ID로 조회
app.get("/api/boards/:id", async (req, res) => {
    const board = await Board.findOne({ _id: req.params.id, isDeleted: false }).populate("userId");

    return res.status(200).send({ board: board});
});

// 게시물 수정 > 특정 게시물 ID로 수정
// 게시물 업로드한 본인만 수정 가능 > 로그인 해야함
// @json : title, content
app.patch("/api/boards/:id", auth, (req, res) => {
    Board.findOneAndUpdate({ _id: req.params.id, userId:req.user._id, isDeleted: false }, { title: req.body.title, content: req.body.content, updatedAt: new Date() }, (err, board) => {
        if (err) return res.status(400).json({ success: false, err });
        if (board == null) return res.status(404).json({ success: false, message: "can't find board" });
        return res.status(200).send({
            success: true,
            modal_title: "수정 성공",
            modal_body: "글이 수정되었습니다.",
        });
    });
})

// 게시물 삭제 > 특정 게시물 ID로 삭제
// 게시물 업로드한 본인만 삭제 가능 > 로그인 해야함
app.delete("/api/boards/:id", auth, (req, res) => {
    Board.findOneAndUpdate({ _id: req.params.id, userId:req.user._id, isDeleted: false }, { isDeleted: true, updatedAt: new Date() }, (err, board) => {
        if (err) return res.status(400).send({ 
            success: false, err,
            modal_title: "삭제 실패",
            modal_body: "제목 혹은 내용을 확인해주세요.", 
        });
        if (board == null) return res.status(404).send({ 
            success: false, 
            modal_title: "삭제 실패",
            modal_body: "제목 혹은 내용을 확인해주세요."
        });
        return res.status(200).send({
            success: true,
            modal_title: "삭제 성공",
            modal_body: "글이 삭제되었습니다.",
        });
    });
});

module.exports = router;