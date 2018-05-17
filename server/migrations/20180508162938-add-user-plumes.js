'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
			'Users',
			'plumes', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
		);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'plumes');
  }
};
