var express = require('express');
var router = express.Router();
const { 
    mongouri,
    rest_application_ID,
    bootpay_private_key
 } = process.env; //require('../config.json');
const RestClient = require('@bootpay/server-rest-client').RestClient;
RestClient.setConfig(
    rest_application_ID,
    bootpay_private_key
);


const botList = require('../botList.json');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1;
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
};

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
const user = new mongoose.Schema({
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
    setting: {
        channels: Array
    }
});
const newSetting = {
    channels: []
}

// 7. 정의된 스키마를 객체처럼 사용할 수 있도록 model() 함수로 컴파일
const User = mongoose.model('user', user);

const receipt = mongoose.Schema({
    order_id: String,
    bot_id: String,
    userid: String,
    guild_id: String,
    date: Date
});

const Receipt = mongoose.model('receipt', receipt);

router.get('/test/:bot_id', (req, res, next) => {
    const { bot_id } = req.params;

    const newUser = new User({
        bot_id: bot_id,
        userid: 'userid',
        usercode: 'usercode',
        username: 'username',
        guild_id: 'guild_id',
        guild_name: 'guild_name',
        trial: false,
        enable: true,
        billing_info: [],
        setting: newSetting
    });
    // 9. 데이터 저장
    newUser.save(function(error, data){
        if(error){
            console.log(error);
            res.json({
                result: 'fail'
            });
        }else{
            User.find({bot_id: bot_id}, (err, data)=>{
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
        }
    });
    
  });

router.get('/findOne/:bot_id/:guild_id', (req, res, next) => {
  const { bot_id, guild_id } = req.params;

  User.findOne({bot_id: bot_id, guild_id: guild_id}, (err, data)=>{
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

    User.countDocuments({bot_id: bot_id, $or:[{trial: true}, {enable: true}]}, (err, count)=>{
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
    const end_date = start_date.addDays(30);

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
                    setting: newSetting
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
        setting
    } = req.body.params;

    User.updateOne({
        bot_id: bot_id,
        userid: userid,
        usercode: usercode,
        guild_id: guild_id,
    }, { $set: { setting: setting } },(err, data)=>{
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

    User.updateOne({
        bot_id: bot_id,
        userid: userid,
        usercode: usercode,
        guild_id: guild_id,
    },{$set: {enable: false} }, (err, data)=>{
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
    const start_date = new Date();
    const end_date = start_date.addDays(30);

    RestClient.getAccessToken().then(function (response) {
        if (response.status === 200) {
            const { token } = response.data;
            const order_id = `${bot_id}-${userid}-${start_date.yyyymmdd()}`;

            Receipt.findOne({order_id: order_id}, (err, data2)=>{
                if(err){
                    console.log(err);
                }else{
                    if(data2 === null){
                        RestClient.requestSubscribeBillingPayment({
                            billingKey: billing_info[0], // 빌링키
                            itemName: billing_info[1], // 정기결제 아이템명
                            price: parseInt(billing_info[3]), // 결제 금액
                            orderId: order_id, // 유니크한 주문번호
                        }).then(function (response) {
                            if (response.status === 200) {
                                User.findOne({bot_id: bot_id, userid: userid, guild_id: guild_id}, (err, data3)=>{
                                    if(err){
                                        console.log(err);
                                    }else{
                                        if(data3 === null){
                                            // 8. Student 객체를 new 로 생성해서 값을 입력
                                            const newUser = new User({
                                                bot_id: bot_id,
                                                userid: userid,
                                                usercode: usercode,
                                                username: username,
                                                guild_id: guild_id,
                                                guild_name: guild_name,
                                                start_date: start_date,
                                                end_date: end_date,
                                                trial: false,
                                                enable: true,
                                                billing_info: billing_info,
                                                setting: newSetting
                                            });
                                            // 9. 데이터 저장
                                            newUser.save(function(error, data4){
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
                                                guild_id: guild_id,
                                            }, { $set: { 
                                                start_date: start_date,
                                                end_date: end_date,
                                                enable: true,
                                                billing_info: billing_info
                                            } },(err, data5)=>{
                                                if(err){
                                                    console.log(err);
                                                    res.json({ result: 'fail'});
                                                }else{
                                                    res.json({ result: 'success'});
                                                }
                                            });
                                        }
                                        const newReceipt = new Receipt({
                                            order_id: order_id,
                                            bot_id: bot_id,
                                            userid: userid,
                                            guild_id: guild_id,
                                            date: start_date
                                        });
                                        newReceipt.save(function(error, data){
                                            if(error){
                                                console.log(error);
                                            }
                                        });
                                    }
                                });
                            }
                        }).catch((reason)=>{
                            res.json({ result: 'fail'});
                        });
                    }
                }
            });
        }
    }).catch(console.error);

    
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
