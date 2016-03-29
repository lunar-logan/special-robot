var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));
app.set('view engine', 'jade');
app.set('views', './views');
app.use('/static', express.static('public'));

// Global state data for the app
nicks = {};


// Routes setup
app.get('/', function(req, res) {
	if(req.session.user) {
		res.redirect('/chat');
	} else {
		res.redirect('/join');
	}
});

app.get('/join', function(req, res) {
	if(req.session.user) {
		res.redirect('/chat');
	} else {
		res.render('join');
	}
});

app.post('/join', function(req, res) {
	var nick = req.body.nick;
	if(nick && nick.length > 0) {
		if(!(nick in nicks)) { // This nick is available
			nicks[nick] = '';
			req.session.user = {nick: nick};
			console.log('Bookeeping done, redirecting to chatroom');
			res.redirect('/chat');
		} else { 			   // Nick is already taken 
			res.render('join', {errorMessage: 'This nick is already taken'});
		}
	} else {
		res.render('join', {errorMessage: 'Please choose a nickname to continue'});
	}
});

app.get('/logout', function(req, res) {
	delete nicks[req.session.user];
	req.session.destroy();
	res.redirect('/');
});


app.get('/chat', function(req, res) {
	if(req.session.user) {
		console.log('Rendering chatroom template');
		res.render('chat', {chatRoomTitle: req.session.user.nick});
	} else {
		res.redirect('/logout');
	}
});

	// `msg` is assumed to be a json object
	/* 
		{
			fromUid	   : 'One whoe sent the message', 
			toId	   : 'Intended recepient',
			text	   : "content", 
			attachments: [
							{
								type: "mime-type", 
								id: 'resource id'
							}, ... 
						 ]
		}
	*/


io.on('connection', function(socket){
  console.log('Connected to a user');

  socket.on('join', function(data) {
  	socket.join(data.room);
  });

  socket.on('chat message', function(msg) {
    console.log('message: ' + msg);

    // Emit the same message to everyone including the sender
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


// The main app executing at localhost:3000
http.listen(3000, function() {
  console.log('listening on *:3000');
});
