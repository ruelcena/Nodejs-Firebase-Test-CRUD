var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var config = require('./app/config/config'); 

//Set the view engine to ejs
app.set( 'view engine', 'ejs' );


//Serving static files
app.use( express.static('app') );
app.use( express.static('public') );
app.use( bodyParser.urlencoded({extended:false}) );
app.use( methodOverride() );

//Set variable
app.locals.baseUrl = config.baseUrl;

app.use(function (err, req, res, next) {
    console.error(err.stack + 'test')
    res.status(500).send('Something broke!')
})

//Routes
require('./app/routes.js')(app);

//Load server
var server = app.listen(8080, function(){
console.log( 'Server running...');
});
  