module.exports = {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('WeightWeeks', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			date: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW
			},
			weight: {
				type: Sequelize.FLOAT,
				allowNull: false
			},
			userId: {
				type: Sequelize.INTEGER,
				onDelete: 'CASCADE',
				references: {
					model: 'Users',
					key: 'id',
					as: 'userId'
				}
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		}),
	down: (queryInterface /*, Sequelize*/) =>
		queryInterface.dropTable('WeightWeeks')
};
