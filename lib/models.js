var mongoose = require('mongoose');
// var constants = require('./constants.js');

// mongoose.connect('mongodb://localhost/' + constants.database_name);

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error: '));
// db.once('open', function() {
	

// });

/**
	Represents a user
*/
var UserSchema = mongoose.Schema({
	username: String,
	password: String
});



/**
	Represents the message body
*/
var MessageBodySchema = mongoose.Schema({

	// Text component of the message
	text: String
});

/**
	Returns the message as text (possibly? UTF-8)
*/
MessageBodySchema.methods.getText = function() {
	return (this.text? this.text: '');
};


/**
	Represents a message
*/
var MessageSchema = mongoose.Schema({

	// FKey, User id referring to the user who sent this message
	fromId: String, 

	// FKey, User id of the user for whome this message was sent
	toId: String,

	// TimeStamp at which this message reached the server
	ts: {type: Date, default: Date.now()}

	// The content of this message, remember this message could contain
	// text, images, video, audio, binary files, etc.
	bodyId: String

});
