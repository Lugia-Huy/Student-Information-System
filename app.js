var createError = require('http-errors');
var express = require('express');
var bodyParser= require('body-parser');
var path = require('path');
var MongoClient = require('mongodb').MongoClient
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var session = require('express-session');
var User = require('./models/user_db');
var multer  = require('multer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy
var passportLocalMongoose = require("passport-local-mongoose");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var uri = "mongodb+srv://quanghuynguyenthanh:quanghuy123@cluster0.vbsnw.mongodb.net/HTTT?retryWrites=true&w=majority";



var indexRouter = require('./routes/index');
var modRouter = require('./routes/mod');
var usersRouter = require('./routes/users');

var app = express();



// database connect ,local: 'mongodb://localhost:27017/HeThongThongTin'
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
}).then(() => console.log("mongoDB Connected"))
    .catch((err) => console.log(err));
	
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//….
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'Any normal Word'
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/mod', modRouter);
app.use('/users', usersRouter);

app.get('/login', function (req, res) {
  res.render('login', { title: "Đăng nhập" }); // load the login page
});

passport.use(new LocalStrategy(
    async function(username, password, done) {
        var user = await User.findOne({email: username})
        return done(null, user)
    }
  ));
  
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser((id, done) => {
  User.findById(id)
  .then(user => done(null, user))
  .catch(err => done(err, null));
})

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
  clientID: "472183116907-i0jaa2bh4tiaiela951a96o0cabc4ldl.apps.googleusercontent.com",
  clientSecret: "smZFquS9oIlAigt_rfMLEO41",
  callbackURL: "/auth/google/callback",
  proxy: true
},
function (accessToken, refreshToken, profile, done) {
        
  if ( profile.emails[0].value.search('student.tdtu.edu.vn') == -1) {
      return done(null, false)
  }
  else{
  User.findOne({ googleID: profile.id })
      .then((user) => {
          if (user) {
              done(null, user)
          } else {
              new User({
                  authId: profile.id,
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  password: '123456',
                  cover: profile.photos[0].value,
                  created: new Date(),
                  role: 'student'
              }).save().then((newUser) => {
                  done(null, newUser)
              })
          }
      })
    }
  }
));

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}))

app.get('/auth/google/callback', passport.authenticate('google' ,{failureRedirect: '/login'}), (req, res) => {
  res.redirect('/users')
})
  
// logging local
app.post("/auth", passport.authenticate("local", {failureRedirect: "/login"}), (req, res) => {
	if (req.user.role == 'admin'){
		res.redirect('/')
	} else if (req.user.role == 'mod'){
		res.redirect('/mod')
	} else if (req.user.role == 'student'){
		res.redirect('/users')
	}
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
