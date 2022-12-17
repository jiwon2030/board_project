const express = require('express') // express 모듈 가져오기
const app = express()
const port = 8000 // 포트번호 8000번으로 설정
const bodyParser = require('body-parser') // express에서 제공되는 bodyParser 모듈
const cookieParser = require('cookie-parser') // express에서 제공되는 cookieParser 모듈
const { User } = require("./models/user")
const { Board } = require("./models/board")
const { auth } = require('./middleware/auth')

const config = require('./config/dev')

const mongoose = require('mongoose') // mongoose 모듈 가져오기
// App에 MongoDB 연결하기
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log(err)) 

app.use(bodyParser.urlencoded({extended: true})) // application/x-www-form-urlencoded 형식으로 되어 있는 정보를 분석

app.use(bodyParser.json()) // application/json으로 되어 있는 정보를 분석
app.use(cookieParser()) 

app.get('/', async (req, res) => {
    const boards = await Board.find({
        order: [['day', 'DESC']]   
    })
    res.render('./views/board/board.js', { boards: boards });
})


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
    User.findOne({ id: req.body.id, isDeleted: false }, (err, user) => {
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
                return res.cookie("x_auth", user.token)
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

////////////////////// BOARD //////////////////////

// 게시물 생성 기능
// 로그인 시 생성한 토큰을 쿠키에서 가져온 후 게시물 생성 > 게시물 작성하려면 로그인 필수
// @json : title, content
app.post('/api/boards', auth, (req, res) => {
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
// 게시물 업로드한 본인만 수정 가능 > 로그인 해야함
// @json : title, content
app.patch("/api/boards/:id", auth, (req, res) => {
    Board.findOneAndUpdate({ _id: req.params.id, userId:req.user._id, isDeleted: false }, { title: req.body.title, content: req.body.content, updatedAt: new Date() }, (err, board) => {
        if (err) return res.status(400).json({ success: false, err });
        if (board == null) return res.status(404).json({ success: false, message: "can't find board" });
        return res.status(200).send({
            success: true,
        });
    });
})

// 게시물 삭제 > 특정 게시물 ID로 삭제
// 게시물 업로드한 본인만 삭제 가능 > 로그인 해야함
app.delete("/api/boards/:id", auth, (req, res) => {
    Board.findOneAndUpdate({ _id: req.params.id, userId:req.user._id, isDeleted: false }, { isDeleted: true, updatedAt: new Date() }, (err, board) => {
        if (err) return res.status(400).json({ success: false, err });
        if (board == null) return res.status(404).json({ success: false, message: "can't find board" });
        return res.status(200).send({
            success: true,
        });
    });
});

app.listen(port, () => console.log(`listening on port ${port}`))