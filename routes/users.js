var express = require('express');
var router = express.Router();
const { mongouri } = require('../config.json');
const botList = require('../botList.json');

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
var user = mongoose.Schema({
    bot_id: String,
    userid: String,
    usercode: String,
    username: String,
    guild_id: String,
    guild_name: String,
    start_date: Date,
    end_date: Date,
    trial: Boolean,
    enable: Boolean,
    billing_info: Array,
    channels: Array
});

// 7. 정의된 스키마를 객체처럼 사용할 수 있도록 model() 함수로 컴파일
var User = mongoose.model('user', user);

router.get('/findOne/:guild_id', (req, res, next) => {
  const { guild_id } = req.params;
  console.log(guild_id);
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

router.get('/left/:bot_id', (req, res, next)=>{
    const {
        bot_id
    } = req.params;

    const MAX = 100;

    User.count({bot_id: bot_id, $or:[{trial: true}, {enable: true}]}, (err, count)=>{
        if(err){
            console.log(err);
        }else{
            res.json({ 
                left: (count < MAX),
                count: MAX - count
            });
        }
    })
    
})

router.post('/trial/enroll', (req, res, next) => {
    const {
        bot_id,
        userid,
        usercode,
        username,
        guild_id,
        guild_name,
    } = req.body.params;
    const start_date = new Date();
    const end_date = addMonths(new Date(), 1);

    User.findOne({guild_id: guild_id}, (err, data)=>{
        if(err){
            console.log(err);
        }else{
            if(data === null){
                // 8. Student 객체를 new 로 생성해서 값을 입력
                var newTrial = new User({
                    bot_id: bot_id,
                    userid: userid,
                    usercode: usercode,
                    username: username,
                    guild_id: guild_id,
                    guild_name: guild_name,
                    start_date: start_date,
                    end_date: end_date,
                    trial: true,
                    enable: false,
                    billing_info: [],
                    channels: []
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
            }else{
                if(data['enable']){
                    res.json({ 
                        result: '사용 중'
                    });
                }else if(data['trial'] === false){
                    res.json({ 
                        result: '체험판 만료'
                    });
                }
            }
        }
    });
});

router.post('/update', (req, res, next) => {
    const {
        bot_id,
        userid,
        usercode,
        guild_id,
        channels
    } = req.body.params;

    User.updateOne({
        bot_id: bot_id,
        userid: userid,
        usercode: usercode,
        guild_id: guild_id,
    }, { $set: { channels: channels } },(err, data)=>{
        if(err){
            console.log(err);
            res.json({ result: 'fail'});
        }else{
            res.json({ result: 'success'});
        }
    });
});

router.post('/cancel', (req, res, next) => {
    const {
        bot_id,
        userid,
        usercode,
        guild_id
    } = req.body.params;

    User.remove({
        bot_id: bot_id,
        userid: userid,
        usercode: usercode,
        guild_id: guild_id,
    },(err, data)=>{
        if(err){
            console.log(err);
            res.json({ result: 'fail'});
        }else{
            res.json({ result: 'success'});
        }
    });
});

router.post('/buy', (req, res, next) => {
    const {
        bot_id,
        userid,
        username,
        usercode,
        guild_id,
        guild_name,
        billing_info
    } = req.body.params;

    if(billing_info[3] !== botList[parseInt(bot_id)]['bot_price']){
        return;
    }

    User.findOne({guild_id: guild_id}, (err, data)=>{
        if(err){
            console.log(err);
        }else{
            if(data === null){
                // 8. Student 객체를 new 로 생성해서 값을 입력
                const newUser = new User({
                    bot_id: bot_id,
                    userid: userid,
                    usercode: usercode,
                    username: username,
                    guild_id: guild_id,
                    guild_name: guild_name,
                    trial: false,
                    enable: true,
                    billing_info: billing_info,
                    channels: []
                });
                // 9. 데이터 저장
                newUser.save(function(error, data){
                    if(error){
                        console.log(error);
                        res.json({
                            result: 'fail'
                        });
                    }else{
                        res.json({ 
                            result: 'success'
                        });
                    }
                });
            }else{
                User.updateOne({
                    bot_id: bot_id,
                    userid: userid,
                    usercode: usercode,
                    guild_id: guild_id,
                }, { $set: { enable: true, billing_info: billing_info} },(err, data)=>{
                    if(err){
                        console.log(err);
                        res.json({ result: 'fail'});
                    }else{
                        res.json({ result: 'success'});
                    }
                });
            }
        }
    });
});

function addMonths(date, months) {
    var d = date.getDate();
    date.setMonth(date.getMonth() + +months);
    if (date.getDate() != d) {
      date.setDate(0);
    }
    return date;
}

module.exports = router;
