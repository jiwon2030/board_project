# board_project

컴퓨터 응용설계\
도커를 사용한 웹 CRUD 게시판 서비스 배포

-----------------------------------------

## install
```c
cd “YOUR_DOWNLOAD_LOCATION”

git clone --recursive https://github.com/jiwon2030/board_project.git
```

## insert into /web/config File (dev.js)
```c
module.exports = {
    mongoURI: 'mongodb+srv://"mongoDB에서 저장한 아이디:비밀번호"@"cluster이름".ogosvhy.mongodb.net/?retryWrites=true&w=majority'
}
```

## Environment Setting

```c
npm install
```

웹 동작 확인
--------------------------------
현재 디렉토리서 web디렉토리로 이동필요
cd board_project/web/
