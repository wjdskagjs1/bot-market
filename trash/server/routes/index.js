var express = require('express');
var router = express.Router();

// 1. mongoose 모듈 가져오기
var mongoose = require('mongoose');
const { compile } = require('morgan');
// 2. testDB 세팅
mongoose.connect('mongodb+srv://nodebb:1234@cluster0.9zhem.mongodb.net/bot-market?retryWrites=true&w=majority');
// 3. 연결된 testDB 사용
var db = mongoose.connection;
// 4. 연결 실패
db.on('error', function(){
    console.log('Connection Failed!');
});
// 5. 연결 성공
db.once('open', function() {
    console.log('Connected!');
});

// 6. Schema 생성. (혹시 스키마에 대한 개념이 없다면, 입력될 데이터의 타입이 정의된 DB 설계도 라고 생각하면 됩니다.)
var user = mongoose.Schema({
    uid : 'number',
    username : 'string',
    key : 'string',
    days : 'number',
    serverName : 'string',
});

// 7. 정의된 스키마를 객체처럼 사용할 수 있도록 model() 함수로 컴파일
var Trial = mongoose.model('trial', user);

/* GET home page. */
router.post('/trial/enroll', (req, res, next) => {
    
    console.log(req.body.params);
    const { uid, username } = req.body.params;
    if( !uid && !username){
        console.log('uid or username is null');
        return;
    }

    // 8. Student 객체를 new 로 생성해서 값을 입력
    var newTrial = new Trial({
        uid: uid,
        username: username,
        authKey: '1234',
        days: '30',
        serverName: '',
    });
    
    // 9. 데이터 저장
    newTrial.save(function(error, data){
        if(error){
            console.log(error);
            res.json({
                result: 'error'
            });
        }else{
            console.log('Saved!');
            res.json({ 
                result: 'saved'
            });
        }
    });
    
});

module.exports = router;
