const Plume = require('../models').Plume;
const sequelize = require('../models').sequelize;
const utils = require('../../utils');
const moment = require('moment');
const Promise = require('bluebird');

module.exports = {
	add(userId, type) {
    const month = moment().format('MMMM');

		// Create plume records for entering weight and the success
    return Plume.bulkCreate([{
			userId: userId,
      plumes: this.howManyPlumes(type),
      month,
      type
    },{
			userId: userId,
			plumes: 1,
			month,
			type: 0
		}]);
	},

	getPlumesFromMonth(userId, month){
		return Plume.findAll({
			where: {
				userId,
				month
			}
		});
	},

	getSumPlumesForMonth(userId, month){
		return new Promise((resolve, reject) => {
			sequelize.query("SELECT SUM(plumes) FROM \"Plumes\" WHERE month = ? AND \"userId\" = ? GROUP BY \"userId\"", {replacements: [month, userId],  type: sequelize.QueryTypes.SELECT}).then(sums => {
				if(!sums) reject(new Error("No sum found"))
				else if(sums.length == 0) resolve(0);
				else resolve(sums[0].sum);
			}).catch(err => reject(err));
		})
	},

	howManyPlumes(type){
		let plumes = 0;
		switch (type) {
      //enter weight
      case 0:
        plumes = 1;
        break;
      //loose less than 300 grammes
      case 1:
        plumes = 3;
        break;
      //loose more than 300 grammes
      case 2:
        plumes = 5;
        break;
      //gain less than 300 grammes
      case 3:
        plumes = -1;
        break;
      //gain more than 300 grammes
      case 4:
        plumes = -3;
        break;
      // first time he enters his weight
      case 5:
        plumes = 1;
        break;
      default:
        plumes = 0;
    }

		return plumes;
	},

	getPlumesSumsForMonth(month){
		return sequelize.query("SELECT \"userId\", SUM(plumes) FROM \"Plumes\" WHERE month = ? GROUP BY \"userId\"", {replacements: [month],  type: sequelize.QueryTypes.SELECT});
	},

	getPercentilesForMonth(month){
		return new Promise((resolve, reject) => {
			this.getPlumesSumsForMonth(month).then(sums => {
		    let onlySums = [];
		    sums.forEach(sumObj => {
		      onlySums.push(parseInt(sumObj.sum));
		    })
				console.log(onlySums);
				resolve(utils.calculatePercentiles(onlySums));
		  })
		  .catch(err => {
				reject(err);
		  });
		})
	}
};
