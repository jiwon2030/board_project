const express = require('express') // express 모듈 가져오기
const app = express()
const port = 5000 // 포트번호 5000번으로 설정

const mongoose = require('mongoose') // mongoose 모듈 가져오기
// App에 MongoDB 연결하기
mongoose.connect('mongodb+srv://jiwon:asdf1234@cluster0.ogosvhy.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log(err)) 


app.get('/', (req, res) => res.send('Hellow World!')) // route 디렉토리에 오면 메세지 출력 

app.listen(port, () => console.log(`listening on port ${port}`))