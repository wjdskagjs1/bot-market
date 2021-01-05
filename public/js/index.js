window.onload = ()=>{
    const sessionStorage = window.sessionStorage;

    if(document.getElementById('token_type')['value'] !== ''){
        sessionStorage.setItem('token_type', document.getElementById('token_type')['value']);
    }

    if(document.getElementById('access_token')['value'] !== ''){
        sessionStorage.setItem('access_token', document.getElementById('access_token')['value']);
    }

    const token_type = sessionStorage.getItem('token_type');
    const access_token = sessionStorage.getItem('access_token');

    console.log('token_type : ', token_type);
    console.log('access_token : ', access_token);

    const cards = document.getElementsByName('card');

    const login = ()=>{
        location.href = 'https://discord.com/api/oauth2/authorize?client_id=795876036318593094&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2F&response_type=code&scope=guilds%20identify';
    }

    if(!token_type && !access_token){
        document.getElementById('auth').innerHTML = '로그인&nbsp;';
        document.getElementById('auth').onclick = login;
        cards.forEach((element, index)=>{
            element.addEventListener('click', login);
        });
    }else{
        document.getElementById('auth').innerHTML = '로그아웃&nbsp;';
        document.getElementById('auth').onclick = ()=>{
            sessionStorage.clear();
            location.href = '/';
        }

        cards.forEach((element, index)=>{
            element.addEventListener('click', ()=>{
                location.href = `/${index}`
            });
        });

        axios.get('https://discord.com/api/users/@me',
        {
            headers:{
                Authorization: `${token_type} ${access_token}`
            }
        }).then((res)=>{
            const { id, username, discriminator } = res.data;

            sessionStorage.setItem('user', {
                userid: id,
                username: username,
                usercode: discriminator
            });
            console.log(data);
        });
    }

    
}
