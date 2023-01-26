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
const passport = require('passport');
const authenticate = require('./authenticate');

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

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req, res, next) {
  // the 'session' middleware automatically creates a 'session' property to the request message; let's see what it says
  console.log(req.user);

  if (!req.user) {
    const err = new Error('You are not authenticated!');
    err.status = 401;
    return next(err);

  } else {

    return next();

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
