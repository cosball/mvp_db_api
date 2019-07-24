'use strict';

var app = require('../../server/server');

module.exports = function(Race) {
  Race.disableRemoteMethodByName('patchOrCreate')
  Race.disableRemoteMethodByName('replaceOrCreate')
  Race.disableRemoteMethodByName('upsertWithWhere')
  Race.disableRemoteMethodByName('updateAll')
  Race.disableRemoteMethodByName('createChangeStream')
  Race.disableRemoteMethodByName('prototype.updateAttributes')

  Race.list = function(cb) {
    Race.find({order:'seq ASC'}, 
      function(err, data) {
        if (err || !data) {
          return cb( null, [] );
        }

        cb( null, data.map(function(ele) {return {value:ele.id, text:ele.name}}));
      }
    );
  }

  Race.remoteMethod('list', {
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
