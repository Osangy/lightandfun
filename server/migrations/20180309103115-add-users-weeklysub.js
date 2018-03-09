'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
			'Users',
			'weekly_sub', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
		);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'weekly_sub');
  }
};
