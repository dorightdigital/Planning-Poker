var express = require("express");
var app = express();
var port = process.env.PORT || 8000;
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/../build'));
app.use('/bower_components', express.static(__dirname + '/../bower_components'));
app.use('/app/views', express.static(__dirname + '/../app/views'));
app.get("/", function (req, res) {
  res.render("page");
});
require('./serverApi').init(app.listen(port));
console.info('started server on port ', port);
