var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet      = require('helmet');

var routes = require('./routes/index');
var users = require('./routes/users');
var documents = require('./routes/documents'); 


var app = express();

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

app.use(helmet());


app.use('/', routes);
app.use('/users', users);
app.use('/documents', documents);

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


var elastic = require('./modules/elasticsearch');


elastic.indexExists().then(function (exists) {
  console.log(exists);
  if (exists) {
   // return elastic.deleteIndex();
   //changes
   // console.log("index exists");
   /* elastic.updateOraMapping().then(function(results){
      console.log("mapping update " + results);
      return true;
    });*/
    return true;
  }
}).then(function () {
  console.log("promise");
  
  /*return elastic.initIndex().then(elastic.initOraMapping).then(function () {
    console.log("index init");
    //Add a few book titles for the autocomplete
    //elasticsearch offers a bulk functionality as well, but this is for a different time
     //return true;
  });*/
    return true;
});



module.exports = app;
