const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require("./models/user");
const router = express.Router();

router.post('/signUp', async (req, res) => {
    // 회원가입할 때 필요한 정보들을 client에서 가져오면 데이터 베이스에 넣어준다.
    const user = new User(req.body) // req.body에 id나 password같은 정보가 들어간다.

    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err })
        // 성공했다는 정보를 모달창으로 띄우기
        return res.status(200).send({
            success: true,
            modal_title: "회원가입 성공",
            modal_body: "회원이 되신것을 축하드립니다!"
        })
    })
})

router.post('/login', async (req, res) => {
    // 요청된 아이디를 데이터베이스에서 있는지 찾는다.
    User.findOne({ id: req.body.id, isDeleted: false }, (err, user) => {
        if(!user) {
            return res.send({
                loginSuccess: false,
                modal_title: "로그인 실패",
                modal_body: "존재하지 않은 아이디입니다."
            })
        }

        // 요청된 아이디가 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인한다.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(err) return res.status(400).send(err);
            if(!isMatch)
                return res.send({ 
                    loginSuccess: false, 
                    modal_title: "비밀번호 오류",
                    modal_body: "비밀번호가 틀렸습니다. 다시 입력해주세요" 
                })
            
            // 비밀번호까지 일치한다면 토큰을 생성한다.
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err) // error가 있다는 것을 client에 전달해준다.
                // 토큰을 쿠키에 저장한다.
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id }) 

            })
        })
    })
})

module.exports = router;