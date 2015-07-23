var fs = require('fs');
var path = require('path');
var http = require('http');

var express = require('express');
var reload = require('reload');
var errorhandler = require('errorhandler');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var app = express();
app.locals.rootDir = __dirname;
app.locals.baseUrl = '';
app.use(errorhandler());
app.set('views', path.join(app.locals.rootDir, 'views'));
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(app.locals.rootDir, 'assets.src')));
app.locals.assetUrl = function (path) {
  return app.locals.baseUrl + '/assets/' + path;
};

app.get('/', function (req, res) {
  res.render('index', {baseUrl: app.locals.baseUrl});
});
app.get('/play', function (req, res) {
  res.render('play', {baseUrl: app.locals.baseUrl, id: req.query.id});
});

app.post('/save', function (req, res) {
  console.log(req.body);
  var body = req.body;
  var id = Date.now().toString();
  fs.writeFile(path.join('db', id + '.json'), JSON.stringify(req.body), function (err) {
    if (err) return res.sendStatus(500);
    res.send(id);
  });
});

app.put('/save', function (req, res) {
  var id = req.body.id;
  var mp3_url = req.body.mp3;
  fs.readFile(path.join('db', id + '.json'), function (err, json) {
    if (err) return res.status(500).send(err.toString());
    try {
      json = JSON.parse(json);
      json.mp3 = mp3_url;
      fs.writeFile(path.join('db', id + '.json'), JSON.stringify(json), function (err) {
        if (err) return res.status(500).send(err.toString());
        res.send('');
      });
    } catch (ex) {
      return res.status(500).send(ex.toString());
    }
  });
});

var server = http.createServer(app);
reload(server, app, 250);
var listen_addr = process.env.LISTEN || 8000;
server.listen(listen_addr, function () {
  console.log('Express server listening on port ' + listen_addr);
});

