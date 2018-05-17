'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
			'Users',
			'frame', {
        type: Sequelize.STRING,
        defaultValue: 'normale'
      }
		);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'frame');
  }
};
