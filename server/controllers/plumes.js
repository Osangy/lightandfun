const Plume = require('../models').Plume;
const utils = require('../../utils');
const moment = require('moment');
const Promise = require('bluebird');

module.exports = {
	add(userId, type) {
		console.log(userId);
    let plumes = 0;
    const month = moment().format('MMMM');
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

		// Create plume records for entering weight and the success
    return Plume.bulkCreate([{
			userId: userId,
      plumes,
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
	}
};
