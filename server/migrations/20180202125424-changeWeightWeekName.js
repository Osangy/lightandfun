'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.renameTable('WeightWeeks', 'WeightRecords');
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.renameTable('WeightRecords', 'WeightWeeks');
	}
};
