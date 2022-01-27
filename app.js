var createError = require('http-errors');

var path = require('path');
let crypto = require('crypto');
var express = require('express');
var app = express();

// let crypto = require('crypto');
var cookieParser = require('cookie-parser');


var session = require('express-session')
// Session setup
let generateSecret = crypto.randomBytes(128).toString('hex');
var userSession = {
  secret: "megaSecret",
  originalMaxAge: 24,
  resave: true,
  saveUninitialized: true,
  cookie: {
    originalMaxAge: 24,
    userData: {
          sessionUsername: "",      
          sessionUserPosts: "",
          sessionUserDateJoined: "",
          sessionUserProfilePicture: "",
          sessionUserAboutMe: "",      
          logInStatus: "",
          sessionUserIsLoggedIn: false
    }      
  }
}
app.use(cookieParser())
app.use(session(userSession))




var logger = require('morgan');
var webSocket = require('ws');
var sqlite3 = require('sqlite3').verbose();
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var multer  = require('multer');

let SQLdatabase = new sqlite3.Database('./SQLdatabase.db');
app.locals.SQLdatabase = SQLdatabase;



// if (app.get('env') === 'production') {
//   app.set('trust proxy', 1) // trust first proxy
//   sess.cookie.secure = true // serve secure cookies
//   sess.cookie.originalMaxAge = 24
// }

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('404');
  next(createError(404));
});

upload = multer({ dest: 'uploads/' });

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
