// Initializing socket.io library
var socket = io();

var myNick = null;

socket.on('join status', function (msg) {
    if (msg.code === 0) { // joining successfull
        myNick = msg.msg;
        $('#login').hide();
        $('#chat-room').show();
        setupChatBox();
    } else {
        displayMessage(msg.msg);
    }
});

socket.on('user joined', function (msg) {
    var usersOnline = $('#users-online');
    usersOnline.empty();
    msg.msg.forEach(function (u) {
        usersOnline.append($('<li>').html(u));
    });
});

socket.on('chat message', function (msg) {
    console.log(msg);
    var fromU = msg['from'];
    var content = msg.content;
    var li = $('<li>').html(fromU + ": " + content);
    $('#messages').append(li);
});


function parseMessage(msg) {
    var firstSpace = msg.indexOf(' ');
    var user = msg.substring(0, firstSpace);
    var message = msg.substring(firstSpace + 1);
    return {'from': myNick, to: user, content: message};
}

function sendMessage(msg, callback) {
    console.log('sending message ' + msg);
    socket.emit('chat message', parseMessage(msg));
}

function validMessage(msg) {
    return msg && msg.length > 0;
}

function setupChatBox() {
    var editBox = $('#edit-box');
    editBox.on('keyup', function (e) {
        e.preventDefault();
        if (e.keyCode === 13) { // Enter pressed
            var msg = editBox.val();
            if (validMessage(msg)) {
                sendMessage(msg);
            } else {
                console.log('Nothing to send');
            }
            editBox.val('');
        }
    });
}


function displayMessage(msg) {
    $('#error').html(msg);
}
// -- 
// -- good will hunting
// bigshort movie (mrgot robie, )

function join() {
    var nickName = $('#nick').val();
    if (nickName && nickName.length > 0) {
        socket.emit('join', nickName);
    } else {
        displayMessage('Type a nickname to continue.');
    }
}

