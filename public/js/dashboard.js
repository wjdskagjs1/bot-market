const dates = {
    convert:function(d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp) 
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
    },
    compare:function(a,b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    },
    inRange:function(d,start,end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
       return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
    }
}

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

    const addChannel = (value)=>{
        var html = '';
        html += `<span id="inputFormRow">`;
        html += `<input name="channels" class="uk-input uk-form-width-medium" type="text" value="${value}"> `;
        html += `<button id="removeChannel" class="uk-button uk-button-danger uk-button-small">삭제</button>`
        html += `<br/>`;
        html += `</span>`;

        $('#channelList').append(html);
    };

    if(!token_type || !access_token || !userid || !username || !usercode){
        location.href = '/main';
    }else{
        document.getElementById('auth').innerHTML = '로그아웃&nbsp;';
        document.getElementById('auth').onclick = ()=>{
            sessionStorage.clear();
            location.href = '/main';
        }

        // add row
        $(document).on('click', '#addChannel', function () {
            addChannel('');
        });
    
        // remove row
        $(document).on('click', '#removeChannel', function () {
            $(this).closest('#inputFormRow').remove();
        });
        
        $(document).on('click', '#save', function () {
            let channels = []
            const channelsElement = document.getElementsByName('channels');
            for(let i = 0; i < channelsElement.length; i++){
                if(channelsElement[i]['value'] !== '')
                    channels.push(channelsElement[i]['value']);
            }
            axios.post(`/users/update`,{
                params: {
                    bot_id: bot_id,
                    userid: userid,
                    usercode: usercode,
                    guild_id: guild_id,
                    setting:{
                        channels: channels
                    }
                }
            }).then((res)=>{
                const { data } = res;
                
                console.log(data);
                // Create an instance of Notyf
                const notyf = new Notyf();
                
                if(data['result'] === 'success'){
                    notyf.success('저장 성공');
                }else{
                    notyf.error('저장 실패');
                }
            });
        });

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
                guildListElement.innerHTML += `<li><a href="/main/${bot_id}/${id}">${name}</a></li>`;
            });
            //길드 활성화 여부 체크
            axios.get(`/users/findOne/${bot_id}/${guild_id}`).then((res)=>{
                const { data } = res;
                const form = document.getElementById('form');
                const now = new Date();

                console.log(data);
                
                if(dates.compare(data['end_date'], now) === 1){
                    document.getElementById('guild_name').textContent = guild_name;
                    data['setting']['channels'].forEach((value)=>{
                        addChannel(value);
                    });
                    if(data['enable']){
                        form.innerHTML += `<button id="cancelBtn" class="uk-button uk-button-danger">구독 취소하기</button>`;
                    }else if(data['trial']){
                        form.innerHTML += `<button id="buyBtn" class="uk-button uk-button-danger">정식판 구독하기</button>`;
                    }
                }else{
                    let html = '';
                    html += `<h3 class="uk-card-title">${guild_name}</h3>`;

                    html += `<p>`;
                    if(data['trial'] === undefined){
                        html += `<button id="trialBtn" class="uk-button uk-button-primary">30일 체험판 사용</button>`;
                        html += `<br /><br />`;
                    }
                    html += `<button id="buyBtn" class="uk-button uk-button-danger">정식판 구독하기</button>`;
                    html += `</p>`;
                    form.innerHTML = html;
                }

                $('#cancelBtn').on('click', ()=>{
                    if(confirm('정말로 구독을 취소하시겠습니까?')){
                        axios.post(`/users/cancel`,{
                            params: {
                                bot_id: bot_id,
                                userid: userid,
                                usercode: usercode,
                                guild_id: guild_id,
                            }
                        }).then((res)=>{
                            const { result } = res.data;
                            if(result === 'success'){
                                alert('구독이 취소되었습니다.');
                            }else{
                                alert('구독 취소에 실패하였습니다.');
                            }
                            location.reload();
                        });
                    }
                });

                $('#trialBtn').on('click', ()=>{
                    axios.get(`/users/left/${bot_id}`).then((res)=>{
                        const { left, count } = res.data;
                        if(left){
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
                                const { result } = res.data;
                                if(result === '사용 중' || result === '체험판 만료'){
                                    alert(result);
                                }
                                location.reload();
                            });
                        }else{
                            alert(`서버 수 제한`);
                        }
                    });
                });
            });
        });
    }

    $(document).on('click', '#buyBtn', function () {
        const bot_name = document.getElementById('bot_name').textContent;
        const bot_price = parseInt(document.getElementById('bot_price').textContent);

        axios.get(`/users/left/${bot_id}`).then((res)=>{
            const { left, count } = res.data;
            if(left){
                BootPay.request({
                    price: 0, // 0으로 해야 한다.
                    application_id: "5d0b4dacb6d49c3e68bf29cd",
                    name: bot_name, //결제창에서 보여질 이름
                    pg: 'nicepay',
                    method: 'card_rebill', // 빌링키를 받기 위한 결제 수단
                    show_agree_window: 0, // 부트페이 정보 동의 창 보이기 여부
                    user_info: {
                        username: username,
                        email: '사용자 이메일',
                        addr: '사용자 주소',
                        phone: '010-1234-4567'
                    },
                    order_id: bot_id, //고유 주문번호로, 생성하신 값을 보내주셔야 합니다.
                    params: {callback1: '그대로 콜백받을 변수 1', callback2: '그대로 콜백받을 변수 2', customvar1234: '변수명도 마음대로'},
                    extra: {
                        start_at: '', // 정기 결제 시작일 - 시작일을 지정하지 않으면 그 날 당일로부터 결제가 가능한 Billing key 지급
                        end_at: '' // 정기결제 만료일 -  기간 없음 - 무제한
                    }
                }).error(function (data) {
                    //결제 진행시 에러가 발생하면 수행됩니다.
                    console.log(data);
                }).cancel(function (data) {
                    //결제가 취소되면 수행됩니다.
                    console.log(data);
                }).done((info) => {
                    // 빌링키를 정상적으로 가져오면 해당 데이터를 불러옵니다.
                    console.log(info);
        
                    axios.post('/users/buy', {
                        params: {
                            bot_id: bot_id,
                            userid: userid,
                            username: username,
                            usercode: usercode,
                            guild_id: guild_id,
                            guild_name: guild_name,
                            billing_info: [
                                info['billing_key'],
                                bot_name,
                                bot_id,
                                bot_price,
                                info['receipt_id'],
                            ]
                        }
                    }).then((res)=>{
                        console.log(res.data);
                        location.reload();
                    });
                });
            }else{
                alert(`서버 수 제한`);
            }
        });
    });
}