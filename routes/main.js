const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const botList = require('../botList.json');

const {
  client_id,
  client_secret,
} = process.env; //require('../config.json');

/* GET home page. */
router.get('/', async (req, res, next) => {
  const accessCode = req.query.code;
  if(accessCode){
    let params = new URLSearchParams();
    params.append('client_id', client_id);
    params.append('client_secret', client_secret);
    params.append('code', accessCode);
    params.append('grant_type', 'authorization_code');
    params.append('scope', ['identify', 'guilds']);
    params.append('redirect_uri', 'http://bot-market.kro.kr/main'); //redirect uri must be matched
  
    await fetch('https://discordapp.com/api/oauth2/token', {
          method: 'POST',
          body: params,
      })
      .then(response => {
          response.json().then(async (auth_token)=>{
              const { token_type, access_token } = auth_token;
              console.log(auth_token);
              res.render('main', { token_type: token_type, access_token: access_token });
          })
      })
      .catch(error => {
          console.log(`So... this just happen: ${error}`);
          res.render('error');
      });
  }else{
    res.render('main', { token_type: '', access_token: '' });
  }
});

router.get('/:bot_id', function(req, res, next) {
  const bot_id = req.params.bot_id;
  console.log(req.params);
  res.render('dashboard', {
    bot_id: bot_id,
    bot_name: botList[parseInt(bot_id)]['bot_name'],
    bot_price: botList[parseInt(bot_id)]['bot_price'],
    guild_id: ''
  });
});

router.get('/:bot_id/:guild_id', function(req, res, next) {
  const {
    bot_id,
    guild_id
  } = req.params;
  console.log(req.params);
  res.render('dashboard', {
    bot_id: bot_id,
    bot_name: botList[parseInt(bot_id)]['bot_name'],
    bot_price: botList[parseInt(bot_id)]['bot_price'],
    guild_id: guild_id
  });
});

module.exports = router;
