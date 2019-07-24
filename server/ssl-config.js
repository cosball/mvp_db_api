var path = require('path'),
fs = require("fs");
exports.privateKey = fs.readFileSync('/etc/letsencrypt/live/api.mvp.cosnet.io/privkey.pem').toString();
exports.certificate = fs.readFileSync('/etc/letsencrypt/live/api.mvp.cosnet.io/cert.pem').toString();
exports.ca = [fs.readFileSync('/etc/letsencrypt/live/api.mvp.cosnet.io/fullchain.pem').toString()];

