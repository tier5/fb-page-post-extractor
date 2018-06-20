/**
 * Name : connection.js
 * Purpose : Connection to the database and creating a database
 */
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/pageExtractorDb');
const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
    // we're connected!
    console.log('App is connected to mongodb');
    });

 module.exports= mongoose
