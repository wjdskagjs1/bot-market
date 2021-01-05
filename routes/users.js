var express = require('express');
var router = express.Router();
const { mongouri } = require('../config.json');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 1. mongoose 모듈 가져오기
var mongoose = require('mongoose');
const { compile } = require('morgan');
// 2. testDB 세팅
mongoose.connect(mongouri);
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
var user = new mongoose.Schema({
    bot_id: Number,
    userid: String,
    usercode: String,
    username: String,
    guild_id: String,
    guild_name: String,
    start_date: String,
    end_date: String,
    trial: Boolean,
    enable: Boolean,
    billing_key: String,
    channels: String
});

// 7. 정의된 스키마를 객체처럼 사용할 수 있도록 model() 함수로 컴파일
var User = mongoose.model('user', user);

router.get('/findOne/:guild_id', (req, res, next) => {
  const { guild_id } = req.params;
  console.log(guild_id)
  User.findOne({guild_id: guild_id}, (err, data)=>{
    if(err){
        console.log(err);
    }else{
        if(data === null){
            res.json({});
        }else{
            res.json(data);
        }
    }
});
});
/* GET home page. */
router.post('/trial/enroll', (req, res, next) => {
    console.log(User);
    const {
        bot_id,
        userid,
        usercode,
        username,
        guild_id,
        guild_name,
    } = req.body.params;
    const start_date = new Date().format("yyyy-MM-dd E hh:mm:ss").toString();
    const end_date = new Date().addMonths(1).format("yyyy-MM-dd E hh:mm:ss").toString();
    console.log(1);
    // 8. Student 객체를 new 로 생성해서 값을 입력
    var newTrial = new User({
        bot_id: parseInt(bot_id),
        userid: userid,
        usercode: usercode,
        username: username,
        guild_id: guild_id,
        guild_name: guild_name,
        start_date: start_date,
        end_date: end_date,
        trial: true,
        enable: false,
        billing_key: '{}',
        channels: ''
    });
    console.log(2);
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
    console.log(3);
});

Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";
 
    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;
     
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};
 
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

module.exports = router;
