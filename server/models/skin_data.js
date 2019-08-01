'use strict';
var app = require('../../server/server');
var moment = require('moment');

module.exports = function (SkinData) {
	SkinData.disableRemoteMethodByName('patchOrCreate')
	SkinData.disableRemoteMethodByName('replaceOrCreate')
	SkinData.disableRemoteMethodByName('upsertWithWhere')
	SkinData.disableRemoteMethodByName('updateAll')
	SkinData.disableRemoteMethodByName('createChangeStream')
	//SkinData.disableRemoteMethodByName('prototype.updateAttributes')

	console.log("App =", app)
	var Translog = app.models.transLog;
	console.log("Translog model =", Translog)

	SkinData.dashboard = function (noOfDays, cb) {

		var noDays = noOfDays && noOfDays > 6 ? noOfDays : 7;

		var dashboardData = {
			enteredDaily: {
				date: [],
				count: []
			}
		}

		var promiseArr = [];
		var today = new Date();
		for (var i = 0; i < noDays; i++) {
			var promise = new Promise((resolve, reject) => {
				var date = new Date();
				date.setDate(today.getDate() - i);

				var year = date.getFullYear();
				var month = date.getMonth();
				var day = date.getDate();

				var where = {
					and:
						[
							{ createdAt: { gte: new Date(year, month, day, 0, 0, 0, 0) } },
							{ createdAt: { lt: new Date(year, month, day, 23, 59, 59, 999) } }
						]
				};

				SkinData.count(where, function (err, count) {
					if (err) {
						resolve([moment(date).format('YYYY-MM-DD'), 0]);
					}
					else {
						resolve([moment(date).format('YYYY-MM-DD'), count]);
					}
				});
			});

			promiseArr.push(promise);
		}

		Promise.all(promiseArr)
			.then(function (values) {
				for (const [index, data] of values.entries()) {
					dashboardData.enteredDaily.date.push(data[0])
					dashboardData.enteredDaily.count.push(data[1])
				}

				cb(null, dashboardData);
			});
	}
	SkinData.remoteMethod(
		'dashboard',
		{
			description: 'Gets Dashboard data',
			accepts: [
				{ arg: 'noOfDays', type: 'number' }
			],
			returns: {
				arg: 'dashboardData', type: 'object', root: true,
				description: 'Returns the dashboard data',
			},
			http: { verb: 'get' },
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

