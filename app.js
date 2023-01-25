var createError = require('http-errors');
var express = require('express');
var path = require('path');
// commenting out cookieParser as it is incompatible with Express Session
// var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session')
// notice FileStore has two sets of arguments
// require() returns another function and THAT function uses (session) as its args
const FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

var app = express();

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err)
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// we are commenting out cookierParser since it is incompatible w/ Express Session
// app.use(cookieParser('12345-67890-09876-54321'));

app.use(session({
  // values are arbitrary
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  // false means any session that includes zero changes, is not saved; also, no new cookie is sent to the client
  // this is dealing with NEW sessions THAT HAVE NOT ADDED ANY data
  saveUninitialized: false,
  // false means that once a session is created, updated, and saved, it will NOT continue to be resaved
  // this is dealing with PREVIOUSLY CREATED sessions which ALREADY HAVE some data
  resave: false,
  // save to server's HDD, not just the app's memory
  store: new FileStore()
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req, res, next) {
  // the 'session' middleware automatically creates a 'session' property to the request message; let's see what it says
  console.log(req.session);

  if (!req.session.user) {

    // commented this out because we are no longer checking the authorization header at this point
    // instead, we automatically redirect unauthenticated users to the '/' route IOT login
    // const authHeader = req.headers.authorization;
    // if (!authHeader) {
    const err = new Error('You are not authenticated!');

    // we no longer handle this portion in this function; it is now handled in the users.js file as part of '/users/login' 
    // res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
    // }

    // the following 23 lines are no longer being used since we are using sessions rather than cookies to authenticate
    // const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    // const user = auth[0];
    // const pass = auth[1];

    // if (user === 'admin' && pass === 'password') {

    //   // the below lines are commented out since cookies are being handled by Express Session
    //   // res.cookie is a built-in method of Express's Response object
    //   // res.cookie(name, value, [options]) is the template
    //   // name, value are essentially key:value pair
    //   // [options] arg is optional but tells express to use cookieParser to create a signed cookie
    //   // we can also include things like cookie expiration time in the third arg
    //   // res.cookie('user', 'admin', { signed: true })

    //   // we write to our session that 'user' = 'admin'
    //   req.session.user = 'admin';
    //   return next(); // authorized
    // } else {
    //   const err = new Error('You are not authenticated!');
    //   res.setHeader('WWW-Authenticate', 'Basic');
    //   err.status = 401;
    //   return next(err);
    // }

  } else {

    // 'authenticated' is an arbitrary value was set in users.js as part of '/users/login'
    if (req.session.user === 'authenticated') {
      return next();
    } else {
      const err = new Error('You are not authenticated!');
      err.status = 401;
      return next(err);
    }

  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
