// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';


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

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}