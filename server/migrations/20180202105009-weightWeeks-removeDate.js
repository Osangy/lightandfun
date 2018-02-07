'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.removeColumn('WeightWeeks', 'date');
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.addColumn('WeightWeeks', 'date', {
			type: Sequelize.DATE,
			allowNull: false,
			defaultValue: Sequelize.NOW
		});
	}
};
