'use strict';

module.exports = function(Institution) {
  Institution.disableRemoteMethodByName('patchOrCreate')
  Institution.disableRemoteMethodByName('replaceOrCreate')
  Institution.disableRemoteMethodByName('upsertWithWhere')
  Institution.disableRemoteMethodByName('updateAll')
  Institution.disableRemoteMethodByName('createChangeStream')
  Institution.disableRemoteMethodByName('prototype.updateAttributes')
  Institution.disableRemoteMethodByName('prototype.__findById__users');   
  Institution.disableRemoteMethodByName('prototype.__updateById__users'); 
  Institution.disableRemoteMethodByName('prototype.__destroyById__users');  
  Institution.disableRemoteMethodByName('prototype.updateAttributes')
  Institution.disableRemoteMethodByName('prototype.__findById__skindata');   
  Institution.disableRemoteMethodByName('prototype.__updateById__skindata'); 
  Institution.disableRemoteMethodByName('prototype.__destroyById__skindata');
  Institution.disableRemoteMethodByName('prototype.__findById__transLogs');   
  Institution.disableRemoteMethodByName('prototype.__updateById__transLogs'); 
  Institution.disableRemoteMethodByName('prototype.__destroyById__transLogs');  
};
