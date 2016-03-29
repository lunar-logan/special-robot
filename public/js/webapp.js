var USER = null;
var CURRENTLY_CHATTING = null;
var MESSAGES = {};
var PLING_AUDIO = new Audio('/static/audio/pling.mp3');


// Initializing socket.io library
var socket = io();

socket.on('join status', function (msg) {
    if (msg.code === 0) {   // joining successfull
        USER = msg.msg;     // store the nick
        $('#login').hide();
        $('#chat-room').show();
        setupWebApp();
    } else {
        displayMessage(msg.msg);
    }
});

socket.on('user joined', function (msg) {
    var usersOnline = $('#users-online');
    usersOnline.empty();
    msg.msg.forEach(function (u) {
        if (!(u in MESSAGES)) {
            MESSAGES[u] = [];
        }
        if (u !== USER) {
            var li = $('<li>').attr({id: u}).html(u).on('click', function (e) {
                console.log(e.target.id);
                nickSelected(e.target.id);
            });
            usersOnline.append(li);
        }
    });
});

socket.on('chat message', function (msg) {
    console.log("Message received: " + msg);
    var fromU = msg['from'];
    if (fromU in MESSAGES) {
        MESSAGES[fromU].push(msg);
    } else {
        console.log('Zombie message received from: ' + fromU);
    }
    if (fromU === CURRENTLY_CHATTING) {
        $('#messages').append(makeMessageBock(msg));
    } else {
        var otherU = $('#' + fromU);
        otherU.html('<b>' + fromU);
        PLING_AUDIO.play();
    }
    updateMessageView();
});

// Socket io setup completed

function makeMessageBock(msg) {
    return $('<div>').attr({class: 'row message'})
            .append(
                    $('<div>').attr({class: 'col-10 name'}).html(msg['from'])
                    ).append(
            $('<div>').attr({class: 'col-90'}).html(msg.content)
            );
}

function updateMessageView() {
    var messages = $('#messages');
    messages.empty();
    MESSAGES[CURRENTLY_CHATTING].forEach(function (msg) {
        messages.append(makeMessageBock(msg));
    });
}

function displayMessage(msg) {
    $('#error').html(msg);
}

function nickSelected(nick) {
    console.log('Selected nick: ' + nick);
    $('#' + CURRENTLY_CHATTING).attr({class: null});
    $('#' + nick)
            .attr({class: 'selected'})
            .html(nick);
    $('#title').html(nick);
    CURRENTLY_CHATTING = nick;
    updateMessageView();
}

function parseMessage(msg) {
    return {'from': USER, to: CURRENTLY_CHATTING, content: msg};
}
function sendMessage(msg) {
    console.log('Sending message: ' + msg + ' to: ' + CURRENTLY_CHATTING);
    var msg = parseMessage(msg);
    $('#messages').append(makeMessageBock(msg));
    socket.emit('chat message', msg);
}
function validMessage(msg) {
    return msg && msg.length > 0;
}


function setupWebApp() {
    console.log('user: ' + USER);
    if (USER !== null) {
        console.log('Adding click listener');
        $('li').on('click', function (e) {
            console.log(e.target.id);
            nickSelected(e.target.id);
        });
        var editBox = $('#edit-box');
        editBox.on('keyup', function (e) {
            e.preventDefault();
            if (e.keyCode === 13) {
                var msg = editBox.val();
                if (validMessage(msg)) {
                    sendMessage(msg);
                } else {
                    console.log('Nothing to send');
                }
                editBox.val('');
            }
        });
    } else {
        console.error('USER is null');
    }
}

function join() {
    var nickName = $('#nick').val();
    if (nickName && nickName.length > 0) {
        socket.emit('join', nickName);
    } else {
        displayMessage('Type a nickname to continue.');
    }
}