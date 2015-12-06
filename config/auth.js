module.exports = {
	// https://developers.facebook.com/
	'facebookAuth' : {
		'clientID'		: 'your-secret-clientID-here',
		'clientSecret'	: 'your-client-secret-here',
		'callbackURL'	: 'http://localhost:8080/auth/facebook/callback'
	},

	// https://dev.twitter.com/
	'twitterAuth' : {
		'consumerKey'		: 'your-consumer-key-here',
		'consumerSecret'	: 'your-client-secret-here',
		'callbackURL'		: 'http://localhost:8080/auth/twitter/callback'
	},

	// https://console.developers.google.com/start
	'googleAuth' : {
		'clientID'		: 'your-secret-clientID-here',
		'clientSecret'	: 'your-client-secret-here',
		'callbackURL'	: 'http://localhost:8080/auth/google/callback'
	}
};