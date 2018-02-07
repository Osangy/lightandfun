const WeightRecord = require('../models').WeightRecord;
const moment = require('moment');
const utils = require('../../utils');
const Promise = require('bluebird');

module.exports = {
	//Create a new user
	create(userId, weight) {
		return WeightRecord.create({
			userId,
			weight
		});
	},

	addPhotoToLastWeight(userId, loss_photo_url) {
		return WeightRecord.update(
			{
				loss_photo_url
			},
			{
				where: { userId },
				returning: true
			}
		);
	},

	getLastWeightRecords(userId, nb){
		return WeightRecord.findAll({
			where: {
				userId
			},
			order:[
				['createdAt', 'DESC']
			],
			limit: nb
		});
	}
};
