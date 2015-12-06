var mongoose	= require("mongoose"),
	bcrypt		= require("bcrypt-nodejs");

var userSchema	= mongoose.Schema({
	local: {
		email:		String,
		password:	String,
	},

	// https://scotch.io/tutorials/easy-node-authentication-setup-and-local
	// facebook: {
	// 	id:		String,
	// 	token:	String,
	// 	email:	String,
	// 	name:	String, 
	// },

	// twitter: {
	// 	id:		String,
	// 	token:	String,
	// 	email:	String,
	// 	name:	String, 
	// },

	// google: {
	// 	id:		String,
	// 	token:	String,
	// 	email:	String,
	// 	name:	String, 
	// },
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model("User", userSchema);