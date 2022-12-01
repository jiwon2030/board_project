const express = require('express') // express 모듈 가져오기
const app = express()
const port = 5000 // 포트번호 5000번으로 설정
const bodyParser = require('body-parser')
const { User } = require("./models/user")

const config = require('./config/dev')

const mongoose = require('mongoose') // mongoose 모듈 가져오기
// App에 MongoDB 연결하기
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log(err)) 


app.use(bodyParser.urlencoded({extended: true})) // application/x-www-form-urlencoded 형식으로 되어 있는 정보를 분석

app.use(bodyParser.json()) // application/json으로 되어 있는 정보를 분석

app.get('/', (req, res) => res.send('Hellow World!')) // route 디렉토리에 오면 메세지 출력 

app.post('/register', (req, res) => {
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

app.listen(port, () => console.log(`listening on port ${port}`))