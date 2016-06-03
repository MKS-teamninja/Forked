var browserify = require('browserify-middleware');
var express = require('express');
var app = express();
var db = require('./db');
var User = require('./models/users');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var yelpApi = require('./routes/yelp');
//var facebookLogin = require('./routes/facebook')
var logout = require('./routes/logout');
var login = require('./routes/login');
var	signup = require('./routes/signup');
var session = require('express-session');
var reviewRoutes = require('./api_routes/reviews');
var restRoutes = require('./api_routes/restaurants');
var uuid = require('uuid-v4');
var passport = require('passport'),
 FacebookStrategy = require('passport-facebook').Strategy;

app.use(express.static('client/'));
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
  genid: function(req) {
    return uuid() // creates unique UUID for session
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10000 }
}))
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth/', bodyParser.json());
app.use('/auth/', login);
app.use('/auth/', signup);
app.use('/auth/', logout);
app.use('/yelp-api', yelpApi);
app.use('/reviews', reviewRoutes);
app.use('/restaurants', restRoutes);

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
//***************Facebook Authentication Routing********************
passport.use(new FacebookStrategy({
    clientID: '1215370348482360',
    clientSecret: 'f5b8d160575d69d0db8abf5c148bb971',
    callbackURL: "http://localhost:4000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    var _id = profile.id;
    // console.log("accessToken:", accessToken);
    // console.log("refreshToken:", refreshToken);
    console.log("profile:", profile.displayName);
    // console.log("done:", done);
    // var verified = done;
    // console.log("verified:", verified);
    console.log("id:", _id);
    // User.findById(_id)
    // .then(function(response){
    //   console.log("userRes:", response);
    // })
    // .catch(function(error){
    //   console.error("userResErr: ", error);
    // })
    User.create(_id, profile.displayName)
    .then(function(user){
      console.log("newUserRes:", user);
      return done(null, user);
    })
    .catch(function(error){
      return done(error);
    })

    // User.createSession(profile.accessToken)
    // .then(function(response){
    //   console.log("newSessionToken: ", response);
    //   //send accessToken to frontend
    //   // passport.serializeUser(function(response, done){
    //   //   done(null, 'tokenStuff');
    //   // });
    // })
    // .catch(function(error){
    //   console.error("newSessionTokenErr: ", error);
    // })
  }
));
// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'), function(req, res){});

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/#/login' }),
  function(req, res){
    res.redirect('/');
  });
//******************************************************************


//browersify which injects all dependencies into index.html
var shared = ['angular'];
app.get('/js/vendor-bundle.js', browserify(shared));
app.get('/js/app-bundle.js', browserify('./client/app.js', { external: shared }));

if(process.env.NODE !== 'test') {
	var port = process.env.PORT || 4000;
	app.listen(port);
	db.ensureSchema();
	console.log("Listening on port", port);
} else {
	exports = app;
}
