const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const {
  client_id,
  client_secret,
} = require('../config.json');

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
    params.append('redirect_uri', 'http://127.0.0.1:3000/index'); //redirect uri must be matched
  
    await fetch('https://discordapp.com/api/oauth2/token', {
          method: 'POST',
          body: params,
      })
      .then(response => {
          response.json().then(async (auth_token)=>{
              const { token_type, access_token } = auth_token;
              console.log(auth_token);
              res.render('index', { token_type: token_type, access_token: access_token });
          })
      })
      .catch(error => {
          console.log(`So... this just happen: ${error}`);
          res.render('error');
      });
  }else{
    res.render('index', { token_type: '', access_token: '' });
  }
});

router.get('/:bot_id', function(req, res, next) {
  console.log(req.params);
  res.render('dashboard', {bot_id: req.params.bot_id, guild_id: ''});
});

router.get('/:bot_id/:guild_id', function(req, res, next) {
  console.log(req.params);
  res.render('dashboard', req.params);
});

module.exports = router;
