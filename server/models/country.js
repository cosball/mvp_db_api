'use strict';

var app = require('../../server/server');

module.exports = function(Country) {
  Country.disableRemoteMethodByName('patchOrCreate')
  Country.disableRemoteMethodByName('replaceOrCreate')
  Country.disableRemoteMethodByName('upsertWithWhere')
  Country.disableRemoteMethodByName('updateAll')
  Country.disableRemoteMethodByName('createChangeStream')
  Country.disableRemoteMethodByName('prototype.updateAttributes')

  Country.list = function(cb) {
    Country.find({fields:'name', order:'seq ASC'}, 
      function(err, data) {
        if (err || !data) {
          return cb( null, [] );
        }

        cb( null, data.map(function(ele) {return {value:ele.name, text:ele.name}}));
      }
    );
  }

  Country.remoteMethod('list', {
      http: {
        path: '/list',
        verb: 'get'
      },
      returns: {
        arg: 'data',
        type: 'array'
      }
  });
};
