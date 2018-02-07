'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn(
			'WeightRecords',
			'loss_photo_url',
			Sequelize.STRING
		);
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.removeColumn('WeightRecords', 'loss_photo_url');
	}
};
