'use strict';

module.exports = function(Transaccess) {
  Transaccess.disableRemoteMethodByName('patchOrCreate')
  Transaccess.disableRemoteMethodByName('replaceOrCreate')
  Transaccess.disableRemoteMethodByName('upsertWithWhere')
  Transaccess.disableRemoteMethodByName('updateAll')
  Transaccess.disableRemoteMethodByName('createChangeStream')
  Transaccess.disableRemoteMethodByName('prototype.updateAttributes')
};
