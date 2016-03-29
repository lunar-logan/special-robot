var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use('/static', express.static('public'));


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/home.html'); //// IMP!!!!
});

nicks = {};

function makeResponse(code, msg) {
    return {code: code, msg: msg};
}

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('join', function (nick) {
        if (nick && nick.length > 0) {
            if (nick in nicks) {
                io.emit('join status', makeResponse(-1, 'Nick already taken'));
            } else {
                nicks[nick] = socket;
                socket.emit('join status', makeResponse(0, nick));
                io.emit('user joined', makeResponse(0, Object.keys(nicks)));
            }
        } else {
            socket.emit('join status', makeResponse(-1, 'Not a valid nick'));
        }
    });

    socket.on('chat message', function (msg) {
        console.log(JSON.stringify(msg));
        var fromU = msg['from'];
        var toU = msg.to;
        var content = msg.content;

        if (fromU in nicks && toU in nicks) {
            nicks[toU].emit('chat message', {'from': fromU, content: content});
        } else {
            console.log('Zombie message ' + msg);
        }
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
        Object.keys(nicks).forEach(function (nick) {
            if(nicks[nick] === socket) {
                delete nicks[nick];
                io.emit('user joined', makeResponse(0, Object.keys(nicks)));
            }
        });
    });
});


var port = process.env.PORT || 3000;

http.listen(port, function () {
    console.log('listening on *:3000');
});