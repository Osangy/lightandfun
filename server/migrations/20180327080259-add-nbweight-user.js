'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
			'Users',
			'nb_weight', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
		);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'nb_weight');
  }
};
