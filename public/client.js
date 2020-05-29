let ws;
let chatUsersCtr = document.querySelector('#chatUsers');
let chatUsersCount = document.querySelector('#chatUsersCount');
let sendMessageForm = document.querySelector('#messageSendForm');
let messageInput = document.querySelector('#messageInput');
let chatMessagesCtr = document.querySelector('#chatMessages');
let leaveGroupBtn = document.querySelector('#leaveGroupBtn');
let groupName = document.querySelector('#groupName');

window.addEventListener('DOMContentLoaded', () => {
    ws = new WebSocket(`ws://localhost:3000/ws`);
    ws.addEventListener('open', onConnectionOpen);
    ws.addEventListener('message', onMessageReceived);
})

sendMessageForm.onsubmit = (ev) => {
    ev.preventDefault();
    if (!messageInput.value)
        return;
    const event = {
        event: 'message',
        data: messageInput.value
    };

    ws.send(JSON.stringify(event));

    messageInput.value = '';
}

leaveGroupBtn.onclick = () => {
    const event = {
        event: 'leave'
    };

    ws.send(JSON.stringify(event));
    window.location.href= 'chat.html';
}

function onConnectionOpen() {
    console.log('Conection Opened')

    const queryParams = getQueryParams();
    console.log(queryParams);

    if (!queryParams.has('name') || !queryParams.has('group')) {
        window.location.href = 'chat.html';
        return;
    }

    groupName.innerHTML = queryParams.get('group');

    const event = {
        event:'join',
        groupName: queryParams.get('group'),
        name: queryParams.get('name')
    }
    ws.send(JSON.stringify(event));
}

function onMessageReceived(event) {
    console.log(`Message received`);
    event = JSON.parse(event.data);
    console.log(event);

    switch(event.event) {
        case 'users':
            chatUsersCount.innerHTML = event.data.length;
            chatUsersCtr.innerHTML = '';
            event.data.forEach(u => {
                const userEl = document.createElement('div');
                userEl.className = 'chat-user';
                userEl.innerHTML = u.name;
                chatUsersCtr.appendChild(userEl);
            })
            break;
        case 'message':
            const scrollTopBottom = Math.floor(chatMessagesCtr.offsetHeight + chatMessagesCtr.scrollTop) === chatMessagesCtr.scrollHeight
            appendMessage(event.data);
            if(scrollTopBottom) {
                chatMessagesCtr.scrollTop = 10000000;
            }
            break;

        case 'previousMessages':
            event.data.forEach(appendMessage);
            break;
    }
}

function appendMessage(message) {
    const messageEl = document.createElement('div');
    console.log('message:', message)
    messageEl.className = `message message-${message.sender === 'me' ? 'to' : 'from'}`;
    messageEl.innerHTML = `
        ${message.sender === 'me' ? '' : `<h4>${message.name}</h4>`}
        <p class="message-text">${message.message}</p>
    `;

    chatMessagesCtr.appendChild(messageEl);
}

function getQueryParams() {
    const search = window.location.search.substring(1);
    /* const pairs = search.split("&");
    const params = {};
    for(const pair of pairs) {
        const parts = pair.split("=")
        params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    } */

    return new URLSearchParams(search);
}