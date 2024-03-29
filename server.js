var express = require('express.io'),
	swig = require('swig'),
	_ = require('underscore');

var server = express();
server.http().io();

//var RedisStore = require('connect-redis')(express);

var users = [];

swig.setDefaults({
	cache : false
});

// View engine
server.engine('html', swig.renderFile );
server.set('view engine', 'html');
server.set('views', './app/views');

// Add post, cookie and session support
server.configure(function(){
	server.use( express.static('./public') );

	server.use( express.logger() );
	server.use( express.cookieParser() );
	server.use( express.bodyParser() );

	server.use( express.session({
		secret : "lolcatz",
		// store  : new RedisStore({})
		// store  : new RedisStore({
		//	host : conf.redis.host,
		//	port : conf.redis.port,
		//	user : conf.redis.user,
		//	pass : conf.redis.pass
		// });	
	}) );
});

var isLoggedIn = function (req, res, next){
	if(req.session.user){
		res.redirect('/app');
		return;
	}

	next();
};

var isntLoggedIn = function (req, res, next){
	if(!req.session.user){
		res.redirect('/');
		return;
	}

	next();
};

server.get('/', isLoggedIn, function (req, res) {
	res.render('home');
});

server.get('/app', isntLoggedIn, function (req, res) {
	res.render('app', {
		user : req.session.user,
		users : users
	});
});

server.post('/log-in', function (req, res) {
	req.session.user = req.body.username;
	server.io.broadcast("log-in", {username: req.body.username});

	users.push(req.session.user);

	res.redirect('/app');
});

server.post('/send', function (req, res){
	server.io.broadcast('send', {username: req.session.user, message: req.body.message});
});

server.get('/log-out', function (req, res) {
	users = _.without(users, req.session.user);
	server.io.broadcast('log-out', {username: req.session.user});

	req.session.destroy();
	res.redirect('/');
});

server.io.route('hello?', function(req){
	req.io.emit('ready', {
		message : 'server ready to rock!!!'
	});
});

server.listen(3000);
console.log('Servidor corriendo en http://127.0.0.1:3000');