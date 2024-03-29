const User = require('../models').User;
const Op = require('../models').Sequelize.Op;
const utils = require('../../utils');
const Promise = require('bluebird');

module.exports = {
	get(messengerid) {
		return User.findOne({
			where: {
				messengerid
			}
		});
	},

	//Create a new user
	create(messengerid, firstName, lastName) {
		return User.create({
			messengerid: messengerid,
			firstName: firstName,
			lastName: lastName
		});
	},

	//Init main infos of the user when doing the give_calories funnel
	initInfos(messengerid, gender, age, weight, size, activity) {
		return User.update(
			{
				gender,
				age,
				weight,
				activity: utils.enumActivity(activity),
				size
			},
			{
				where: { messengerid },
				returning: true
			}
		);
	},

	setWeightTime(messengerid, weightTime) {
		return User.update(
			{
				weightTime
			},
			{
				where: { messengerid },
				returning: true
			}
		);
	},

	updateWeight(messengerid, weight, nb_weight) {
		return User.update(
			{
				weight,
				nb_weight
			},
			{
				where: { messengerid },
				returning: true
			}
		);
	},

	subWeekly(messengerid) {
		return User.update(
			{
				weekly_sub: true
			},
			{
				where: { messengerid }
			}
		)
	},

	//
	addSize(messengerid, size) {
		return User.update(
			{
				size
			},
			{
				where: { messengerid },
				returning: true
			}
		);
	},

	findUsersIn(ids){
		return User.findAll({
			where: {
				id: {
					[Op.or] : ids
				}
			}
		})
	}
};
