const express = require('express');
const { User } = require("./models/user")
const { Board } = require("./models/board")
const { auth } = require('./middleware/auth')
const router = express.Router();

// /boardCreate에 게시글 작성
router.post('/api/boards', auth, (req, res) => {
    User.findOne({ _id: req.user._id, isDeleted: false }, (err, user) => {
        if (!user) {
          return res.status(400).json({
            success: false,
            message: " 제공된 _id에 해당하는 user가 없습니다.",
          });
        }

        const board = new Board(req.body)
        board.userId = user._id

        board.save((err, boardInfo) => {
            // 글 작성 실패 시 실패 모달창 띄우기
            if(err) return res.json({ 
                success: false, 
                err,
                status: 400,
                modal_title: "저장 실패",
                modal_body: "내용 확인 후, 다시 작성해주세요."
            })
            // 글 작성 성공 시 성공 모달창 띄우기
            return res.status(200).send({
                result: "success",
                status: 200,
                modal_title: "저장 성공",
                modal_body: "글이 성공적으로 저장 되었습니다."
            })
        })
    })
})

// board에서 게시물 전체 조회
router.get("/api/boards", async (req, res) => {
    const list = await Board.find({ isDeleted: false }).populate('userId');

    res.status(200).send({ boards: list });
});

// boardRead에서 수정하기 혹은 삭제하기 
// 게시물 업로드한 본인만 수정 가능 > 로그인 해야함
router.patch("/boardUpdate", auth, (req, res) => {
    Board.findOneAndUpdate({ _id: req.params.id, userId:req.user._id, isDeleted: false }, { title: req.body.title, content: req.body.content, updatedAt: new Date() }, (err, board) => {
        if (err) 
        return res.status(400).send({ 
            success: false, 
            err,
            modal_title: "확인 필요",
            modal_body: "비밀번호를 확인해주세요." 
        });
        if (board == null) 
        return res.status(404).send({ 
            success: false, 
            message: "can't find board" });
            return res.status(200).send({
            success: true,
            modal_title: "수정 성공",
            modal_body: "글이 성공적으로 수정 되었습니다."
        });
    });
})

// 게시물 삭제 > 특정 게시물 ID로 삭제
// 게시물 업로드한 본인만 삭제 가능 > 로그인 해야함
router.delete("/api/boards/:id", auth, (req, res) => {
    Board.findOneAndUpdate({ _id: req.params.id, userId:req.user._id, isDeleted: false }, { isDeleted: true, updatedAt: new Date() }, (err, board) => {
        if (err) return res.status(400).send({ 
            success: false, 
            err,
            modal_title: "확인 필요",
            modal_body: "비밀번호를 확인해주세요." 
        });
        if (board == null) return res.status(404).json({ 
            success: false, 
            message: "can't find board" 
        });
        return res.status(200).send({
            success: true,
            modal_title: "삭제 성공",
            modal_body: "글이 성공적으로 삭제 되었습니다."
        });
    });
});

module.exports = router;