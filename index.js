const express = require('express') // express 모듈 가져오기
const app = express()
const port = 5000 // 포트번호 5000번으로 설정
const bodyParser = require('body-parser') // express에서 제공되는 bodyParser 모듈
const cookieParser = require('cookie-parser') // express에서 제공되는 cookieParser 모듈
const { User } = require("./models/user")
const { Board } = require("./models/board")
const { auth } = require('./middleware/auth')

const config = require('./config/dev')

const mongoose = require('mongoose') // mongoose 모듈 가져오기
const e = require('express')
// App에 MongoDB 연결하기
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log(err)) 


app.use(bodyParser.urlencoded({extended: true})) // application/x-www-form-urlencoded 형식으로 되어 있는 정보를 분석

app.use(bodyParser.json()) // application/json으로 되어 있는 정보를 분석
app.use(cookieParser()) 

app.get('/', (req, res) => res.send('Hellow World!')) // route 디렉토리에 오면 메세지 출력 


//////////////////////////// USER ////////////////////////////

// 회원가입 기능
app.post('/api/users/register', (req, res) => {
    // 회원가입할 때 필요한 정보들을 client에서 가져오면 데이터 베이스에 넣어준다.
    const user = new User(req.body) // req.body에 id나 password같은 정보가 들어간다.

    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err})
        // 성공했다는 정보를 json형식으로 전달
        return res.status(200).json({
            success: true
        })
    })
})

// 로그인 기능
app.post('/api/users/login', (req, res) => {
    // 요청된 아이디를 데이터베이스에서 있는지 찾는다.
    User.findOne({ id: req.body.id }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "존재하지 않은 아이디입니다."
            })
        }
        // 요청된 아이디가 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인한다.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
            return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다. 다시 입력해주세요" })

            // 비밀번호까지 일치한다면 토큰을 생성한다.
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err) // error가 있다는 것을 client에 전달해준다.
                
                // 토큰을 쿠키에 저장한다.
                res.cookie("x_auth", user.token)
                .status(200)
                .json({ loginSuccess:true, userId: user._id }) 

            })
        })
    })
})

app.get('/api/users/auth', auth, (req, res) => {
    // Authentication이 True로 미들웨어를 통과해 왔다는 뜻.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role == 0 ? false : true, // role이 0 -> 일반 사용자, 0이 아니면 관리자
        isAuth: true,
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" },
        (err, user) => {
            if(err) return res.json({ success: false, err })
            return res.status(200).send({ success: true })
        })
})



//////////////////////////// BOARD ////////////////////////////

// TO-DO > 시간 한국 기준으로 변경

// 게시물 생성 기능
// 토큰을 가져와서 users 테이블의 _id를 찾아서 저장해줘야 함
// @json : title, content
app.post('/api/boards', (req, res) => {

    // 이곳에서 뭔가 작업을 해줘야 하거나 미들웨어를 둬야 함

    User.findOne({ _id: "토큰을 통해 찾은 _id가 들어가야 함", isDeleted: false }, (err, user) => {
        if (!user) {
          return res.status(400).json({
            success: false,
            message: " 제공된 _id에 해당하는 user가 없습니다.",
          });
        }

        const board = new Board(req.body)

        board.save((err, boardInfo) => {
            if(err) return res.json({ success: false, err})
            // 성공했다는 정보를 json형식으로 전달
            return res.status(200).json({
                success: true
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
app.patch("/api/boards/:id", (req, res) => {
    Board.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { title: req.body.title, content: req.body.content, updatedAt: new Date() }, (err, board) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).send({
            success: true,
        });
    });
});

// 게시물 삭제 > 특정 게시물 ID로 삭제
app.delete("/api/boards/:id", (req, res) => {
    Board.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true, updatedAt: new Date() }, (err, board) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).send({
            success: true,
        });
    });
});
  

app.listen(port, () => console.log(`listening on port ${port}`))