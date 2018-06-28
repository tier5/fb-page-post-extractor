const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser  = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config()
require('./configs/connection');
require('./models/index');


const apiRouter = require('./routes/index');

const app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/frontend/dist')));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Headers","*")
  next();
})
app.use('/api', apiRouter);

// send all get request to frontend to handle  
app.get('*',function(req,res){
  res.sendFile(path.join(__dirname + '/public/frontend/dist/index.html'))
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log(err);
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
