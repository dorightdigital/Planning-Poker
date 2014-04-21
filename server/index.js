var express = require("express");
var app = express();
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/../public'));
require('./urls').init(app);
require('./serverApi').init(app.listen(process.env.PORT || 8000));
