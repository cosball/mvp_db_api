'use strict';

module.exports = function(Translog) {
  Translog.disableRemoteMethodByName('patchOrCreate')
  Translog.disableRemoteMethodByName('replaceOrCreate')
  Translog.disableRemoteMethodByName('upsertWithWhere')
  Translog.disableRemoteMethodByName('updateAll')
  Translog.disableRemoteMethodByName('createChangeStream')
  Translog.disableRemoteMethodByName('prototype.updateAttributes')
};
