window.onload = ()=>{

    const bot_id = document.getElementById('bot_id')['value'];
    let guild_id = document.getElementById('guild_id')['value'];
    let guild_name = '';

    const sessionStorage = window.sessionStorage;

    const token_type = sessionStorage.getItem('token_type');
    const access_token = sessionStorage.getItem('access_token');
    const userid = sessionStorage.getItem('userid');
    const username = sessionStorage.getItem('username');
    const usercode = sessionStorage.getItem('usercode');

    let guilds = [];

    if(!token_type || !access_token || !userid || !username || !usercode){
        location.href = '/index';
    }else{
        document.getElementById('auth').innerHTML = '로그아웃&nbsp;';
        document.getElementById('auth').onclick = ()=>{
            sessionStorage.clear();
            location.href = '/index';
        }

        //길드 목록
        axios.get('https://discord.com/api/users/@me/guilds',
        {
            headers:{
                Authorization: `${token_type} ${access_token}`
            }
        }).then((res)=>{
            const { data } = res;
            console.log(data);
            const guildListElement = document.getElementById('guildListElement');
            
            guilds = data.filter((element)=>{
                return element.owner;
            });
            guilds.forEach((guild, index)=>{
                const { id, name } = guild;
                if(guild_id === '' && index === 0){
                    guild_id = id;
                }
                if(id === guild_id){
                    guild_name = name;
                }
                guildListElement.innerHTML += `<li><a href="/index/${bot_id}/${id}">${name}</a></li>`;
            });
            //길드 활성화 여부 체크
            axios.get(`/users/findOne/${guild_id}`).then((res)=>{
                const { data } = res;
                const form = document.getElementById('form');
                
                if(data['trial'] || data['enabled']){
                    form.innerHTML = ``;
                }else{
                    form.innerHTML = `<h3 class="uk-card-title">마법의 소라고동 봇</h3>
                    <p>
                        <button id="trialBtn" class="uk-button uk-button-primary">30일 체험판 사용</button>
                        <br /><br />
                        <button id="buyBtn" class="uk-button uk-button-danger">구매하기</button>
                    </p>`
                }

                document.getElementById('trialBtn').onclick = ()=>{
                    axios.post(`/users/trial/enroll`,{
                        params: {
                            bot_id: bot_id,
                            userid: userid,
                            usercode: usercode,
                            username: username,
                            guild_id: guild_id,
                            guild_name: guild_name
                        }
                    }).then((res)=>{
                        const { data } = res;
                        console.log(data);           
                        location.reload();
                    });
                }
            });
        });

        
    }
}