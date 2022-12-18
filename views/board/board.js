const express = require('express');
const { User } = require("./models/user")
const { Board } = require("./models/board")
const { auth } = require('./middleware/auth')
const router = express.Router();

// 게시글 작성
router.post('/boardCreate', auth, async (req, res) => {
    try {
        const { title, contents } = req.body;
        const { user } = res.locals;
        const name = user['dataValues']['name'];

        let boardId = await Board.findAll({
            order: [['boardId', 'DESC']],
            limit: 1
        });

        if (boardId.length == 0) {
            boardId = 1
        } else {
            boardId = boardId[0]['boardId'] + 1;
        }

        const today = new Date();
        const utc = today.getTime() + (today.getTimezoneOffset() * 60 * 1000);
        const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

        const kr_today = new Date(utc + KR_TIME_DIFF + 32400000);
        const day = kr_today;

        await Board.create({ boardId, name, title, contents, day });

        res.status(200).send({
            result: "success",
            status: 200,
            modal_title: "저장 성공",
            modal_body: "글이 성공적으로 저장 되었습니다."
        });
    } catch (err) {
        res.status(400).send({
            result: "fail",
            status: 400,
            modal_title: "저장 실패",
            modal_body: "내용 확인 후, 다시 작성해주세요."
        });
    }
})

// readBoard에서 수정하기 혹은 삭제하기 
router.post('/chkPW', auth, async (req, res) => {
    try {
        const { boardId, passWord, nowButton } = req.body;
        const { user } = res.locals;
        const name = user['dataValues']['name'];

        User.hasMany(Board, { foreignKey: 'name' });
        Board.belongsTo(User, { foreignKey: 'name' });

        const findIdPw = await Board.findOne({
            include: [
                {
                    model: User,
                    required: true,
                    where: {
                        _id, passWord
                    }
                }
            ],
            where: {
                boardId
            }
        });


        if (findIdPw != null) {
            if (nowButton == 'updateButton') {
                res.status(200).send({
                    result: "success",
                    status: 200
                });
            } else {

                await Comment.destroy({
                    where: {
                        boardId
                    }
                });

                await Board.destroy({
                    where: {
                        boardId
                    }
                });

                res.status(200).send({
                    result: "success",
                    status: 200,
                    modal_title: "삭제 성공",
                    modal_body: "글이 성공적으로 삭제 되었습니다."
                });
            }
        } else {
            res.status(400).send({
                result: "fail",
                status: 400,
                modal_title: "확인 필요",
                modal_body: "비밀번호를 확인해주세요."
            });
        }
    } catch (err) {
        res.status(400).send({
            result: "fail",
            status: 400,
            modal_title: "확인 필요",
            modal_body: "비밀번호를 확인해주세요."
        });
    }
})

// boardUpdate에서 수정하기 혹은 삭제하기 
router.post('/boardUpdate', async (req, res) => {
    try {
        const { boardId, title, contents, nowButton } = req.body;
        const findIdPw = await Board.findOne({
            where: {
                boardId
            }
        });


        if (findIdPw != null) {
            if (nowButton == 'updateButton') {
                await Board.update(
                    {
                        title: title,
                        contents: contents
                    },
                    {
                        where: {
                            boardId
                        }
                    },
                );

                res.status(200).send({
                    result: "success",
                    status: 200,
                    modal_title: "수정 성공",
                    modal_body: "글이 성공적으로 수정 되었습니다."
                });

            } else {
                await Comment.destroy({
                    where: {
                        boardId
                    }
                });

                await Board.destroy({
                    where: {
                        boardId
                    }
                });

                res.status(200).send({
                    result: "success",
                    status: 200,
                    modal_title: "삭제 성공",
                    modal_body: "글이 성공적으로 삭제 되었습니다."
                });
            }
        }
    } catch (err) {
        res.status(400).send({
            result: "fail",
            status: 400,
            modal_title: "삭제 실패",
            modal_body: "제목 혹은 내용을 확인해주세요."
        });
    }
})

module.exports = router;