var express = require("express");
var app = express();
var config = {
  port: process.env.PORT || 8000
};
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/../public'));
app.use('/bower_components', express.static(__dirname + '/../bower_components'));
require('./urls').init(app, config);
require('./serverApi').init(app.listen(config.port));
console.log('started server on port ', config.port);
