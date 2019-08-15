// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var svgCaptcha = require('svg-captcha');
var encryption = require('./encryption');

var loopback = require('loopback');
var boot = require('loopback-boot');

var http = require('http');
var https = require('https');
var config = require('./config.json');
var app = module.exports = loopback();

// boot scripts mount components like REST API
boot(app, __dirname);

app.start = function() {

  var server = null;

  if (!config.http) {
    var sslConfig = require('./ssl-config');
    var options = {
      key: sslConfig.privateKey,
      cert: sslConfig.certificate,
      ca: sslConfig.ca
    };
    server = https.createServer(options, app);
  } else {
    server = http.createServer(app);
  }
  server.listen(app.get('port'), function() {
    var baseUrl = (config.http ? 'http://' : 'https://') + app.get('host') + ':' + app.get('port');
    app.emit('started', baseUrl);
    console.log('LoopBack server listening @ %s%s', baseUrl, '/');
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
  return server;
};

app.use('/api/captcha', function (req, res) {
  svgCaptcha.options
  var captcha = svgCaptcha.create({size: 4, noise: 2, background: 'white', width: 150, height: 50});
  // req.session.captcha = captcha.text;
  
  var text = encryption.encrypt(JSON.stringify(captcha, null, 2).replace(/(\r\n|\n|\r)/g, "").replace(/"/g, '\"'));

  // console.log(text);
  res.type('text');
  res.status(200).send(text);
});

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}