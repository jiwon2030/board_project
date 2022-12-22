const express = require('express') // express 모듈 가져오기
const app = express()
const port = 8000 // 포트번호 8000번으로 설정


const bodyParser = require('body-parser') // express에서 제공되는 bodyParser 모듈
const cookieParser = require('cookie-parser') // express에서 제공되는 cookieParser 모듈


const { User } = require("./models/user")
const { Board } = require("./models/board")
const { auth } = require('./middleware/auth')

const config = require('./config/dev')

app.set('view engine','ejs');
app.set('views', './views/board');

const mongoose = require('mongoose') // mongoose 모듈 가져오기
// App에 MongoDB 연결하기
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log(err)) 

app.use(bodyParser.urlencoded({extended: true})) // application/x-www-form-urlencoded 형식으로 되어 있는 정보를 분석

app.use(bodyParser.json()) // application/json으로 되어 있는 정보를 분석
app.use(cookieParser()) 

// 게시판 get요청
app.get('/', async (req, res) => {
    const board = await Board.find({
        order: [['day', 'DESC']]   
    })
    res.render('./board', { board: board });
})


//////////////////////////// USER ////////////////////////////

// 회원가입 기능
// 수정된부분 by uijin
app.get('/signUp', (req, res) => {
    res.render('../account/signUP'); //경로수정으로 회원가입 페이지 접근 해결
})
////////////////////////////////////

app.post('/api/users/signUP', (req, res) => {
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

// 수정된부분 by uijin
app.get('/login', (req, res) => {
    res.render('../account/login'); //로그인 페이지 접근해결
})
///////////////////////////////////

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
            if(err) return res.status(400).send(err);
            if(!isMatch)
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다. 다시 입력해주세요" })
            
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

app.get('/api/users/auth', auth, (req, res) => {
    // Authentication이 True로 미들웨어를 통과해 왔다는 뜻.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true, // role이 0 -> 일반 사용자, 1 -> 관리자
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

///// 개시물 조회 수정부분
// 수정된부분 by uijin
app.get('/boardRead', async (req, res) => {
    let boardId = req.query.boardId;
    try {
        const read = await Board.findOne({where: { boardId }});
        res.render('../board/boardRead', {
            boardId,
            boardRead: read,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

// 게시글 작성 페이지
app.get('/auth/boardCreate', auth, async (req, res) => {
    res.status(200).send({
        result: "success",
        status: 200,
    });
})
app.get('/boardCreate', async (req, res) => {
    res.render('./board/boardCreate');
})


// 게시글 수정 페이지
app.get('/boardUpdate', async (req, res) => {
    let boardId = req.query.boardId;

    try {
        const read = await Board.findOne({where: { boardId }});

        res.render('./board/boardUpdate', {
            boardId,
            readBoard: read, 
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
})


app.listen(port, () => console.log(`listening on port ${port}`))