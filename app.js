var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');

var routes = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var searches = require('./routes/searches');
var users = require('./routes/users');
var answeres = require('./routes/answeres');
var evaluationes = require('./routes/evaluationes');

var app = express();
app.use(helmet());

var session = require('express-session');
var passport = require('passport');

// モデルの読み込み
var User = require('./models/user');
var Search = require('./models/search');
var Answer = require('./models/answer');
var Evaluation = require('./models/evaluation');
var Comment = require('./models/comment');
User.sync().then(() => {
  Search.belongsTo(User, {foreignKey: 'createdBy'});
  Search.sync();
  Comment.belongsTo(User, {foreignKey: 'userId'});
  Comment.sync();
  Evaluation.belongsTo(User, {foreignKey: 'userId'});
  Answer.sync().then(() => {
    Evaluation.belongsTo(Answer, {foreignKey: 'answerId'});
    Evaluation.sync();
  });
});

var TwitterStrategy = require('passport-twitter').Strategy;
var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

// セッションへの保存と読み出し ・・・・①
passport.serializeUser((user, callback) => {
  callback(null, user);
});
passport.deserializeUser((obj, callback) => {
  callback(null, obj);
});
// 認証の設定 ・・・・②
passport.use(new TwitterStrategy({
  consumerKey: TWITTER_CONSUMER_KEY,
  consumerSecret: TWITTER_CONSUMER_SECRET,
  callbackURL: "http://localhost:8000/auth/twitter/callback",
  includeEmail: true 
}, 
// 認証後のアクション 6/30
(accessToken, refreshToken, profile, callback) => {
  process.nextTick(() => {
      User.upsert({
        userId: profile.id,
        username: profile.username
      }).then(() => {
        callback(null, profile);
        console.log('ログイン成功') //必要に応じて変更
      });
  });
}));
// セッションの設定
app.use(session({
  secret: 'reply-analyzer',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); //

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/login', login);
app.use('/logout', logout);
app.use('/searches', searches);
app.use('/users', users);
app.use('/searches', evaluationes);

// 指定したpathで認証　・・・・③
app.get('/auth/twitter',
  passport.authenticate('twitter', { scope: ['user:email'] }),
  function (req, res) {
    });
// callback後の設定　・・・・④
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }), 
  function (req, res) {
  res.redirect('/'); 
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
