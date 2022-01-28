var createError = require('http-errors');
var path = require('path');
var express = require('express');
var app = express();


var dotenv = require('dotenv').config();




// Session setup
var session = require('cookie-session');
var cookieParser = require('cookie-parser');
var userSession = {
  secret: process.env.SESSION_SECRET,
  originalMaxAge: 0,
  maxAge:0,
  resave: true,
  saveUninitialized: true,  
  cookie: {
    httpOnly: true,    
    secure: false,
    maxAge: 30  
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

//SQLITE3 SETUP
let SQLdatabase = new sqlite3.Database('./SQLdatabase.db');
app.locals.SQLdatabase = SQLdatabase;

//MYSQL SETUP
// let mysql = require('mysql');
// let SQLdatabase = mysql.createConnection({
// host: 'dannydaley.database.windows.net',
// user: 'dannydaley',
// password: 'Flat90210',
// database: 'portfolio database'
// })
// app.locals.SQLdatabase = SQLdatabase;


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


const sessionExists = (request) => {
  if (request.session.userData) {
    return "dashboard";
  } else {
    return "log in"
  }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('404', { loggedIn: sessionExists(req) });
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