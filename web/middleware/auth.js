const { User } = require("../models/user")

let auth = (req, res, next) => {
    // 인증 처리를 하는 곳
    // client cookie에서 token을 가져온다.(cookieParser 이용)
    let token = req.cookies.x_auth

    // token을 decode한 후 사용자를 찾는다.
    User.findByToken(token, (err, user) => {
        // 사용자가 없다면 에러 메시지 출력
        if(err) throw err;
        if(!user) return res.json({ isAuth: false, error: true })

        //사용자가 있다면 token과 user를 req에 저장하고 main.js로 이동
        req.token = token
        req.user = user
        next()
    })

    // 사용자를 찾으면 인증 완료

    // 사용자가 없으면 인증 실패
}

module.exports = { auth };