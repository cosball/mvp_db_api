var path = require('path'),
fs = require("fs");
exports.privateKey = fs.readFileSync('/etc/letsencrypt/live/api.cosnet.io/privkey.pem').toString();
exports.certificate = fs.readFileSync('/etc/letsencrypt/live/api.cosnet.io/cert.pem').toString();
exports.ca = [fs.readFileSync('/etc/letsencrypt/live/api.cosnet.io/fullchain.pem').toString()];

