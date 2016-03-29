module.exports = {

	isValidUsername: function(uname) {
		return uname !== null && uname !== undefined && uname.length >= 2;
	}

};