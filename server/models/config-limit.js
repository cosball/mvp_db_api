'use strict';

module.exports = function(Configlimit) {
  Configlimit.disableRemoteMethodByName('patchOrCreate')
  Configlimit.disableRemoteMethodByName('replaceOrCreate')
  Configlimit.disableRemoteMethodByName('upsertWithWhere')
  Configlimit.disableRemoteMethodByName('updateAll')
  Configlimit.disableRemoteMethodByName('createChangeStream')
  Configlimit.disableRemoteMethodByName('prototype.updateAttributes')
};
