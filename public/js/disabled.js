window.onload = ()=>{
    document.getElementById('trialBtn').addEventListener('click', ()=>{
        const uid = 1; //app['user']['uid'];
        const username = '정남헌' //app['user']['uid'];
        axios.post('http://127.0.0.1:3000/trial/enroll',{
            params: {
                uid: uid,
                username: username,
            }
        })
        .then((response)=>{
            const { result } = response['data'];
            if(result === 'saved'){
                alert('등록되었습니다.');
                location.href = './enabled.html';
            }else if(result === 'error'){
                alert('등록에 실패했습니다.');
            }
            console.log('data : ', data);
        }).catch(function (error) {
            console.log(error);
        });
    })
    document.getElementById('buyBtn').addEventListener('click', ()=>{
        const appKey = '5d0b4dacb6d49c3e68bf29cd';
        const uid = 1; //app['user']['uid'];
        const username = '정남헌' //app['user']['uid'];
        BootPay.request({
            price: 1000,
            application_id: appKey,
            name: '마법의 소라고동 봇', //결제창에서 보여질 이름
            pg: 'nicepay',
            method: 'card_rebill', // 빌링키를 받기 위한 결제 수단
            show_agree_window: 0, // 부트페이 정보 동의 창 보이기 여부
            user_info: {
                username: username,
                email: '',
                addr: '',
                phone: ''
            },
            order_id: `order${uid}`, //고유 주문번호로, 생성하신 값을 보내주셔야 합니다.
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
        }).done(function (data) {
            // 빌링키를 정상적으로 가져오면 해당 데이터를 불러옵니다.
            console.log('done : ', data);
        });
    });
}
