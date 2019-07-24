'use strict';
var app = require('../../server/server');

module.exports = function(SkinData) {
  SkinData.disableRemoteMethodByName('patchOrCreate')
  SkinData.disableRemoteMethodByName('replaceOrCreate')
  SkinData.disableRemoteMethodByName('upsertWithWhere')
  SkinData.disableRemoteMethodByName('updateAll')
  SkinData.disableRemoteMethodByName('createChangeStream')
  //SkinData.disableRemoteMethodByName('prototype.updateAttributes')

  console.log("App =",app)
  var Translog = app.models.transLog;
  console.log("Translog model =", Translog)

	SkinData.dashboard = function(institutionId, cb) {

		var dashboardData = {
			blacklists: 0,   
			blacklistsPerType: { BTC: 0, ETH: 0, XRP: 0, LTC: 0, BCH: 0, others: 0 },  
			transChecked: 0,
			transCheckedPerType: { BTC: 0, ETH: 0, XRP: 0, LTC: 0, BCH: 0, others: 0 },  	
			blacklistsPerPeriod: { daily: 0, weekly: 0, monthly: 0 } 
		}
		
		var ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
		var ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
		var ONE_DAY = 1 * 24 * 60 * 60 * 1000;

		console.log(institutionId)
		var where = {}
		var where_check = {}

		if (institutionId == '' || institutionId == undefined) {
			where = {status : 1, flag: "C"};
			where_check = {transactionType: "CheckAddress", result: "SUCCESS"};
		}
		else {
			where = {status : 1, flag: "C", institutionId: institutionId};
			where_check = {transactionType: "CheckAddress", result: "SUCCESS", institutionId: institutionId}
		}

		var where_day = JSON.parse(JSON.stringify(where));
		var where_week = JSON.parse(JSON.stringify(where));
		var where_month = JSON.parse(JSON.stringify(where));

		var dt1 = new Date();
		var dt7 = new Date();
		var dt30 = new Date();

		dt1.setDate(dt1.getDate() - 1)
		dt7.setDate(dt7.getDate() - 7)
		dt30.setDate(dt30.getDate() - 30)

		where_day.createdAt = { gt: dt1 };
		//dt.setDate(dt.getDate() - 6)
		where_week.createdAt = { gt: dt7 };
		//dt.setDate(dt.getDate() - 23)		
		where_month.createdAt = { gt: dt30 };

		console.log("where_day = ", where_day);
		console.log("where_week = ", where_week);
		console.log("where_month = ", where_month);
		console.log("where = ", where);


		SkinData.count(where, function(err, blacklists) { 
			if (err) {return cb(err)};
			console.log("SkinDatas = ", blacklists)
			dashboardData.blacklists = blacklists;
			where.addressType = 'BTC';

			SkinData.count(where, function(err, btclists) { 
				if (err) {return cb(err)};

				dashboardData.blacklistsPerType.BTC = btclists;
				where.addressType = 'ETH';

				SkinData.count(where, function(err, ethlists) { 
					if (err) {return cb(err)};

					dashboardData.blacklistsPerType.ETH = ethlists;
					where.addressType = 'XRP';
					
					SkinData.count(where, function(err, xrplists) { 
						if (err) {return cb(err)};

						dashboardData.blacklistsPerType.XRP = xrplists;
						where.addressType = 'LTC';

						SkinData.count(where, function(err, ltclists) { 
							if (err) {return cb(err)};

							dashboardData.blacklistsPerType.LTC = ltclists;
							where.addressType = 'BCH';

							SkinData.count(where, function(err, bchlists) { 
								if (err) {return cb(err)};

								dashboardData.blacklistsPerType.BCH = bchlists;
								dashboardData.blacklistsPerType.others = dashboardData.blacklists - dashboardData.blacklistsPerType.BTC - dashboardData.blacklistsPerType.ETH -
																		 dashboardData.blacklistsPerType.XRP - dashboardData.blacklistsPerType.LTC - dashboardData.blacklistsPerType.BCH;

								SkinData.count(where_day, function(err, daylists) { 
									if (err) {return cb(err)};
									dashboardData.blacklistsPerPeriod.daily = daylists;
									SkinData.count(where_week, function(err, weeklists) { 
										if (err) {return cb(err)};
										dashboardData.blacklistsPerPeriod.weekly = weeklists;
										SkinData.count(where_month, function(err, monthlists) { 
											if (err) {return cb(err)};
											dashboardData.blacklistsPerPeriod.monthly = monthlists;
											var Translog = app.models.transLog;
  											console.log("Translog model =", Translog)
  											console.log(where_check)
											Translog.count(where_check, function(err, translogs) { 
												if (err) {return cb(err)};
												console.log("Translogs = ", translogs)
												dashboardData.transChecked = translogs;
												where_check.addressType = 'BTC';
												console.log(where_check)
												Translog.count(where_check, function(err, btclogs) { 
													if (err) {return cb(err)};
													dashboardData.transCheckedPerType.BTC = btclogs;
													where_check.addressType = 'ETH';
													console.log(where_check)

													Translog.count(where_check, function(err, ethlogs) { 
														if (err) {return cb(err)};
														dashboardData.transCheckedPerType.ETH = ethlogs;
														where_check.addressType = 'XRP';
														console.log(where_check)
														Translog.count(where_check, function(err, xrplogs) { 
															if (err) {return cb(err)};

															dashboardData.transCheckedPerType.XRP = xrplogs;
															where_check.addressType = 'LTC';
															console.log(where_check)

															Translog.count(where_check, function(err, ltclogs) { 
																if (err) {return cb(err)};

																dashboardData.transCheckedPerType.LTC = ltclogs;
																where_check.addressType = 'BCH';
																console.log(where_check)

																Translog.count(where_check, function(err, bchlogs) { 
																	if (err) {return cb(err)};

																	dashboardData.transCheckedPerType.BCH = bchlogs;
																	dashboardData.transCheckedPerType.others = dashboardData.transChecked - dashboardData.transCheckedPerType.BTC - dashboardData.transCheckedPerType.ETH -
																											 dashboardData.transCheckedPerType.XRP - dashboardData.transCheckedPerType.LTC - dashboardData.transCheckedPerType.BCH;
						 											console.log(dashboardData)
										    						cb(null, dashboardData);											 							
																});										
															});
														});
													});

												});
											});																						 
										});																						 
									});				
								});										
							});				
						});				
					});
				});
			});			
		});
 	}
	SkinData.remoteMethod(
	  'dashboard',
	  {
	    description: 'Gets Dashboard data',
	    accepts: [
	      {arg: 'institutionId', type: 'string'}
	    ],
	    returns: {
	      arg: 'dashboardData', type: 'object', root: true,
	      description: 'Returns the dashboard data',
	    },
	    http: {verb: 'get'},
	  }
	);
}
/*
	SkinData.remoteMethod(
	  'dashboard',
	  {
	    description: 'Gets Dashboard data',
	    accepts: [
	      {arg: 'institutionId', type: 'object', http: {source: 'body'}}
	    ],
	    returns: {
	      arg: 'dashboardData', type: 'object', root: true,
	      description: 'Returns the dashboard data',
	    },
	    http: {verb: 'get'},
	  }
	);
*/

